const client = require("./client");
const mock = require("./mock.json");
const lark = require('@larksuiteoapi/node-sdk');


const userToken = 'u-dTQ0k9NPle_9z00KvH5wGj45lQuxk0p9qW0005Ow0FeQ'

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

 
async function addTableRecord(app_token, table_id, record) {
    await client.bitable.appTableRecord.create({
        path: {
            app_token: app_token,
            table_id: table_id,
        },
        data: {
            fields: {
                "Athena" : 77
            }
        }
    }, lark.withUserAccessToken("u-dQeNlWYf58.ajbwcxLYueh45lQs1k0hFMW00hgCw0EbR"))
}

async function addTableRecordBatch(app_token, table_id, records) {
   try {
    const { data } = await client.bitable.appTableRecord.batchCreate({
      path: {
        app_token: app_token,
        table_id: table_id,
      },
      data: {
        records: records,
      },
    });
    return data;
  } catch (e) {
    console.log(e)
    console.log(`------`)
  }
};

async function addOrder(order_id) {
    const record = 
        {fields: {"Athena": order_id} }

   const res = await addTableRecord(appToken, tableId,  record)
    if (res) {
      console.log(res);
    } 
}
async function addOrderBatch(order_id) {
    const records = [
        {fields: {"Athena": order_id} }
    ]

   const res = await addTableRecordBatch(appToken, tableId,  records)
    if (res) {
      console.log(res);
    } 
}

async function readRecords(app_token = appToken, table_id = tableId, user_access_token) {
    const res = await client.bitable.appTableRecord.list({
        params: {
          page_size: 600,
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

async function run() {
    // Add 1 record
    {
        // await addOrder(111)
    }

    // Add Batch Record
    {
        // await addOrderBatch(222)
    }

    // Read All record 
    {
        const table = BitTables.ATHENA_TRACKER
        const items   = await readRecords(table.appToken, table.tableId, userToken)
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
    {

    }
}


run()
