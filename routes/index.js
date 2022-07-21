const fs = require('fs')
const path = require('path')

const Router = require('koa-router')
const koaBody = require('koa-body')

const multiparty2 = require('koa2-multiparty')

const router = new Router({
  prefix: '/base'
})

// 白名单IP列表
let whiteIp = ['127.0.0.1']

router.use(async (ctx, next) => {
    let ip = ctx.req.headers['x-forwarded-for'] ||
    ctx.req.connection.remoteAddress ||
    ctx.req.socket.remoteAddress ||
    ctx.req.connection.socket.remoteAddress;

    const imgFolder = path.resolve(__dirname, '../static/images/')
    const videoFolder = path.resolve(__dirname, '../static/video/')
    !fs.existsSync(imgFolder) ? fs.mkdirSync(imgFolder) : ''
    !fs.existsSync(videoFolder) ? fs.mkdirSync(videoFolder) : ''

    // 白名单内才能执行上传、删除
    const checkRoute = ['/base/uploadImage', '/base/deleteImg']
    if(checkRoute.includes(ctx.url)) {
        if(whiteIp.find(item => item === ip)) {
            await next()
        } else {
            ctx.body = {
              code: 403,
              message: '无权限上传图片，请联系管理员进行IP开通！'
            }
        }
    } else {
        await next()
    }
})

router.get('/', ctx => {
    // 重定向(接口作废)
    ctx.redirect('/public/index.html')
})

router.post('/uploadImage', koaBody({
    multipart: true,
    formidable: {
      uploadDir: './static/images/',
      keepExtensions: true,
    }
}), async ctx => {
    const devicePath = ctx.request.files.file.path;
    const ripeImgName = devicePath.match(/upload_(.+)/g)[0];
    const { serve_address, port } = process.env;
    const ripeImgPath = `${serve_address}:${port}/image/${ripeImgName}`
    ctx.body = {
      code: 0,
      imgUrl: ripeImgPath,
      message: '上传成功'
    }
})  

router.post('/uploadVideo', koaBody({
  multipart: true,
  formidable: {
    uploadDir: './static/video',
    keepExtensions: true,
    maxFileSize: 2 * 1024 * 1024 * 1024
  }
}), async ctx => {
  ctx.body = {
    code: 0,
    message: '上传成功'
  }
})

router.post('/imgData', ctx => {
    const rootPath = './static/images/'
    const list = fs.readdirSync(rootPath)
    const data = []
    
    list.forEach(imgName => {
      const imgInfo = fs.readFileSync(rootPath + imgName)
      
      const size = ~~(imgInfo.length / 1024) + ' KB'
      const type = imgName.split('.')[1]
      data.push({
        name: imgName,
        size,
        type
      })
    })

    ctx.body = {
        code: 0,
        data: data
    }
})

router.post('/videoData', ctx => {
  const rootPath = './static/video/'
  const list = fs.readdirSync(rootPath)
  const data = []
  
  list.forEach(video => {
    const videoInfo = fs.readFileSync(rootPath + video)
    
    const size = ~~(videoInfo.length / 1024) + ' KB'
    const type = video.split('.')[1]
    data.push({
      name: video,
      size,
      type
    })
  })

  ctx.body = {
      code: 0,
      data: data
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

router.post('/deleteVideo', koaBody(), ctx => {
  let videoArr = ctx.request.body.videoArr

  videoArr.forEach(item => {
      fs.rm('./static/video/' + item, (err, res) => {
        if (err) {
          console.log('video删除失败', err);
        }
      })
  })

  ctx.body = {
      code: 0,
      msg: '删除成功'
  }
})

let partList = [] // 用于存储切片
router.post('/section', multiparty2(), async ctx => {
  ctx.response.set('connection', 'keep-alive')

  const id = ctx.req.body.name.split('_')[0]
  const params = ctx.req.body
  const chunk = ctx.req.files.chunk
  partList.push({
    id: id,
    name: params.name,
    chunkFile: chunk
  })
  ctx.body = {
    code: 0,
    message: '切片传输成功'
  }
})

router.get('/merge', ctx => {
  const fileName =  partList[0].name
  const hash = /_(\w+)./.exec(fileName)[1]
  const suffix = /[\w]+(.\w+)/.exec(fileName)[1]

  const p = path.resolve(__dirname, '../static/video')
  const fillPath = `${p}/${hash}${suffix}`

  if (!fs.existsSync(fillPath)) {
    partList.sort((a, b) => Number(a.id) - Number(b.id))
    partList.forEach(item => {
      const data = new Uint8Array(fs.readFileSync(item.chunkFile.path))
      fs.appendFileSync(fillPath , data);
    })
    console.log('合并成功，总片数:', partList.length);
  } else {
    console.log('文件已存在');
  }
  partList = []

  ctx.body = {
    code: 0,
    message: '合并成功'
  }
})

module.exports = router