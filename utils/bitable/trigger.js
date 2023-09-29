const client = require("./client");
const mock = require("./mock.json");
const lark = require('@larksuiteoapi/node-sdk');


const appToken = 'WsTCb1IadapZ88s80CCc7kQnnsf'
const tableId = 'tblySyt2mkBp7aA9'

 
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

async function run() {
    {
        await addOrder(111)
    }

    {
        // await addOrderBatch(222)
    }
}


async function sample () {

client.bitable.appTableRecord.create({
    path: {
        app_token: 'WsTCb1IadapZ88s80CCc7kQnnsf',
        table_id: 'tblySyt2mkBp7aA9',
    },
    data: {
        fields: new Map([
            ['Athena', 111],
        ]),
    },
},
lark.withUserAccessToken("u-dQeNlWYf58.ajbwcxLYueh45lQs1k0hFMW00hgCw0EbR")
).then(res => {
console.log(res);
});
}


run()
