const getOrderTag       = require('./utils/athena/tag')
const fs                = require('fs')
const token             = require('./utils/athena/cookie')
const delayms           = (ms) => new Promise((res, rej) => {setTimeout(res, ms * 1)})

 
async function tagTask() {
    console.log(`>>>>>> Start Timer Refreshing...`)
    await token();
    const cachePath = `./LocalCache`
    if (!fs.existsSync(cachePath)){
        fs.mkdirSync(cachePath);
        return;
    }

    const files = fs.readdirSync(cachePath)
    let tags = []
    for(let i = 0; i < files.length; i++) {
        const filePath = `${cachePath}/${files[i]}`
        if(fs.existsSync(filePath)) {
            const tag = await ((f)=>{
                return new Promise((resolve) => {
                    resolve(JSON.parse(fs.readFileSync(f, {encoding:'utf8', flag:'r'})))
                }).catch(err=>{
                    console.log('JSON Parse error ' + err)
                })
            })(filePath)

            tags.push(tag)
        }
    }
    tags = tags.sort((a,b)=>a.refresh - b.refresh).slice(0,5)

    console.table(tags)

    for(let i = 0; i < tags.length; i++) {
        const order_id =  (tags[i]).order_id
        const refresh   = (new Date(tags[i].refresh || '2020-01-01T01:01:01Z')).getTime()
        const now       = Date.now()

         if(now - refresh > 1000 * 30) {
            console.log(`---------Start refresh for ${order_id}---------`)
            const tag = await getOrderTag(order_id)
            fs.writeFileSync(`${cachePath}/${order_id}.json`, JSON.stringify({
                order_id,  refresh : new Date(now), tag
            }, null , 2 ))
        }

        await delayms(256)
    }
    console.log(`... End Tag Refreshing <<<`)
}

async function run() {
    while(true) {
        await tagTask();
        // return
        await delayms(1000 * 1 * 1)
    }
}

run();