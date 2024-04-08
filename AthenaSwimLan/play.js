const proxying = require('./proxying');
const cookie = require('./cookie');
const fs = require('fs')
const delay = (ts) => new Promise((res)=>{setTimeout(res, ts * 1000)})

async function get_athena_tickets(page_num = 1){
    const ts1 = Date.now()
    let orders = [];
    let total_count = 999999999999;

    const page_size   = 100;
    const method      = 'POST';
    // const endpoint    = 'https://ads.tiktok.com/athena/api/admin/order/list/';
    const endpoint = 'https://ads.tiktok.com/athena/api/v2/processor/statistics/swimlane/list/?name=swim-lane-3'
    let header      = {Cookie: await cookie()}
    let param       = {};
    let body        =
        {
            "dims":[
               "order_id"
            ],
            "metrics":[
               "order_id",
               "title"
            ],
            "filters":[
               { "field":"plat_id",     "filter_type":0, "in_field_values":["1736490999244882"] },
               { "field":"create_time", "filter_type":1, "range_lower":"2023-06-22T00:00:00Z", "range_upper":"2035-12-31T00:00:00Z"   }

            //    {
            //       "field":"athena_order_bool_expression",
            //       "filter_type":1000,
            //       "expression":"{\"AND\":[{\"field\":\"category\",\"filter_type\":0,\"in_field_values\":[\"1692583767221250_1715575945593874_1728886366297121\",\"1692583767221250_1715575945593874_1728886366297137\",\"1692583767221250_1715575945593874_1728886366299137\"]}]}"
            //    },
            //    {
            //     "field":"athena_order_bool_expression",
            //     "filter_type":1000,
            //     "expression":"{\"AND\":[{\"field\":\"category\",\"filter_type\":0,\"in_field_values\":[\"1692583767221250_1736250781487106_1736251013111810\",\"1692583767221250_1736250781487106_1736251013111826\",\"1692583767221250_1736250781487106_1736251013111842\",\"1692583767221250_1736250781487106_1736251013111858\",\"1692583767221250_1736250781487106_1736251013112834\"]}]}"
            //    }
            ],
            "extra":{
               "service_type":7
            },
            "order_field":"create_time",
            "order_type":1,
            "page":1,
            "page_size":60
        }


    {
        let temp_body = Object.assign({}, body);
        temp_body.page = 1;
        temp_body.page_size = 1;

        const response = await proxying(method, endpoint, header, param, temp_body, true);
        const ts2 = Date.now()
        console.log(`One req takes ${ts2 - ts1}`)
        // console.log('response = ' + (response))

        if(response.status != 200) {
            console.log(response.data);
            total_count = 0;
        }

        const data = JSON.parse(response.data).data;
        console.log(data)
        total_count = data.total_count;
        console.log(`total_count = ${total_count}`)
    }

    // return;

    let tasks = [];
    for(let page = 1; page * body.page_size < total_count; page++){
        var req_body = Object.assign({},body);
        req_body.page = page;
        tasks.push(proxying(method, endpoint, header, param, req_body, true));
        await delay(1);

        // if(page === 2) break;
        console.log(`page = ${page}, page_size = ${req_body.page_size}, total_count = ${total_count} `)
    }
    let result =  await Promise.all(tasks);

    let others = []
    let vsa = []
    let catalog = []
    let all_good = true;
    for(let i = 0; i < result.length; i++) {
        const response = (result[i]);
        const status = response.status;
        if(status != 200) {
            all_good = false;
            console.log('error happens!')
        }
        const statusText = response.statusText;
        const orders = JSON.parse(response.data).data.data;
        orders.forEach(r => {
            catalog.push(r)
        });
    }


    console.log(`vsa=${vsa.length}, catalog=${catalog.length}, others=${others.length}`)

    console.table(catalog)

    var content = ''
    for(let i = 0; i < catalog.length; i++) {
        content += (catalog[i].order_id + "__+__" + catalog[i].title + '\n')
    }
    fs.writeFileSync("vsa.txt", content);


    return orders;
}


async function get_all_tickets() {

    let orders = [
        ...(await get_athena_tickets())
    ];

}

async function run() {
    const start = new Date();
    let orders = await get_all_tickets();
    const end = new Date();

    console.log(`Total Time Elapsed: ${end-start}` )
}


run();
