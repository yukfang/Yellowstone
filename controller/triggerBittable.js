const {readRecords, updateRecords} = require('../utils/bitable/test')

const delayms = (ms) => new Promise((res, rej) => {
    setTimeout(res, ms )
})

const USER_TOKEN = `
u-cyTcIYtg1d98QP66s7fPQq45lkuxk0pFja00l1yw0EbM




`.trim()

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

async function triggerUpdate(table, user_access_token) {
    /** 1. Read Records */
    const records = []
    {
        const items = await readRecords(table.appToken, table.tableId, user_access_token)

        for(let i = 0; i < items.length; i++) {            
            const record = items[i].fields
            record.record_id = items[i].record_id
            console.log(record)
            records.push(record)
        }
    
        console.table(records, [ "Athena", "Client Name", "UpdatedAt", "record_id" ])
    }

    /** 2. Update Records */
    for(let j = -1, i = 0; j < records.length; i++, j++) {
        const recs = [   ]
        if(j >= 0) {
            const Athena = parseInt(records[j].Athena)
            recs.push({
                record_id : records[j].record_id,
                fields      : { 
                    "Athena" :  (Athena < 0) ?  Athena * -1 : Athena
                }
            })
        }
        if(i < records.length) {
            const Athena = parseInt(records[i].Athena)
            recs.push({
                record_id : records[i].record_id,
                fields      : { 
                    "Athena" :  (Athena > 0) ?  Athena * -1 : Athena
                }
            })
        }

        let not_success = true
        let retry = 0
        while(not_success && retry < 3) {
            try {
                await updateRecords(table.appToken, table.tableId, recs, user_access_token)
                not_success = false
                console.log(`${i+1}/${records.length} Progressing... `)
                await delayms(1001)
            } catch (e) {
                console.log(`Error! Retry after 3 s`)
                retry += 1
                await delayms(1000 * 3)
            }
        }
    }
}

async function job() {
    for(let i = 0; i < 3; i++) {
        let task1 = triggerUpdate(BitTables.ATHENA_TRACKER, USER_TOKEN)
        let task2 = triggerUpdate(BitTables.TSC_YS_TRACKER, USER_TOKEN)
        let task3 = triggerUpdate(BitTables.CNOB_YS_TRACKER, USER_TOKEN)


        await Promise.all([
            task1, task2, task3
        ])
    }
}

job();





/**
1367996
1380463
1383460
1388441
1393754
1398239
1404264
1426774
1430957
1433150
1433324
1435097
1435103
1435107
1437046
1437081
1437082
1437237
1440609
1441953
1442004
1449674
1450758
1450789
1450836
1451289
1456453
1456875
1456882
1458632
1465456
1468027
1477883
1528384

  
  
 
 
 */