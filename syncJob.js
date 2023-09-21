const TABLES =  require('./database/table')
const { Sequelize, DataTypes, Model, UniqueConstraintError, Op, QueryTypes } = require('sequelize');
const token  = require('./utils/athena/cookie')
const getOrderList = require('./utils/athena/list')
const delayms = (ms) => new Promise((res, rej) => {setTimeout(res, ms * 1)})
const buildBodyRemote = require('./buildBodyRemote')
const getOrderTag       = require('./utils/athena/tag')
 

async function orderRefresh(order_id) {
    const OrderTable = await TABLES.OrderInfo2

    const result = await buildBodyRemote(order_id) 
    if(result === null) {
        // delete order from DB
        console.log(`Delete order from DB because no such Order ID`)
        OrderTable.destroy({where : {order_id}})
        return null
    } else {
        const summary = JSON.parse(result.summary)
        const record = {
            order_id    : order_id,
            refreshAt   : summary.refresh,
            update_time : summary.update_time * 1000,
            summary     : summary,
            detail      : result.detail,
            tag         : result.tags
        }

        // await OrderTable.update(record, {where: {order_id}})
        return record
    }

    // console.log(`                                     .................${order_id} Refresh Completed...`)
    // return 
}

async function syncRemoteToDb() {
    /** A. Get All Tickets in DB */
    const OrderTable = await TABLES.OrderInfo2
    const dbOrders = (await OrderTable.findAll({
        attributes: [
            'order_id', 
            'refreshAt',
            'update_time',
            'summary',
            'updatedAt',
            'createdAt'
        ]
    }))?.map(o => o.dataValues).sort((a,b) => b.update_time - a.update_time)


    /** 0. Get new Tickets and Cold Tickets */
    const newOrders     = dbOrders.filter(o => (o.updatedAt - o.createdAt < 10)).map(o=>o.order_id) 
    const coldOrders    = dbOrders.filter(o => {
        // console.log(o.summary)
        if(o.summary.close_time === undefined || o.summary.close_time.trim() === '') {
            return  (Date.now() - o.refreshAt > 1000 * 60 * 60 * 4)
        } else {
            // Don't refresh closed tickets 
            return false
        }
    }).map(o=>o.order_id) 
 


    /** 1. Get Tickets from Remote */
    const missingOrders = []
    const updatedOrders = []
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
                updatedOrders.push(rmtOrder.order_id)
            }
        } else { 
            missingOrders.push(rmtOrder.order_id)
        }
    }
    console.log(`Missing Order number: ${missingOrders.length}, Updated Order number: ${updatedOrders.length}`)

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
    let hotOrders = [... new Set((await HotOrderTable.findAll()).map(o=>o.dataValues.order_id))]
    if(hotOrders.length > 0) {
        console.log(`Found Hot Orders: ${hotOrders.length}, take 5 Max ...`)
        hotOrders = hotOrders.slice(0,5)
        console.table(hotOrders)
    }
 
    /** 4. Fetch Remote Details to update */
    let  xOrders =  (
                        (hotOrders.length > 0)
                        ? hotOrders 
                        : ([].concat(missingOrders).concat(updatedOrders).concat(newOrders))
                    ).sort((a,b)=> a.last_pending_time - b.last_pending_time)
    if(xOrders.length === 0) {
        const batch = 5
        console.log(`Found Cold Orders: ${coldOrders.length}, take ${batch}...`)
        xOrders = coldOrders.slice(0, batch)
    }

    console.log(`Refreshing ${xOrders.length} Orders...`)
    if(xOrders.length > 0) {
        let orderTask = [] 

        for(let i = 0; i < xOrders.length; i++) {
            const order_id = xOrders[i]
    
            console.log(`【${i}/${xOrders.length - 1}】 ${order_id} Start Refresh......`)
            orderTask.push( orderRefresh(order_id))
            await delayms(500)
        }
        let orders = await Promise.all(orderTask);
        orders = orders.filter(o=> o !== null)

        await OrderTable.bulkCreate(
            orders,
            {
              updateOnDuplicate: ["refreshAt", "update_time", "summary", "detail", "tag", "updatedAt"],
            }
        );

        await HotOrderTable.destroy({
            where: {
                  order_id: {[Op.in]: hotOrders}
              }
        })

        // refreshAt   : summary.refresh,
        // update_time : summary.update_time * 1000,
        // summary     : summary,
        // detail      : result.detail,
        // tag         : result.tags 

        console.log(`Complete ${orderTask.length} Order Refresh`)


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