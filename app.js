const Koa = require('koa')
const staticCache = require('koa-static-cache')
const indexRouter = require('./routes/index')

const app = new Koa()


app.use(staticCache({
    prefix: '/public',
    dir: './public',
    gzip: true,
    dynamic: true
}))

app.use(staticCache({
    prefix: '/image',
    dir: './static/images',
    gzip: true,
    dynamic: true
}))


app.use(indexRouter.routes(), indexRouter.allowedMethods())

app.listen(8081, '0.0.0.0', () => {
    console.log('KoaServer listen to 8081');
})
