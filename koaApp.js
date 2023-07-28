const fs                = require('fs');
const getOrderDetail    = require('./utils/athena/detail')
const getOrderTag       = require('./utils/athena/tag')
const getOrderList      = require('./utils/athena/list')
const APACP0List         = require('./utils/athena/APAC_P0')
const setPriority       = require('./utils/athena/set_priority')

const getLocal          = require('./localNotes')

const MONTH_MAPPING = {
    "01" : "Jan",
    "02" : "Feb",
    "03" : "Mar",
    "04" : "Apr",
    "05" : "May",
    "06" : "Jun",
    "07" : "Jul",
    "08" : "Aug",
    "09" : "Sept",
    "10" : "Oct",
    "11" : "Nov",
    "12" : "Dec",
}

const REGION_MAPPING = {
    /** EUI */
    "EU-DE" :   "EUI",
    "EU-GB" :   "EUI",
    "EU-IT" :   "EUI",
    "EU-FR" :   "EUI",

    /** METAP */
    "MENA-AE" : "METAP",


    /** NA */
    "NORTH AMERICA" : "NA",

    /** LATAM */
    // "LATAM-BR"      : "LATAM",
    // "LATAM-MX"      : "LATAM",

    /**APAC */
    "Japan"     :  "APAC",
    "JP"        :  "APAC",
    "KR"        :  "APAC",
    "AU"        :  "APAC",

    "SEA-KR"        :  "APAC",
    "SEA-AU"        :  "APAC",
    "SEA-ID"        :  "APAC",
    "OUTBOUND-HK"   :  "APAC",

    /** CNOB */
    "OUTBOUND-CN"   : "CNOB"
}

const Koa = require('koa');
const koaApp = new Koa();
var port = (process.env.PORT ||  80 );

koaApp.use(async (ctx, next) => {
    const rt = ctx.response.get('X-Response-Time');
    console.log(`${ctx.method} ${ctx.url} - ${rt}`);
    await next();
});


// x-response-time
koaApp.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
});


koaApp.use(async (ctx, next) => {
    if (ctx.path === '/detail') {
        let order_id = `${ctx.query.order_id}`

        let [detail, tag] = await Promise.all([getOrderDetail(order_id), getOrderTag(order_id)])

        await auditPriority(detail);
        let body = await buildBody( detail,  tag);

        ctx.body = body
    } else if (ctx.path === '/list') {
        let list = await getOrderList();
        ctx.body = list
    } else if (ctx.path === '/') {
            ctx.body = fs.readFileSync('index.html', {encoding:'utf8', flag:'r'});
    } else {
        ctx.body = 'Hello World: ' + ctx.path;
    }

    next();
})

async function isImplementationAgreed(detail){
    const replies =  detail.replies;
    let isImplAgreed        = "No"
    if(replies) {
        for(let k = 0; k < replies.length; k++) {
            const reply = replies[k];
            const items = reply.items.filter(x => x.type == 6);

            for(let j = 0; j < items.length; j++) {
                const item = items[j];
                if(item.content.toLowerCase().includes("implementation agreed") 
                        || item.content.toLowerCase().includes("so agreed")
                        || item.content.toLowerCase().includes("eapi agreed")) {
                    isImplAgreed = "Yes";
                    break;
                }
            }
        }
    } 
    return isImplAgreed;
}

async function isCoPitchRequested(detail) {
    const replies =  detail.replies;
    let is_copitch        = "No"
    if(replies) {
        for(let k = 0; k < replies.length; k++) {
            const reply = replies[k];
            const items = reply.items.filter(x => x.type == 6);

            for(let j = 0; j < items.length; j++) {
                const item = items[j];
                if(item.content.toLowerCase().includes("co-pitch request") 
                    || item.content.toLowerCase().includes("copitch request")) {
                    is_copitch = "Yes";
                    break;
                }
            }
        }
    } 
    return is_copitch
}

