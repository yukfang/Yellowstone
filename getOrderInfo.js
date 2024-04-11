const get_order_detail = require('./utils/athena/detail')
const get_order_tag = require('./utils/athena/tag')

async function get_order_info(order_id) {
    const tags = await get_order_tag(order_id)
    const detail = await get_order_detail(order_id)

    if(tags !== null && detail !== null) {
        const data = await process_detail(detail);
        data.status = await process_tags(tags)
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
    const client_name = detail.items.filter(r=> r.label.includes('Client Name') || r.label.includes('Advertiser name')).pop().content;
    const region = detail.items.filter(r=> r.label.includes('GBS Country') || r.label.includes('Region')).pop().content;
    const mmp = detail.items.filter(r=> r.label.includes('Client MMP')).pop()?.content || "";
    const vertical = detail.items.filter(r=> r.label.includes('Customer Vertical')).pop()?.content || ""


    return {
        create_time: (new Date(detail.create_time * 1000)).toISOString().split('T')[0],
        archive_category_1_name         : detail.archive_category_1_name,
        follower                        : detail.follower,
        creater_lark_name               : detail.creater_lark_name,

        
        mmp,
        vertical,
        client_name,
        region,

        detail
    }
}

module.exports = get_order_info