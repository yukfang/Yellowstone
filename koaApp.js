const fs                = require('fs');
const token             = require('./utils/athena/cookie')

const buildBodyRemote       = require('./buildBodyRemote')
const getSummaryFromDB     = require('./getSummaryFromDB')

const delayms = (ms) => new Promise((res, rej) => {setTimeout(res, ms * 1)})


const Koa = require('koa');
const koaApp = new Koa();
var port = (process.env.PORT ||  80 );

koaApp.use(async (ctx, next) => {
    await next();
    const rt = ctx.response.get('X-Response-Time');
    console.log(`${ctx.method} ${ctx.url} - ${rt} \n\n`);
    console.log('-------------------------------------------------------------------')
});

// x-response-time
koaApp.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
});

koaApp.use(async (ctx, next) => {
    console.log('-------------------------------------------------------------------')
    if (ctx.path === '/summary') {
        let order_id = `${ctx.query.order_id}`
        console.log(`>>>>>> Processing ${order_id} >>>>>>`)
        let body = await buildBody(order_id);
        console.log("\n")

        ctx.body = body
    } else if (ctx.path === '/list') {
        let list = await getOrderList();
        ctx.body = list
    } else if (ctx.path === '/') {
            ctx.body = fs.readFileSync('index.html', {encoding:'utf8', flag:'r'});
    } else {
        ctx.body = 'Hello World: ' + ctx.path;
    }

    next();
})

async function buildBody(order_id){
    if(order_id > 0) {
        const body = await getSummaryFromDB(order_id)
        return JSON.stringify(body, null, 2)
    }  else {
        return JSON.stringify({msg: `Unknown order id ${order_id}`}, null, 2)
    }

}


async function buildBodyLocal(order_id) {
    const cachePath = `./LocalCache/${order_id}.json`
 
    if(fs.existsSync(cachePath)) {
        const summary = await ((f)=>{
            return new Promise((resolve) => {
                resolve(JSON.parse(fs.readFileSync(f, {encoding:'utf8', flag:'r'})))
            }).catch(err=>{
                console.log('JSON Parse error ' + err)
            })
        })(cachePath)

        const ts_now = Date.now()
        const ts_last = new Date(summary.refresh)

        const REFRESH_INTERVAL = 60
        if(ts_now - ts_last <= 1000 * 60 * REFRESH_INTERVAL) {
            console.log(`Last Refresh is ${summary.refresh}, less than ${REFRESH_INTERVAL}, use Local`)
            return JSON.stringify(summary, null, 2)
        } 
    }

    return null
}

async function initExistingTickets() {
    const tickets = require('./tickets')

    for(let i = 0; i < tickets.length; i++) {
        const ticket = tickets[i];
        if(!fs.existsSync(`./LocalCache/${ticket}.json`)) {
            fs.writeFileSync(`./LocalCache/${ticket}.json`, JSON.stringify({refresh: "2023-01-01T01:01:01Z", detail: {id: ticket}, id: ticket}))
        }
    }
} 
 
async function init() {
    console.log(`Server Init ---> ${(new Date(Date.now())).toISOString()}`);

    if(!fs.existsSync(`./database/db_conn_local.js`)) {
        fs.writeFileSync(`./database/db_conn_local.js`, "module.exports={}")
    }

    const LocalCachePath = './LocalCache'
    if (!fs.existsSync(LocalCachePath)) {
        fs.mkdirSync(LocalCachePath, { recursive: true });
    } 
}
   
module.exports = {
  koaApp,
  init,
};