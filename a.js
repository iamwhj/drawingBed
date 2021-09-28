const fs = require('fs')
const path = require('path')

const p = path.resolve(__dirname) + '/file'

if (!fs.existsSync(p)) {
  fs.mkdirSync(p)
} else {
  console.log('文件已存在');
}