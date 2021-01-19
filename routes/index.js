const Router = require('koa-router')
const fs = require('fs')

const router = new Router()

router.post('/upload', async ctx => {
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

router.post('/deleteImg', ctx => {
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