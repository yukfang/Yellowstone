const fs            = require('fs');
const Koa           = require('koa');
const Router        = require('koa-router');

const koaApp        = new Koa();
const router        = new Router();

const get_order_info = require(`./getOrderInfo`)

koaApp.use(router.routes()).use(router.allowedMethods())

router.get('/:order_id?', getOrderInfo)
router.get('/', getOrderInfo)


async function getOrderInfo(ctx, next){
    const order_id = ctx.params.order_id || ctx.query.order_id
    if(order_id === null) {
      console.log(`no order_id found`)
      return
    }
    const info = await get_order_info(order_id)
    ctx.body = info
}


// logger
koaApp.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.get('X-Response-Time');
  console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

// x-response-time

koaApp.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

// response
koaApp.use(async (ctx, next) => {
    if (ctx.path === '/') {
        ctx.body = fs.readFileSync('index.html', {encoding:'utf8', flag:'r'});
    }  else {
        ctx.body = 'Hello World: ' + ctx.path;
    }

    next();
})

async function init() {
    console.log(`This is a happy INIT...`)
}

module.exports = {
  koaApp,
  init,
};
