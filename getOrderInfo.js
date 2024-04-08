const get_order_detail = require('./utils/athena/detail')
const get_order_tag = require('./utils/athena/tag')

async function get_order_info(order_id) {
    const tags = await get_order_tag(order_id)
    const detail = await get_order_detail(order_id)

    if(tags !== null && detail !== null) {
        return {
            tags, detail
        }
    }
}

module.exports = get_order_info