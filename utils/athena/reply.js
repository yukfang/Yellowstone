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

// reply('1411762', "[status update] GBS creates ticket by mistake. GBS closed the ticket")

// reply('1367996', '[sales=潘羽]')
// reply('1388441', '[sales=李思]')
// reply('1393754', '[sales=宋佳音]')

// reply('1437237', '[sales=卢红玲]')
// reply('1440609', '[sales=刘梦洁]')
// reply('1441953', '[sales=王子豪]')
// reply('1449674', '[sales=林莉莉]')
// reply('1450758', '[sales=林莉莉]')
// reply('1450789', '[sales=林莉莉]')
// reply('1450836', '[sales=林莉莉]')
// reply('1430957', '[sales=苗嘉龙]')
// reply('1437046', '[sales=苗嘉龙]')
// reply('1437081', '[sales=苗嘉龙]')
// reply('1437082', '[sales=苗嘉龙]')

// reply('1451289', '[sales=高嘉杰]')
// reply('1456453', '[sales=顾名煜]')
// reply('1456875', '[sales=顾名煜]')
// reply('1456882', '[sales=顾名煜]')
// reply('1458632', '[sales=顾名煜]')


