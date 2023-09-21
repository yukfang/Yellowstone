const TABLES =  require('./database/table')

const raw_adv = 
    `
7238455956114358273
6847359092017594374
6972055561814671361
7124609263242182657
7124869619755581442
6833207168313851909
6880714647876403202
7124609625504202754
7255235023396274177
7137908276439646209
7235850610942263297
6961941628504276993
7253495648866091010
6829485241162268677
7013118032666984449
7124875301292670978
7244057174287089666
7278155290124795905
7260023613645012993
    `


let so_adv = []
raw_adv.trim().split('\n').forEach(x => {
    const ids = x.trim().split(',')
    for(let i = 0; i < ids.length; i++) {
        so_adv.push(ids[i])
    }
})

console.log(so_adv)



async function findOrderByAdv() {
    const OrderInfoTable = await TABLES.OrderInfo2;
    const orders = await OrderInfoTable.findAll();
    console.log(orders.map(o=>o.dataValues))

    const fruits = []
    for(let i = 0; i < so_adv.length; i++) {
        const adv_id = so_adv[i]
        for(let o = 0; o < orders.length; o++) {
            const order = orders[o]
            // console.log(order.summary)
            if(order.summary?.adv_id?.indexOf(adv_id) !== -1 ) {
                fruits.push({
                    adv_id,
                    ticket_id: order.order_id,
                    follower: order.summary.follower
                })
                break;
            }
        }
    }
    console.table(fruits)
}
// findOrderByAdv()