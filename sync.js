const fs = require('fs')
const token = require('./utils/athena/cookie')
const buildBodyRemote       = require('./buildBodyRemote')
const delayms = (ms) => new Promise((res, rej) => {setTimeout(res, ms * 1)})


async function timerTask() {
    console.log(`>>>>>> Start Timer Refreshing...`)
    await token();
    const cachePath = `./LocalCache`
    if (!fs.existsSync(cachePath)){
        fs.mkdirSync(cachePath);
    }

    const files = fs.readdirSync(cachePath)
    const summaries = []
    for(let i = 0; i < files.length; i++) {
        const filePath = `${cachePath}/${files[i]}`
        if(fs.existsSync(filePath)) {
            const summary = await ((f)=>{
                return new Promise((resolve) => {
                    resolve(JSON.parse(fs.readFileSync(f, {encoding:'utf8', flag:'r'})))
                }).catch(err=>{
                    console.log('JSON Parse error ' + err)
                })
            })(filePath)

            summaries.push(summary)
        }
    }
    // summaries.sort((a,b) => new Date(a.refresh) - new Date(b.refresh))
    summaries.sort((a,b) => a.id - b.id)

    console.log(`summary len = ${summaries.length}`)
    console.log(summaries.map(s => s.refresh))

    for(let i = 0; i < summaries.length; i++) {
        buildBodyRemote(summaries[i].detail.id).then(x=>{
            console.log(`---------End refresh for ${JSON.parse(x).detail.id}`)
        })
        await delayms(200)
    }
    console.log(`... End Timer Refreshing <<<`)

}

timerTask();
setInterval(timerTask, 1000 * 60 * 15)