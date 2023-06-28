const fs                = require('fs');
const getOrderDetail    = require('./utils/athena/detail')
const getOrderTag       = require('./utils/athena/tag')
const getOrderList      = require('./utils/athena/list')

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
    "Japan"  :  "APAC",
    "SEA-AU" :  "APAC",
    "SEA-ID" :  "APAC",
    "OUTBOUND-HK"   : "APAC",


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

        // const tag = await getOrderTag(order_id);
        // const detail = await getOrderDetail(order_id);
        // let body = await buildBody( detail,  tag);

        let [detail, tag] = await Promise.all([getOrderDetail(order_id), getOrderTag(order_id)])

        // console.log(tag)

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

async function buildBody(detail, tag){
    let   blocker   = '';
    let   feedback  = '';
    let   dropoff   = '';
    let   summary   = '';
    let   conclusion = '';
    let   insights  = '';
    let   status    = '';



    /** Tags map to Status */
    let tags =  tag.map(t=>t.name)
    if(detail.status != 3) {
        status = "In-Progress"; // Ticket is still open, we consider this as in-progress
    } else {
        if(tags.includes('Open Status')) {
            status = 'Unknown'
        } else if(tags.includes("Out of Scope")) {
            status = "Out of Scope"
        } else if (tags.includes("Closed  - With Successful Adoption")) {
            status = "Successful Adoption"
        } else if (tags.includes('Closed  - No Adoption Improvement')) {
            status = "No Adoption"
            const dropoff_tag = tag.find(t => t.name === "Closed  - No Adoption Improvement");
            if(dropoff_tag) {
                dropoff = dropoff_tag.sub_tags[0].name  // By default, it's assumed that there is only one sub tag
            }
        } else if(tags.includes("Completed - Optimal") || tags.includes("Completed - Not Optimal")) {
            status = "Successful Adoption"
        } else if(tags.includes("Question Answered")  ) {
            status = "No Adoption"
        }  else  {
            status = "Client Dropoff"
        }
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
    const country = detail.items.filter(r => regionLables.includes(r.label)).pop().content;

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
    } else if( country.includes("NORTHAMERICA-")) {
        region = "NA"
    } else if (country.includes("LATAM-")) {
        region = "LATAM"
    } else if (country.includes("OUTBOUND-")) {
        region = "CNOB"
    }

    /** Current Follower */
    const follower = detail.follower;


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
    const replies =  detail.replies;
    let is_copitch        = "No"

    if(replies) {
        for(let k = 0; k < replies.length; k++) {
            const reply = replies[k];
            const reply_time = (new Date(reply.create_time*1000)).toISOString().split('T')[0];
            const items = reply.items.filter(x => x.type == 6);

            for(let j = 0; j < items.length; j++) {
                const item = items[j];
                if(item.content.toLowerCase().includes("copitch request")) {
                    is_copitch = "Yes";
                    break;
                }
            }
        }
    } 

    /** Priority */
    let priority = "P" + detail.priority;

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
        status,
        country,
        region,
        follower,
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


