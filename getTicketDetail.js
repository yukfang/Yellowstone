const fs = require('fs');
// const api_detail_invoke = require('./utils/athena/detail');
// const api_tag_invoke = require('./utils/athena/tag');


const CACHE_DIR = (process.env.PLATFORM == 'FAAS')?'../order_platform/':'./order_platform/'
let mem_data_ticket_detail = {
    fetchTime: 0
}


async function get_ticket_detail(order) {
    {
        const detail = await get_ticket_detail_mem(order)
        if(detail) return detail;
    }

    {
        const detail = await get_ticket_detail_local(order)
        if(detail) return detail;
    }

    return mem_data_ticket_detail[order.id];
}

async function get_ticket_detail_mem(order) {
    // Get from in mem data
    const detail = mem_data_ticket_detail[order.id]
    if(detail && order.update_time == detail.update_time) {
        return detail
    }
    return null;
}

async function get_ticket_detail_local(order) {
    const detail_path = `${CACHE_DIR}/detail/${order.id}.json`;
    if(fs.existsSync(detail_path)) {
        const detail = await ((f)=>{
            return new Promise((resolve) => {
                resolve(JSON.parse(fs.readFileSync(f, {encoding:'utf8', flag:'r'})))
            }).catch(err=>{
                console.log('JSON Parse error ' + err)
            })
        })(detail_path)

        // Update In-Mem Data
        mem_data_ticket_detail[order.id] = detail;
        return detail;
    }
    return null
}

module.exports = get_ticket_detail