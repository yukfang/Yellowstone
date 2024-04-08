const get_order_detail = require('./utils/athena/detail')
const get_order_tag = require('./utils/athena/tag')

async function get_order_info(order_id) {
    const tags = await get_order_tag(order_id)
    const detail = await get_order_detail(order_id)

    if(tags !== null && detail !== null) {
        return {
            tags : await process_tags(tags),
            detail: await process_detail(detail)
        }
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
    return {
        create_time: (new Date(detail.create_time * 1000)).toISOString().split('T')[0],
        archive_category_1_name         : detail.archive_category_1_name,
        follower                        : detail.follower,
        creater_lark_name               : detail.creater_lark_name,



        detail
    }
}

module.exports = get_order_info