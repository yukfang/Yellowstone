const proxying = require('../http/proxying');
const cookieRemote = require('./cookie');
const onoff = require('./onoff');

let cookie = {
    value : '',
    fetchTime : 0
}

async function athena_api_v2_processor_order_reply(order_id, content){
    if(Date.now() - cookie.fetchTime > 1000 * 60 * 3) {
        cookie = {
            value: (await cookieRemote()),
            fetchTime: Date.now()
        }
    }



    const endpoint = `https://ads.tiktok.com/athena/api/v2/processor/order/reply`;
    const method      = 'POST';
    let header      =  {Cookie: cookie.value}
    console.log(header)
    let param       = {};
    let body        = {
            "order_id":order_id,
            "method":1,
            "items":[
                {
                    "type":6,"content": content
                }
            ]
        };

    const response = (await proxying(method, endpoint, header, param, body, true));
    // console.log(response.data)
    return response
}

async function reply(order_id, content) {
    const on = await onoff.reopen(order_id)
    const response = await athena_api_v2_processor_order_reply(order_id, content);
    console.log(response.data)
    const off = await onoff.close(order_id)
}

async function patch(){
    await reply(12345, "[method=Shopify]")
}

patch()