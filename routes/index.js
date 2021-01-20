const Router = require('koa-router')
const fs = require('fs')
const koaBody = require('koa-body')

const router = new Router()

// 白名单IP列表
let whiteIp = ['127.0.0.1']

router.use(async (ctx, next) => {
    let ip = ctx.req.headers['x-forwarded-for'] ||
    ctx.req.connection.remoteAddress ||
    ctx.req.socket.remoteAddress ||
    ctx.req.connection.socket.remoteAddress;

    // 白名单内才能执行上传、删除
    if(ctx.url === '/upload' || ctx.url === '/deleteImg') {
        if(whiteIp.find(item => item === ip)) {
            await next()
        }
    } else {
        await next()
    }
    
})

router.post('/upload', koaBody({
    multipart: true,
    formidable: {
        uploadDir: './static/images',
        keepExtensions: true
    }
}), async ctx => {
    ctx.body = {
        code: 0,
        message: '上传成功'
    }
})

router.post('/imgData', ctx => {
    const list = fs.readdirSync('./static/images')

    ctx.body = {
        code: 0,
        data: list
    }
})

router.post('/deleteImg', koaBody(), ctx => {
    let imgArr = ctx.request.body.imgArr

    imgArr.forEach(item => {
        fs.unlinkSync('./static/images/' + item)
    })

    ctx.body = {
        code: 0,
        msg: '删除成功'
    }
})

module.exports = router