const fs = require('fs');
const api_list_invoke   = require('./utils/athena/list');
const Reduce = require('./reduceInfo')

const delay = (ms) => {
    return new Promise((res, rej) => {
        setTimeout(res, ms * 1000)
    })
}

const CACHE_DIR = (process.env.PLATFORM == 'FAAS')?'../order_platform/':'./order_platform/'

async function refreshTicketList() { 
    let rawOrders = await api_list_invoke(); 

    let orders = await Reduce.reduceList(rawOrders)
    console.log(`Refresh Order List Remote, Length: ${rawOrders.length} => ${orders.length}`)
    if(orders.length > 0) {
        fs.writeFileSync(`${CACHE_DIR}order_list.json`, JSON.stringify(orders.sort((a,b) => {return a.order_id - b.order_id}), null, 2), function (err) {
            if (err) throw err;
        });
    }

    return orders
}

async function test() {
    const orderList = await refreshTicketList()

    for(let i = 0; i < orderList.length; i++) {
        if(orderList[i].order === '1050141') {
            console.log(orderList[i])
        }
    }

    console.log(orderList.map(o => o.order_id))
}

// test()

module.exports = refreshTicketList