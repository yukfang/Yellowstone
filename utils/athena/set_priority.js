const proxying = require('../http/proxying');
const cookieRemote = require('./cookie');

let cookie = {
    value : '',
    fetchTime : 0
}

async function set_priority(order_id, priority){
    const endpoint = `https://ads.tiktok.com/athena/api/admin/order/priority/set/`;
    const method      = 'POST';

    if(Date.now() - cookie.fetchTime > 1000 * 60 * 3) {
        cookie = {
            value: (await cookieRemote()),
            fetchTime: Date.now()
        }
    }

    let header      = {Cookie: cookie.value}
    let body        = {order_id, priority}
    let param       = null;


    const response = (await proxying(method, endpoint, header, param, body, true));
    console.log(response.data)

    if(response.status == 200 ) {
        const data = JSON.parse(response.data)
        console.log(data)
        return data

    } else {
        console.log(`Set Priority Error !!!`)
        return null;
    }
}


// set_priority(974767)

module.exports = set_priority