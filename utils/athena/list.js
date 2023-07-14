const proxying = require('../http/proxying');
const cookieRemote = require('./cookie');

let cookie = {
    value : '',
    fetchTime : 0
}

async function athena_api_v2_swimlane(){
    const endpoint = `https://ads.tiktok.com/athena/api/v2/processor/statistics/swimlane/list/?name=swim-lane-5`;
    const method      = 'POST';

    if(Date.now() - cookie.fetchTime > 1000 * 60 * 3) {
        cookie = {
            value: (await cookieRemote()),
            fetchTime: Date.now()
        }
    }
    // console.log(`cookie = ${JSON.stringify(cookie)}`)
    let header      = {Cookie: cookie.value}
    let body        = {
            "dims":[
               "order_id"
            ],
            "metrics":[
               "priority",
               "order_id",
               "is_vip",
               "title",
               "urged",
               "create_time",
               "is_guest",
               "board_name",
               "order_first_name",
               "order_second_name",
               "plat_id",
               "employee_id",
               "employee_name",
               "current_role_name",
               "employee_avatar",
               "employee_email",
               "show_auto_assign",
               "pending_time",
               "vip_type",
               "circulation_count",
               "circulation_reply",
               "pending_status",
               "time_before_overtime_seconds",
               "time_after_overtime_seconds",
               "is_overtime",
               "is_impending_overtime",
               "is_auto_closing",
               "pending_status",
               "last_reply_time",
               "total_reply_count"
            ],
            "filters":[
               {
                  "field": "plat_id", "filter_type":0, "in_field_values":[ "1736490999244882"]
               },
               {
                  "field":"athena_order_bool_expression",
                  "filter_type":1000,
                  "expression":{
                    "AND":[
                       {
                          "field":"create_time",
                          "filter_type":1,
                          "range_lower":"2023-05-01T00:00:00",
                          "range_upper":"2024-12-29T00:00:00"
                       },
                       {
                          "field":"archive_category",
                          "filter_type":0,
                          "in_field_values":[
                             "1705151646989719_1768849764192273"
                          ]
                       }
                    ]
                 }
               }
            ],
            "extra":{
               "service_type":7
            },
            "order_field":"create_time",
            "order_type":1,
            "page":1,
            "page_size":100
    };
    let param        = null;


    const response = (await proxying(method, endpoint, header, param, body, true));
    console.log(response.data)

    if(response.status == 200 ) {
        const data = JSON.parse(response.data).data;
        // console.table(data.data)
        return data.data;
    } else {
        console.log(`Get Order list Error !!!`)
        return null;
    }
}


// athena_api_v2_swimlane()

module.exports = athena_api_v2_swimlane
