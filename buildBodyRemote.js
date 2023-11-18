const fs = require('fs')
const getOrderDetail    = require('./utils/athena/detail')
const getOrderTag       = require('./utils/athena/tag')
const getOrderList      = require('./utils/athena/list')
const APAC_LIST         = require('./utils/athena/GBS_APAC_HITLIST')
const extractClass          = require('./utils/report/class')
const extractCountry        = require('./utils/report/country')
const extractRegion         = require('./utils/report/region')
const extractTeam           = require('./utils/report/team')
const extractAcct           = require('./utils/report/acct_id')
const extractGBS            = require('./utils/report/gbs')
const extractETA            = require('./utils/report/eta')
const extractStatusUpdate   = require('./utils/report/status_update')
const extractPriority       = require('./utils/report/priority')
const extractPlatform       = require('./utils/report/platform')
  
const getPixelConfig    = require('./utils/pixel/config')
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

async function buildBodyRemote(order_id){
    let [detail, tags] = await Promise.all([getOrderDetail(order_id), getOrderTag(order_id)])
    // console.log(detail)

    if(detail === undefined || tags === undefined) {
        return null
    } else {
        // console.log(detail)
    }

    const replies = detail.replies;

    /** Tags & Status */
    const ticketStatus = require('./utils/report/status')(tags)

    /** Client Name */
    const client = detail.items.filter(r=> r.label.includes('Client Name') || r.label.includes('Advertiser name')).pop()?.content || ""

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
    let  website = detail.items.filter(r=> r.label.includes('Website URL')).pop()?.content.toString() || ""
 
 
    /** class Name - CNOB only */
    const className = extractClass(detail)

    /** Country */
    const country = extractCountry(detail)
 
    /** Region */
    const region =  extractRegion(country)
 

 
    /** Ticket Requester */
    const owner_name = detail.owner_name;
    /** GBS  */
    let gbs = extractGBS(detail).sales
    // let sales = extractGBS(detail).sales
    // let cst   = extractGBS(detail).cst
    let sales = ""
    let cst   = ""
 
    /** GBS Team */
    const team = extractTeam(adv_id)
    const acct_id = extractAcct(adv_id)
    // console.log(`adv_id = ${adv_id} acct = ${acct_id}`)
    const cnob_team = require('./Mapping/cnob_gbs_team')[gbs.trim()]

    /** Current Follower */
    const follower = detail.follower;
    /** Priority */
    let priority = await extractPriority(detail, region)
    console.log(`${detail.id} priority = ${priority}`)

     

    /** Ticket Open Time */
    const create_time  = (new Date(detail.create_time*1000)).toISOString().split('T')[0];
    const create_month = MONTH_MAPPING[create_time.substring(5, 7)]
    /** Ticket Update Time */
    const update_time  = detail.update_time;
    /** Ticket Close Time */
    const close_time = (detail.status==3)?((new Date(detail.update_time*1000)).toISOString().split('T')[0]):'';
    const close_month = (close_time==="")?(""):(' ' + MONTH_MAPPING[close_time.substring(5, 7)])
    /** Ticket Duration */
    const duration = (close_time == '')?'':(((parseInt(detail.update_time)-parseInt(detail.create_time))) / 3600 / 24).toFixed(2)

    /** Co-Pitch Requested*/
    let is_copitch = await isCoPitchRequested(detail)
 
    /** Is Adv Shopify */

    let eapi_method = await extractPlatform(detail)

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
        acct_id,
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
        cnob_team,
        owner_name,
        isImplAgreed,
        eapi_method,
        eta,
        status_notes,
        create_time,
        create_month,
        update_time,
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
        // detail : (process.env.PLATFORM in ['FAAS', 'AppService', 'BitBase', 'VM'])?"omitted":detail
    }, null, 2)

    /** Save a copy to LocalCache */
    // const cachePath = './LocalCache';
    // if (!fs.existsSync(cachePath)){
    //     fs.mkdirSync(cachePath);
    // }
    // await fs.writeFileSync(`./LocalCache/${detail.id}.json`, summary);

    /** Return to request */
    return {summary, detail, tags}
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

module.exports = buildBodyRemote