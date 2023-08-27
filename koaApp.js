const fs                = require('fs');
const getPixelConfig    = require('./utils/pixel/config')
const getOrderDetail    = require('./utils/athena/detail')
const getOrderTag       = require('./utils/athena/tag')
const getOrderList      = require('./utils/athena/list')
const APAC_LIST         = require('./utils/athena/GBS_APAC_HITLIST')
const setPriority       = require('./utils/athena/set_priority')
const extractClass          = require('./utils/report/class')
const extractCountry        = require('./utils/report/country')
const extractRegion         = require('./utils/report/region')
const extractTeam           = require('./utils/report/team')
const extractGBS            = require('./utils/report/gbs')
const extractETA            = require('./utils/report/eta')
const extractStatusUpdate   = require('./utils/report/status_update')
const extractPriority       = require('./utils/report/priority')

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


const Koa = require('koa');
const koaApp = new Koa();
var port = (process.env.PORT ||  80 );

koaApp.use(async (ctx, next) => {
    await next();
    const rt = ctx.response.get('X-Response-Time');
    console.log(`${ctx.method} ${ctx.url} - ${rt} \n\n`);
    console.log('-------------------------------------------------------------------')
});

// x-response-time
koaApp.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
});

koaApp.use(async (ctx, next) => {
    console.log('-------------------------------------------------------------------')
    if (ctx.path === '/detail') {
        let order_id = `${ctx.query.order_id}`
        console.log(`>>>>>> Processing ${order_id} >>>>>>`)

        let [detail, tag] = await Promise.all([getOrderDetail(order_id), getOrderTag(order_id)])

        // await auditPriority(detail);
        let body = await buildBodyRemote( detail, tag);
        console.log("\n")

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


async function auditPriority(detail){
    const priority = detail.priority
    const order_id = detail.id
    const adv_id = require('./utils/report/adv_id')(detail)
    console.log(`${order_id }, Adv_id=${adv_id} Priority = ${priority}`)

    let gbsPriority = 3
    if(APAC_LIST.hasOwnProperty(adv_id)) {
        let hitlistPriority = APAC_LIST[adv_id].priority
        console.log(`${hitlistPriority} ${gbsPriority}`)
        if(hitlistPriority < gbsPriority) {
            gbsPriority = hitlistPriority
        }
    }

    console.log(`GBS Priority = ${gbsPriority} Athena Priority = ${priority}`)
    if(priority !== gbsPriority) {
        await setPriority(order_id, gbsPriority)
        detail.priority = gbsPriority
    }
}

async function buildBodyRemote(detail, tags){
    const replies = detail.replies;

    /** Tags & Status */
    const ticketStatus = require('./utils/report/status')(tags)

    /** Client Name */
    const client = detail.items.filter(r=> r.label.includes('Client Name') || r.label.includes('Advertiser name')).pop().content;

    /** ADV ID */
    let adv_id = require('./utils/report/adv_id')(detail)
    detail.adv_id = adv_id

    /** Pixel ID */
    let pixel_id = require('./utils/report/pixel')(detail)

    /** AAM & 1P Cookie */
    let pixelCfg = {}
    if(pixel_id !== '' ) {
        pixelCfg = await getPixelConfig(pixel_id)
    }
    const aam_enable    = pixelCfg.aam_enable
    const cookie_enable = pixelCfg.cookie_enable
 

    /** Pixel O / eAPI O */
    const SO = require('./utils/report/signal')(detail)
    // console.log(`SO=${SO}`)
    const pixel_optimal = SO.pixel_o;
    const eapi_optimal = SO.eapi_o;
 

    /** Website */
    let website = ''
    try {
        website = detail.items.filter(r=> r.label.includes('Website URL')).pop()?.content.toString();
    } catch (err) {
        console.log(err)
    }
 
    /** class Name - CNOB only */
    const className = extractClass(detail)

    /** Country */
    const country = extractCountry(detail)
 
    /** Region */
    const region =  extractRegion(country)
 
    /** GBS Team */
    const team = extractTeam(adv_id)
 
    /** Ticket Requester */
    const owner_name = detail.owner_name;
    /** GBS  */
    let gbs = ''
    // let sales = extractGBS(detail).sales
    // let cst   = extractGBS(detail).cst
    let sales = ""
    let cst   = ""
 
    /** Current Follower */
    const follower = detail.follower;
    /** Priority */
    let priority = await extractPriority(detail)

    /** Ticket Open Time */
    const create_time  = (new Date(detail.create_time*1000)).toISOString().split('T')[0];
    const create_month = MONTH_MAPPING[create_time.substring(5, 7)]
    /** Ticket Close Time */
    const close_time = (detail.status==3)?((new Date(detail.update_time*1000)).toISOString().split('T')[0]):'';
    const close_month = (close_time==="")?(""):(' ' + MONTH_MAPPING[close_time.substring(5, 7)])
    /** Ticket Duration */
    const duration = (close_time == '')?'':(((parseInt(detail.update_time)-parseInt(detail.create_time))) / 3600 / 24).toFixed(2)

    /** Co-Pitch Requested*/
    let is_copitch = await isCoPitchRequested(detail)
 
    /** Is Adv Shopify */
    const eapi_method_regex =   /(.*)(\[method=(.*)\])(.*)/i
    // const replies =  detail.replies;
    let eapi_method = ""
    if(replies) {
        for(let k = 0; k < replies.length; k++) {
            const reply = replies[k];
            const items = reply.items.filter(x => x.type == 6);

            for(let j = 0; j < items.length; j++) {
                const item = items[j];
                const matches = item.content.match(eapi_method_regex)
                if(matches) {
                    // console.log(shopify_flag)
                    eapi_method = matches[3]
                    break
                }
            }
        }
    }

    /** Is Implementation Agreed */
    let isImplAgreed = await isImplementationAgreed(detail)

    /** Get ETA */
    let eta = extractETA(detail)
 
    /** Status Update */
    let status_notes = extractStatusUpdate(detail)                            

    const summary = JSON.stringify({
        refresh: (new Date(Date.now())).toISOString().substring(0,19) + 'Z',
        client,
        adv_id,
        is_copitch,
        priority,
        main_status : ticketStatus.main_status,
        sub_status  : ticketStatus.sub_status,
        country,
        region,
        follower,
        gbs,
        sales,
        cst,
        owner_name,
        isImplAgreed,
        eapi_method,
        eta,
        status_notes,
        create_time,
        create_month,
        close_time,
        close_month,
        duration,
        pixel_id,
        website,
        aam_enable,
        cookie_enable,
        className,
        team,
        pixel_optimal,
        eapi_optimal,
         

        delimeter: "------------------------------------------------",
        detail : (process.env.PLATFORM in ['FAAS', 'AppService', 'BitBase', 'VM'])?"omitted":detail
    }, null, 2)

    /** Save a copy to LocalCache */
    await fs.writeFileSync(`./LocalCache/${detail.id}.json`, summary);

    /** Return to request */
    return summary
}

async function init() {
    console.log(`Server Init ---> ${(new Date(Date.now())).toISOString()}`);
}

module.exports = {
  koaApp,
  init,
};