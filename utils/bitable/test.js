const client = require("./client");
const lark = require('@larksuiteoapi/node-sdk');


const USER_TOKEN = `u-d2saIq1CRas9vAxIwiaXo445nQsxk0rxMq001hOw0IrA`

const BitTables = {
    "CNOB_YS_TRACKER" : {
        appToken : 'WsTCb1IadapZ88s80CCc7kQnnsf',
        tableId : 'tblySyt2mkBp7aA9',
    },
    "TSC_YS_TRACKER" : {
        appToken : 'C5HPbBqggan4BgsX6NSceCthn3d',
        tableId : 'tblbSl4oFQ2PygfW',
    },
    "ATHENA_TRACKER" : {
        appToken : 'GINObDWd9arPStstLLfcwgbjn2f',
        tableId : 'tblpiAezE3MScPjT',
    }
}

async function addTableRecordBatch(app_token, table_id, records) {
    console.log(records)
    try {
        const { data } = await client.bitable.appTableRecord.batchCreate({
        path: {
            app_token: app_token,
            table_id: table_id,
        },
        data: {
            records: records
        },
        }, lark.withUserAccessToken(USER_TOKEN))
        return data;
    } catch (e) {
        console.log(`------`)
        console.log(e)
        console.log(`------`)
    }
};

async function addOrderBatch(orders) {
    const records = orders.map(o => {
        return {
            fields: {"Athena" : o.order_id}
        }
    })

    const table = BitTables.CNOB_YS_TRACKER
    const res = await addTableRecordBatch(table.appToken, table.tableId,  (records))
    if (res) {
      console.log(res);
    } 
}

async function readRecords(app_token = appToken, table_id = tableId, user_access_token) {
    const res = await client.bitable.appTableRecord.list({
        params: {
          page_size: 300,
          sort: '["UpdatedAt ASC" ]'
        },
        path: {
          app_token: app_token,
          table_id: table_id,
        },
    }, lark.withUserAccessToken(user_access_token))

    console.table(res.data.items)
    return res.data.items;
}

async function updateRecords(app_token = appToken, table_id = tableId, records, user_access_token) {
    try {
        const res = await client.bitable.appTableRecord.batchUpdate({
            path : { app_token, table_id},
            data : { records }
        }, lark.withUserAccessToken(user_access_token))

    
        // console.log(res)
        return res
    } catch (e) {
        console.log(`------`)
        console.log(e)
        console.log(`------`)
    }
}

async function run() {
    // Add Batch Record
    if(false)
    {
        await addOrderBatch([
            {order_id : 1528384},
            {order_id : 1547928}
        ])
        console.log(`x-x-x-x`)
    }

    // Read All record 
    if(false)
    {
        const table = BitTables.CNOB_YS_TRACKER
        const items   = await readRecords(table.appToken, table.tableId, USER_TOKEN)
        const records = []
        
        for(let i = 0; i < items.length; i++) {            
            const record = items[i].fields
            record.record_id = items[i].record_id
            console.log(record)
            records.push(record)
        }

        console.table(records, [ "Athena", "UpdatedAt", "record_id" ])
        // console.log(records)
    }

    // Update One Record 
    if(true)
    {
        const table = BitTables.CNOB_YS_TRACKER
        const res   = await updateRecords(table.appToken, table.tableId, USER_TOKEN)
    }
}


// run()

module.exports = {
    readRecords,
    updateRecords
}