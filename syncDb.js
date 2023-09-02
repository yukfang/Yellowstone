const TABLES =  require('./database/table')
const buildBodyRemote = require('./buildBodyRemote')
const token = require('./utils/athena/cookie')
const delayms = (ms) => new Promise((res, rej) => {setTimeout(res, ms * 1)})

async function processOrder(order) {
    const OrderTable = await TABLES.OrderInfo

    const order_id =  order.order_id

    const result = await buildBodyRemote(order_id) 
    if(result === null) {
        // delete order from DB
        console.log(`Delete order from DB`)
        OrderTable.destroy({where : {order_id}})
    } else {
        // console.log(result.summary)

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
            // 'summary',
            'updatedAt',
            'createdAt'
        ]
    }))?.map(o => o.dataValues)

    // const order971029 = orders.filter(o => o.order_id === 1409149)
    // console.log(order971029)

    const oldOrders = orders
        .filter(o => (Date.now() - o.updatedAt > 1000 * 60 * 60))
        .sort((a,b) => a.updatedAt - b.updatedAt)
        .slice(0, 20)
        .concat(
            orders.filter(o => (o.updatedAt - o.createdAt < 10) ) 
        )


    console.log(`Total ${oldOrders.length} tickets need refresh...`)
    // console.log(oldOrders.map(o=>o.order_id))
    console.table(oldOrders)

    for(let i = 0; i < oldOrders.length; i++) {
        const order = oldOrders[i]

        console.log(`【${i+1}/${oldOrders.length}】 ${order.order_id} Start Refresh......`)
        await processOrder(order)
    }
}

async function run() {
    while(true) {
        await token();
        await timerTask();
        await delayms(1000 * 60 * 1)
    }
}

run();

module.exports = timerTask