async function getETA(detail){
    const eta_reg   = /(.*)(\[eta=(.*)\])(.*)/m

    const replies  =  detail.replies;
    let eta        = ""
    if(replies) {
        for(let k = 0; k < replies.length; k++) {
            const reply = replies[k];
            const items = reply.items.filter(x => x.type == 6);

            for(let j = 0; j < items.length; j++) {
                const item = items[j];
                const eta_matches = item.content.toLowerCase().match(eta_reg)
                console.log(eta_matches)
                if(eta_matches) {
                    eta = eta_matches[3]
                    if(eta.length > 1) {
                        eta = "2023-" + eta[0] + eta[1] + "-" + eta[2] + eta[3]
                        // console.log(eta)
                    }
                }

                // No break, use last one to override previous ones
            }
        }
    } 
    // console.log(`return eta = ${eta}`)
    return eta
}

async function auditPriority(detail){
    // console.log(detail)
    const priority = detail.priority
    const order_id = detail.id
    // console.log(detail)
    const adv_ids  = detail.items.filter(i => i.label.includes('Ad Account ID')).pop().content;
    console.log(`${order_id } Priority = ${priority}`)
    // console.log(adv_ids)

    let has_p0 = false;
    for(let i = 0; i < adv_ids.length; i++) {
        if(APACP0List.includes(adv_ids[i])) {
            has_p0 = true;
            break;
        }
    }

    if(detail.follower.includes('方是惟')) {
        /** Shiwei will manage the priority manually */
    } else if(priority != 0 && has_p0) {
        // set priority P0
        await setPriority(order_id, 0)
        detail.priority = '0'
        console.log(`Set priority to P0`)
    } else if (priority === 0 && !has_p0) {
        // set priority p2
        await setPriority(order_id, 2)
        detail.priority = '2'
        console.log(`Set priority to P2`)
    } else {

    }
}

