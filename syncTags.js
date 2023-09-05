const TABLES =  require('./database/table')
const token  = require('./utils/athena/cookie')
const getOrderTag       = require('./utils/athena/tag')

const extractTags = require('./utils/report/status')
const delayms = (ms) => new Promise((res, rej) => {setTimeout(res, ms * 1)})

async function tagTask() {
    console.log(`>>>>>> Start Timer Refreshing...`)
    await token();

    const OrderTable = await TABLES.OrderInfo2
    let orders = (await OrderTable.findAll({
        attributes: ['order_id', 'updatedAt']
    }))?.map(o => o.dataValues)
 
    orders = orders.sort((a,b)=> a.updatedAt - b.updatedAt).slice(0,5)

    console.table(orders)

    for(let i = 0; i < orders.length; i++) {
        const order_id =  (orders[i]).order_id
        const rawtag = await getOrderTag(order_id)
        const status = extractTags(rawtag)


        await OrderTable.update({
            order_id    : order_id,
            tag         : rawtag
        }, {
            where: {
                order_id
            },
        })
    }
    console.log(`... End Tag Refreshing <<<`)
}

async function run() {
    while(true) {
        try{
            await tagTask();
            await delayms(1000 * 1 * 1)
        } catch (e) {

        }
    }
}

run();