const Koa = require('koa')
const staticCache = require('koa-static-cache')
const indexRouter = require('./routes/index')
const cors = require('koa-cors')
const dotenv = require('dotenv')
dotenv.config()

const app = new Koa()

app.use(cors())

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

app.use(staticCache({
  prefix: '/video',
  dir: './static/video',
  gzip: true,
  dynamic: true
}))

app.use(indexRouter.routes(), indexRouter.allowedMethods())

app.listen(process.env.port, '0.0.0.0', () => {
    console.log('KoaServer listen to ' + process.env.port);
})
