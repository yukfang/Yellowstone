const   fs      =   require('fs')
const extractTags = require('./utils/report/status')
const TABLES    =   require('./database/table')

const cachePath = `./LocalCache`

async function fetchSummaryDb(order_id){
    /** Update Hot Order */
    const HotOrderTable = await TABLES.hotOrder;
    HotOrderTable.create({order_id})

    /** Find record in DB */
    const OrderInfoTable = await TABLES.OrderInfo2;
    const order = await OrderInfoTable.findOne({
        where : {
            order_id
        }
    })

    if(order === null) {
        const summary = {refresh: "2023-01-01T01:01:01Z", detail: {id: order_id}}

        // Update a empty record in DB
        await OrderInfoTable.create({
            order_id,
            summary: summary,
            update_time: "2023-01-01T01:01:01Z"
        })

        return summary
    }

    const status = await extractTags(order.tag)
    order.summary.main_status = status.main_status
    order.summary.sub_status  = status.sub_status

    return order.summary
}


module.exports = fetchSummaryDb