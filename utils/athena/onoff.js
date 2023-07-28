const proxying = require('../http/proxying');
const cookieRemote = require('./cookie');

let cookie = {
    value : '',
    fetchTime : 0
}


async function athena_api_v2_processor_order_close(order_id){
    if(Date.now() - cookie.fetchTime > 1000 * 60 * 3) {
        cookie = {
            value: (await cookieRemote()),
            fetchTime: Date.now()
        }
    }



    const endpoint = `https://ads.tiktok.com/athena/api/v2/processor/order/close/`;
    const method      = 'POST';
    let header      =  {Cookie: cookie.value}
    console.log(header)
    let param       = {};
    let body        = {"order_id":order_id,"plat_id":"1736490999244882"}


    const response = (await proxying(method, endpoint, header, param, body, true));
    // console.log(response.data)
    return response
}

async function athena_api_v2_processor_order_reopen(order_id){
    if(Date.now() - cookie.fetchTime > 1000 * 60 * 3) {
        cookie = {
            value: (await cookieRemote()),
            fetchTime: Date.now()
        }
    }



    const endpoint = `https://ads.tiktok.com/athena/api/v2/processor/order/reopen/`;
    const method      = 'POST';
    let header      =  {Cookie: cookie.value}
    console.log(header)
    let param       = {};
    let body        = {"order_id":order_id,"plat_id":"1736490999244882"}


    const response = (await proxying(method, endpoint, header, param, body, true));
    // console.log(response.data)
    return response
}

async function test() {
    const close = await athena_api_v2_processor_order_close(1371331)

    const reopen = await athena_api_v2_processor_order_reopen(1371331)



    console.log(response.data)
}

// test();

module.exports = {
    close: athena_api_v2_processor_order_close,
    reopen: athena_api_v2_processor_order_reopen
}