async function buildBody(detail, tags){
    let   blocker   = '';
    let   feedback  = '';
    let   dropoff   = '';
    let   summary   = '';
    let   conclusion = '';
    let   insights  = '';
    let   status    = '';

    /** Tags & Status */
    // Tags
    try{
        main_status = ''
        sub_status  = ''
        if(tags && tags.length > 0) {
            // console.log(tags)
            main_status   = tags[0]?.name || ''
            sub_status    = tags[0].sub_tags[0]?.name || main_status
            // console.log(`${main_status} ${sub_status} lololo`)
        }
    } catch(err) {
        throw err
    }


    /** Client Name */
    const client = detail.items.filter(r=> r.label.includes('Client Name') || r.label.includes('Advertiser name')).pop().content;

    /** ADV ID */
    const adv_id = detail.items.filter(r=> r.label.includes('Ad Account ID')).pop().content.toString();
    // if(detail.id == '1031013') {
    //     console.log(`adv_id: `)
    //     console.log(detail.items.filter(r=> r.label.includes('Ad Account ID')).pop().content.toString())
    // }

    /** Country */
    const regionLables = [
        'Region', 'Country / Region', 'Client Region', 'Country/Region', 'GBS Country/Region', "GBS Country / Region"
    ]
    let country = detail.items.filter(r => regionLables.includes(r.label)).pop().content;
    if(country.toLowerCase().includes("-au")) {
        country = "AU"
    } else if(country.toLowerCase().includes('-hk')) {
        country = 'SEA-HK'
    }  else if(country.toLowerCase().includes('taiwan')) {
        country = 'SEA-TW'
    } else if(country.toLowerCase().includes('-kr')) {
        country = 'KR'
    } else if(country.toLowerCase().includes('japan')) {
        country = 'JP'
    } else if(country.toLowerCase().includes('-jp')) {
        country = 'JP'
    }

    /** Adjust wrong country */
    if(`${detail.id}` === '1326137') {
        country = "SEA-SG"
    }  else if(['1350595', '1350588', '1350590', '1350576'].includes(`${detail.id}`)) {
        country = "SEA-SG"
    }   
    else {
        console.log(detail.id)
    }

    /** Region */
    let region = country;
    if(REGION_MAPPING.hasOwnProperty(country)) {
        region = REGION_MAPPING[country]
    } else if(country.includes("EU-")) {
        region = "EUI"
    } else if (country.includes("MENA-")) {
        region = "METAP"
    } else if (country.includes("SEA-")) {
        region = "APAC"
    } else if (country.includes("AU")) {
        region = "APAC"
    } else if( country.includes("NORTHAMERICA-")) {
        region = "NA"
    } else if (country.includes("LATAM-")) {
        region = "LATAM"
    } else if (country.includes("OUTBOUND-")) {
        region = "CNOB"
    }



    /** Current Follower */
    const follower = detail.follower;
    /** Priority */
    let priority = "P" + detail.priority;
    /** GBS  */
    const gbs = 'XYZ';


    /** Ticket Open Time */
    const create_time  = (new Date(detail.create_time*1000)).toISOString().split('T')[0];
    // console.log(create_time.substring(5, 7))
    // console.log(MONTH_MAPPING["04"])
    const create_month = MONTH_MAPPING[create_time.substring(5, 7)]
    /** Ticket Close Time */
    const close_time = (detail.status==3)?((new Date(detail.update_time*1000)).toISOString().split('T')[0]):'';
    const close_month = ' ' + MONTH_MAPPING[close_time.substring(5, 7)]
    /** Ticket Duration */
    const duration = (close_time == '')?'':(((parseInt(detail.update_time)-parseInt(detail.create_time))) / 3600 / 24).toFixed(2)
    // console.log((((parseInt(detail.update_time)-parseInt(detail.create_time))) / 3600 / 24).toFixed(2))

    /** Co-Pitch Requested*/
    let is_copitch = await isCoPitchRequested(detail)

    /** Is Implementation Agreed */
    let isImplAgreed = await isImplementationAgreed(detail)

    /** Get ETA */
    let eta = '' 
    if(isImplAgreed === "Yes") {
        eta =  await getETA(detail)
    } else {
        console.log(`not agreed`)
    }

    /** Status Update */
    let status_notes = ''
    const status_update_reg   = /(.*)(\[Status update\])(.*)/i
    // status_update_reg.ignoreCase = true;
    const replies =  detail.replies;
    if(replies) {
        for(let k = 0; k < replies.length; k++) {
            const reply = replies[k];
            const items = reply.items.filter(x => x.type == 6);
            const reply_time = (new Date(reply.create_time*1000)).toISOString().split('T')[0];


            for(let j = 0; j < items.length; j++) {
                const item = items[j];
                const status_update = item.content.match(status_update_reg)
                if(status_update) {
                    status_notes = `[${reply_time}]` + status_update[3]
                }
            }
        }
    } 
    status_notes =  status_notes.replaceAll('</p>', "").replaceAll('<p>',"")
                                .replaceAll('<ul>', '').replaceAll('</ul>', '')
                                .replaceAll('<br>', '').replaceAll('</br>', '')
                                .replaceAll('<li>', '').replaceAll('</li>', '')
                                .replaceAll('<strong>', '').replaceAll('</strong>', '')
                                .replaceAll('&gt;', ">")
                                .replaceAll('&#39;', "'")
                                .replaceAll("&nbsp;", '')
                                .replace(/(<span )(.*)(>)/m, ' ').replace(/<\/span>/,'')



                                
    /** Append & Replace with Local File */
    const localNotes = []; //await getLocal();
    for(let i = 0; i < localNotes.length; i++) {
        const note = localNotes[i];
        if(note.includes(detail.id)) {
            const items = note.substring(1, note.length-1 ).split('][')
            if(items[1].toLowerCase() == 'blocker') {
                blocker = items[2].trim();
            } else if(items[1].toLowerCase() == 'feedback') {
                feedback = items[2]
            } else if(items[1].toLowerCase() == 'dropoff') {
                dropoff = items[2]
            } else if(items[1].toLowerCase() == 'summary') {
                summary = items[2]
            } else if(items[1].toLowerCase() == 'insights') {
                insights = items[2]
            }
        }
    }



    /** Return to request */
    return JSON.stringify({
        refresh: (new Date(Date.now())).toISOString().substring(0,19) + 'Z',
        client,
        adv_id,
        is_copitch,
        priority,
        main_status,
        sub_status,
        country,
        region,
        follower,
        gbs,
        isImplAgreed,
        eta,
        status_notes,
        create_time,
        create_month,
        close_time,
        close_month,
        duration,
        



        delimeter: "------------------------------------------------",
        detail : (process.env.PLATFORM == 'FAAS')?"omitted":detail
    }, null, 2)
}

async function init() {
    console.log(`Server Init ---> ${(new Date(Date.now())).toISOString()}`);
}

module.exports = {
  koaApp,
  init,
};


