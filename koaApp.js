const fs                = require('fs');
const token             = require('./utils/athena/cookie')
const getPixelConfig    = require('./utils/pixel/config')
const getOrderDetail    = require('./utils/athena/detail')
const getOrderTag       = require('./utils/athena/tag')
const getOrderList      = require('./utils/athena/list')
const APAC_LIST         = require('./utils/athena/GBS_APAC_HITLIST')
const extractClass          = require('./utils/report/class')
const extractCountry        = require('./utils/report/country')
const extractRegion         = require('./utils/report/region')
const extractTeam           = require('./utils/report/team')
const extractGBS            = require('./utils/report/gbs')
const extractETA            = require('./utils/report/eta')
const extractStatusUpdate   = require('./utils/report/status_update')
const extractPriority       = require('./utils/report/priority')

const delayms = (ms) => new Promise((res, rej) => {
    setTimeout(res, ms * 1)
})

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

        // let [detail, tag] = await Promise.all([getOrderDetail(order_id), getOrderTag(order_id)])

        let body = await buildBody(order_id);
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

async function buildBody(order_id){
    return ( await buildBodyLocal(order_id) ) || (await buildBodyRemote(order_id))
}

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

async function buildBodyLocal(order_id) {
    const cachePath = `./LocalCache/${order_id}.json`
 
    if(fs.existsSync(cachePath)) {
        const summary = await ((f)=>{
            return new Promise((resolve) => {
                resolve(JSON.parse(fs.readFileSync(f, {encoding:'utf8', flag:'r'})))
            }).catch(err=>{
                console.log('JSON Parse error ' + err)
            })
        })(cachePath)

        const ts_now = Date.now()
        const ts_last = new Date(summary.refresh)

        const REFRESH_INTERVAL = 60
        if(ts_now - ts_last <= 1000 * 60 * REFRESH_INTERVAL) {
            console.log(`Last Refresh is ${summary.refresh}, less than ${REFRESH_INTERVAL}, use Local`)
            return JSON.stringify(summary, null, 2)
        } 
    }

    return null
}

async function buildBodyRemote(order_id){
    let [detail, tags] = await Promise.all([getOrderDetail(order_id), getOrderTag(order_id)])

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
    const cachePath = './LocalCache';
    if (!fs.existsSync(cachePath)){
        fs.mkdirSync(cachePath);
    }
    await fs.writeFileSync(`./LocalCache/${detail.id}.json`, summary);

    /** Return to request */
    return summary
}



async function timerTask() {
    console.log(`>>>>>> Start Timer Refreshing...`)
    await token();
    const cachePath = `./LocalCache`
    if (!fs.existsSync(cachePath)){
        fs.mkdirSync(cachePath);
    }

    const files = fs.readdirSync(cachePath)
    const summaries = []
    for(let i = 0; i < files.length; i++) {
        const filePath = `${cachePath}/${files[i]}`
        if(fs.existsSync(filePath)) {
            const summary = await ((f)=>{
                return new Promise((resolve) => {
                    resolve(JSON.parse(fs.readFileSync(f, {encoding:'utf8', flag:'r'})))
                }).catch(err=>{
                    console.log('JSON Parse error ' + err)
                })
            })(filePath)

            summaries.push(summary)
        }
    }
    // summaries.sort((a,b) => new Date(a.refresh) - new Date(b.refresh))
    summaries.sort((a,b) => a.id - b.id)

    console.log(`summary len = ${summaries.length}`)
    console.log(summaries.map(s => s.refresh))

    for(let i = 0; i < summaries.length; i++) {
        buildBodyRemote(summaries[i].detail.id)
        await delayms(200)
    }
    console.log(`... End Timer Refreshing <<<`)

}

async function init() {
    console.log(`Server Init ---> ${(new Date(Date.now())).toISOString()}`);
    setInterval(timerTask, 1000 * 60 * 45)
}

module.exports = {
  koaApp,
  init,
};