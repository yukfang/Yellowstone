const fs    = require('fs');

async function readCache() {
    const cachePath = `../LocalCache/`

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

    console.log(summaries.map(s => {
        return {
            id          : s.detail.id,
            category    : s.detail.archive_category_1_name,
            adv_id      : s.adv_id,
            
        }
    }))
}

async function searchTicket(adv_id){

}

async function test() {
    readCache()
}

test()