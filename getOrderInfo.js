const get_order_detail = require('./utils/athena/detail')
const get_order_tag = require('./utils/athena/tag')
const SkanPatching = require('./Patching/skan')

async function get_order_info(order_id) {
    const tags = await get_order_tag(order_id)
    const detail = await get_order_detail(order_id)

    if(tags !== null && detail !== null) {
        const data = await process_detail(detail);
        data.status = await process_tags(tags)
        if(data.status.subStatus === undefined) {
            data.status.subStatus = data.status.mainStatus
        }
        return data
    }
}

async function process_tags(tags) {
    let mainStatus = ''
    let subStatus = ''
    if(tags === null) {
        
    } else if(Object.keys(tags).length === 0) {

    } else {
        mainStatus = tags[0].name
        subStatus = tags[0].sub_tags[0]?.name
    }

    return {mainStatus, subStatus}
}

async function process_detail(detail) {
    const patchInfo = SkanPatching[`${detail.id}`]

    const client_name = detail.items.filter(r=> r.label.includes('Client Name') || r.label.includes('Advertiser name')).pop().content;
    const country = detail.items.filter(r=> r.label.includes('GBS Country') || r.label.includes('Region')).pop().content;
    console.log(country)
    let region = ''
    if(country.includes("NORTH")) {
        region = "NA"
    } else if( country.includes("EU-") || country.includes("MENA-")) {
        region = 'EMEA'
    } else if( country.includes("SEA-")) {
        region = "APAC"
    }

    const mmp = patchInfo?.mmp || detail.items.filter(r=> r.label.includes('Client MMP')).pop()?.content || ""
    let ios_app_id = patchInfo?.ios_app_id || (detail.items.filter(r=> r.label.includes('iOS Mobile App ID')).pop()?.content) || ""
    if(ios_app_id.toLowerCase().includes('id')) {
        ios_app_id = ios_app_id.substring(2)
    }
    const vertical = detail.items.filter(r=> r.label.includes('Customer Vertical')).pop()?.content || ""


    return {
        create_time: (new Date(detail.create_time * 1000)).toISOString().split('T')[0],
        archive_category_1_name         : detail.archive_category_1_name,
        follower                        : detail.follower,
        creater_lark_name               : detail.creater_lark_name,

        
        mmp,
        vertical,
        client_name,
        country,
        region,
        ios_app_id,
        detail
    }
}

module.exports = get_order_info