const   fs      =   require('fs')
const extractTags = require('./utils/report/status')
const TABLES    =   require('./database/table')

const cachePath = `./LocalCache`

async function fetchSummaryDb(order_id){
    /** Find tag in LocalCache */
    const tagFilePath = `${cachePath}/${order_id}.json`
    if(!fs.existsSync(tagFilePath)) {
        await fs.writeFileSync(tagFilePath, JSON.stringify({order_id, refresh:"2020-01-01T01:01:01Z", tag:[]}))
    }

    /** Find record in DB */
    const OrderInfoTable = await TABLES.OrderInfo2;
    const order = await OrderInfoTable.findOne({
        where : {
            order_id
        }
    })

    if(order === null) {
        const summary = {refresh: "2023-01-01T01:01:01Z", detail: {id: order_id}}

        // Update a empty record in DB
        await OrderInfoTable.create({
            order_id,
            summary: summary,
            update_time: "2023-01-01T01:01:01Z"
        })

        return summary
    }

    /** Construct summary by DB rec and local tag */
    console.log(`Order found in db: ${order.dataValues.order_id}`)
    if(fs.existsSync(tagFilePath)) {
        const tagdata = await ((f)=>{
            return new Promise((resolve) => {
                resolve(JSON.parse(fs.readFileSync(f, {encoding:'utf8', flag:'r'})))
            }).catch(err=>{
                console.log('JSON Parse error ' + err)
            })
        })(tagFilePath)

        // console.log(`Tag data ${JSON.stringify(tagdata)}`)
        const tag = await extractTags(tagdata.tag)

        // Use Local Cache to overwrite DB
        // order.summary.main_status = tag.main_status
        // order.summary.sub_status  = tag.sub_status
    }
    return order.summary
}


module.exports = fetchSummaryDb