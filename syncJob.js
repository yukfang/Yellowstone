const TABLES =  require('./database/table')
const { Sequelize, DataTypes, Model, UniqueConstraintError, Op, QueryTypes } = require('sequelize');
const token  = require('./utils/athena/cookie')
const getOrderList = require('./utils/athena/list')
const delayms = (ms) => new Promise((res, rej) => {setTimeout(res, ms * 1)})
const buildBodyRemote = require('./buildBodyRemote')
const tickets = require('./tickets')
const getOrderTag       = require('./utils/athena/tag')
 
async function preProcessTicket() {
    const OrderTable = await TABLES.OrderInfo2
    const orders = (await OrderTable.findAll({
        attributes: ['order_id']
    }))?.map(o => o.dataValues).map(o => o.order_id)

    console.log(orders)

    const new_tickets = tickets.filter(t => !(orders.includes(t)))
    console.log(new_tickets)

    if(new_tickets.length === 0) return;

    await OrderTable.bulkCreate(new_tickets.map(t => {
        return {
            order_id    : t,
            refreshAt   : '2020-10-23T08:08:08Z',
            update_time : '2020-10-23T08:08:08Z',
            summary     : {id: t}
        }
    }))
}

async function orderRefresh(order_id) {
    const OrderTable = await TABLES.OrderInfo2

    const result = await buildBodyRemote(order_id) 
    if(result === null) {
        // delete order from DB
        console.log(`Delete order from DB`)
        OrderTable.destroy({where : {order_id}})
    } else {
        const summary = JSON.parse(result.summary)

        await OrderTable.update({
                order_id    : order_id,
                refreshAt   : summary.refresh,
                update_time : summary.update_time * 1000,
                summary     : summary,
                detail      : result.detail,
                tag         : result.tags
            }, {
                where: {
                    order_id
                },
              }
        )
    }
}

async function syncRemoteToDb() {
    /** 0. Get Tickets in DB */
    const OrderTable = await TABLES.OrderInfo2
    const dbOrders = (await OrderTable.findAll({
        attributes: [
            'order_id', 
            'refreshAt',
            'update_time',
            'updatedAt',
            'createdAt'
        ]
    }))?.map(o => o.dataValues).sort((a,b) => b.update_time - a.update_time)
    const newOrders = dbOrders.filter(o => (o.updatedAt - o.createdAt < 10)).map(o=>o.order_id)
 

    /** 1. Get Tickets from Remote */
    const missingOrders = []
    const ageOrders = []
    const remoteOrders = await getOrderList(['order_id', 'update_time', 'last_pending_time', "aging_time", "last_pending_status_time", "pending_time"]) 
    // console.table(remoteOrders.filter(o=>o.order_id==1404591) )

    for(let i = 0; i < remoteOrders.length; i++) {
        const rmtOrder = remoteOrders[i];
        const idx = dbOrders.map(o=>o.order_id).indexOf(parseInt(rmtOrder.order_id))
        if(idx !== -1) {
            const rmtTime = new Date(rmtOrder.update_time * 1000).getTime()
            const dbTime  = dbOrders[idx].update_time.getTime()
            if(rmtTime !== dbTime) {
                // console.log(`${rmtTime} ${dbTime}`)
                ageOrders.push(rmtOrder.order_id)
            }
        } else { 
            missingOrders.push(rmtOrder.order_id)
        }
    }
    console.log(`Missing ticket number: ${missingOrders.length}, Age Order number: ${ageOrders.length}`)

    /** Update Missing Orders to DB */
    if(missingOrders.length > 0) {
        await OrderTable.bulkCreate(missingOrders.map(t => {
            return {
                order_id    : t,
                refreshAt   : '2020-10-23T08:08:08Z',
                update_time : '2020-10-23T08:08:08Z',
                summary     : {id: t}
            }
        }))
    }

    /** 2. Get Hot Orders */
    const HotOrderTable = await TABLES.hotOrder;
    const hotOrders = [... new Set((await HotOrderTable.findAll()).map(o=>o.dataValues.order_id))]
    // console.log(`Hot Orders: ${hotOrders.dataValues?.map(o=>o.order_id)}`)
 
    console.table(hotOrders )

    HotOrderTable.destroy({
        where: {
              order_id: {[Op.in]: hotOrders}
          }
    })

    /** 4. Fetch Remote Details to update */

    const xOrders = (hotOrders.length > 0)? hotOrders :
                    ([].concat(missingOrders).concat(ageOrders).concat(newOrders).concat(hotOrders))
                    .sort((a,b)=> a.last_pending_time - b.last_pending_time).slice(0, 10)

    console.table(xOrders)
    if(xOrders.length > 0) {
        for(let i = 0; i < xOrders.length; i++) {
            const order_id = xOrders[i]
    
            console.log(`【${i}/${xOrders.length - 1}】 ${order_id} Start Refresh......`)
            await orderRefresh(order_id)
        }
    } else {
        await tagRefresh()
    }
 

    console.log(`----------------------------------------`)
}

async function run() {
    // getRemoteTicket()
    // preProcessTicket();
    // syncRemoteToDb();
    while(true) {
        try {
            await token();
            await syncRemoteToDb();
            // return
        } catch (e) {
            console.log(`Exception: `)
            console.log(e)
        }

        await delayms(1000 * 1 * 2) // Only Sleep 5s
        // console.log(`Begin to Sync for another round...`)
    }
}

run();


async function tagRefresh() {
    console.log(`>>>>>> Start Tag Refreshing...`)

    const OrderTable = await TABLES.OrderInfo2
    let orders = (await OrderTable.findAll({
        attributes: ['order_id', 'updatedAt']
    }))?.map(o => o.dataValues)
 
    orders = orders.sort((a,b)=> a.updatedAt - b.updatedAt).slice(0,10)

    console.table(orders)

    for(let i = 0; i < orders.length; i++) {
        const order_id =  (orders[i]).order_id
        const rawtag = await getOrderTag(order_id)

        await OrderTable.update({
            order_id    : order_id,
            tag         : rawtag
        }, {
            where: {
                order_id
            },
        })
    }
    console.log(` ...... End Tag Refreshing <<<<<<<<`)
}