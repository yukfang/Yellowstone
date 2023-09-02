const TABLES =  require('./database/table')
const buildBodyRemote = require('./buildBodyRemote')
const delayms = (ms) => new Promise((res, rej) => {setTimeout(res, ms * 1)})

async function processOrder(order) {
    const OrderTable = await TABLES.OrderInfo

    const order_id =  order.order_id
    // console.log(`---------Start refresh for ${order_id}---------`)

    const result = await buildBodyRemote(order_id) 
    if(result === null) {
        // delete order from DB
        console.log(`Delete order from DB`)
        OrderTable.destroy({where : {order_id}})
    } else {
        console.log(result.summary)

        OrderTable.update({
                order_id: order_id,
                summary: result.summary,
                detail: result.detail,
                tag: result.tags
            }, {
                where: {
                    order_id
                },
              }
        )
    }
}

async function timerTask() {
    const OrderTable = await TABLES.OrderInfo

    const orders = (await OrderTable.findAll({
        attributes: [
            'order_id', 
            'summary'
        ]
    }))?.map(o => o.dataValues)

    console.log(orders)

    for(let i = 0; i < orders.length; i++) {
        // console.log(`Sync DB for ${orders[i].order_id}`) 
        await processOrder(orders[i])
    }
}

async function run() {
        await timerTask();
}

// run();

module.exports = timerTask