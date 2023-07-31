const proxying = require('../http/proxying');
const cookieRemote = require('./cookie');
const onoff = require('./onoff');
const getDetail = require('./detail')

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
    // const on = await onoff.reopen(order_id)
    const response = await athena_api_v2_processor_order_reply(order_id, content);
    console.log(response.data)
    const off = await onoff.close(order_id)
}

async function updateShopify(order_id) {
    /** 0. Read the ticket details */
    const detail = await getDetail(order_id)

    /** 1. Get Shopify Flag */
    const shopify_regex =   /(.*)(\[method=shopify\])(.*)/i
    const replies =  detail.replies;
    let has_shopify_flag = false
    if(replies) {
        for(let k = 0; k < replies.length; k++) {
            const reply = replies[k];
            const items = reply.items.filter(x => x.type == 6);

            for(let j = 0; j < items.length; j++) {
                const item = items[j];
                const shopify_flag = item.content.match(shopify_regex)
                if(shopify_flag) {
                    // console.log(shopify_flag)
                    has_shopify_flag = true
                }
            }
        }
    } 

    /** 2. Update Shopify Flag */
    if(!has_shopify_flag) {
        console.log(`Updating Shopify Flag ${order_id}`)
        let response = await athena_api_v2_processor_order_reply(order_id, '[method=Shopify]');
    }

}

async function patch(){
    const shopify_athena_id = [
        '1323694',
        '1317726',
        '1326826',
        '1292091',
        '1305703',
        '1323746',
        '1326590',
        '1317874',
        '1326694',
        '1311607',
        '1323763',
        '1317724',
        '1317806',
        '1311597',
        '1312061',
        '1312098',
        '1323788',
        '1326137',
        '1326152',
        '1326305',
        '1326311',
        '1317718',
        '1326829',
        '1323090',
        '1323672',
        '1326328',
    ]

    for(let i = 0; i < shopify_athena_id.length; i++) {
        await updateShopify(shopify_athena_id[i])
    }

    // console.log(resp.status)

    // await reply(12345, "[method=Shopify]")
}

patch()