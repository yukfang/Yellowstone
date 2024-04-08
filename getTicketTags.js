const fs = require('fs');

const CACHE_DIR = (process.env.PLATFORM == 'FAAS')?'../order_platform/':'./order_platform/'
let mem_data_ticket_tags = {
}


async function get_ticket_tags(order, refresh) {
    {
        const tags = await get_ticket_tags_mem(order)
        if(tags) return tags;
    }

    {
        const tags = await get_ticket_tags_local(order)
        if(tags) return tags;
    }

    return mem_data_ticket_tags[order.id];
}

async function get_ticket_tags_mem(order) {
    const tag = mem_data_ticket_tags[order.id];
    if(!tag) return null;

    if(Date.now() - tag.fetchTime > 1000 * 60 * 5) return null

    return mem_data_ticket_tags[order.id]
 }

async function get_ticket_tags_local(order) {
    const tags_path = `${CACHE_DIR}/tags/${order.id}.json`;
    if(fs.existsSync(tags_path)) {
        const tag = await ((f)=>{
            return new Promise((resolve) => {
                resolve(JSON.parse(fs.readFileSync(f, {encoding:'utf8', flag:'r'})))
            }).catch(err=>{
                console.log('JSON Parse error ' + err)
            })
        })(tags_path)

        // Update In-Mem Data
        mem_data_ticket_tags[order.id] = tag;
        mem_data_ticket_tags[order.id].fetchTime = Date.now();
        return tag;
    }
    return null
}




module.exports = get_ticket_tags