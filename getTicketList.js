const fs = require('fs');
const api_list_invoke = require('./utils/athena/list');

const DATA_REFRESH_INTERVAL = 15 // min
const CACHE_DIR = (process.env.PLATFORM == 'FAAS')?'../order_platform/':'./order_platform/'
let mem_data_ticket_list = {fetch_time: 0}

async function get_ticket_list(refresh) {
    /** 1. Use in memory data  */
    {
        // const orders = await get_ticket_list_mem();
        // if(orders) return orders;
    }

    /** 2. Read data from disk */
    {
        const orders = await get_ticket_list_local();
        if(orders) return orders;
    }

    return mem_data_ticket_list.orders;
}

async function get_ticket_list_mem() {
    console.log(`>>Eval: In-Memory: now = ${(new Date()).toISOString()}, Fetch Time = ${(new Date(mem_data_ticket_list.fetch_time)).toISOString()}, Age = ${Math.round((Date.now() - mem_data_ticket_list.fetch_time)/60000)} minutes`)
    if(Date.now() - mem_data_ticket_list.fetch_time < 1000 * 60 * DATA_REFRESH_INTERVAL) {
        console.log('  👍->Use In-Momory Data for Order List')
        return mem_data_ticket_list.orders;
    } else {
        console.log('  ❌->In-Memory Ticket List Data is too old, need to read disk...');
        return null;
    }
}

async function get_ticket_list_local() {
   try {
       const disk_data = await ((f) => {
           return new Promise((resolve, rej) => {
               resolve(JSON.parse(fs.readFileSync(`${CACHE_DIR}order_list.json`, {encoding:'utf8', flag:'r'})));
           }).catch(err=>{
               console.log(err)
           })
        })(`${CACHE_DIR}order_list.json`)

        if(disk_data) {
            mem_data_ticket_list = disk_data;

            {
                let age = Date.now() - disk_data.fetch_time;
                console.log(`>>Eval: Disk: now = ${(new Date()).toISOString()}, Fetch Time = ${(new Date(disk_data.fetch_time)).toISOString()}, Age = ${Math.round((age)/60000)} minutes`)
                if(age > 1000 * 60 * DATA_REFRESH_INTERVAL) {
                    console.log('  ❌->On-Disk Ticket List Data is out dated...')
                }
            }

            return disk_data.orders;
        }
   } catch(err) {
       console.log(err);
   }

   return null;
}

module.exports = get_ticket_list

