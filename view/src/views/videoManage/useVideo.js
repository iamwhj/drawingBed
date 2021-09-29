import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import sparkMD5 from 'spark-md5';

export function useUploadVideo() {
  const dialogVideoUrl = ref('')
  const dialogVisible = ref(false)

  const handleRemove = function (file, fileList) {
    console.log(file, fileList);
  };
  const handlePictureCardPreview = function (file) {
    dialogVideoUrl.value = file.url
    dialogVisible.value = true
  };

  return {
    dialogVideoUrl,
    dialogVisible,
    handleRemove,
    handlePictureCardPreview
  }
}

export function useGetVideoList() {
  const videoList = ref([])
  const nameLimit = 16
  function getVideoList() {
    axios.post('/base/videoData').then(result => {
      let res = result.data
      if (res.code === 0) {
        const tempArr = res.data || []

        tempArr.forEach(video => {
          const len = video.name.length
          video.shortName = video.name.slice(len - nameLimit > 0 ? len - nameLimit : 0)
        })
        videoList.value = tempArr
      }
    })
  }
  return {
    videoList,
    getVideoList
  }
}

export function useGetVideoOpt() {
  const options = reactive({
    width: "100%", //播放器高度
    height: "100%", //播放器高度
    color: "#409eff", //主题色
    title: "", //视频名称
    src: "", //视频源
    muted: false, //静音
    webFullScreen: false,
    speedRate: ["0.75", "1.0", "1.25", "1.5", "2.0"], //播放倍速
    autoPlay: false, //自动播放
    loop: false, //循环播放
    mirror: false, //镜像画面
    ligthOff: false, //关灯模式
    volume: 0.3, //默认音量大小
    control: false, //是否显示控制
    controlBtns: [
      "audioTrack",
      "quality",
      "speedRate",
      "volume",
      "setting",
      "pip",
      "pageFullScreen",
      "fullScreen",
    ], //显示所有按钮,
  });

  return options
}

export function useClickImg() {
  const delImgList = ref([])
  const batchDelFlag = ref(false)
  const clickImgCard = (imgName) => {
    if (batchDelFlag.value) {
      let i = delImgList.value.findIndex(name => name === imgName)
      if (i >= 0) {
        delImgList.value.splice(i, 1)
      } else {
        delImgList.value.push(imgName)
      }
    } else {
      // 复制图片名
      const copyInp = document.createElement('input')
      copyInp.setAttribute('value', imgName)
      app.appendChild(copyInp)
      copyInp.select()
      const copyed = document.execCommand("Copy")
      app.removeChild(copyInp)
      if (copyed) {
        ElMessage({
          message: '复制成功',
          type: 'success'
        })
      }
    }
  }

  const cancelDelImg = () => {
    batchDelFlag.value = false
    delImgList.value = []
  }

  return {
    delImgList,
    batchDelFlag,
    clickImgCard,
    cancelDelImg
  }
}

export function useDelImg() {
  const batchDelImg = (delImgList = []) => {
    return axios.post('/base/deleteVideo', {
      videoArr: delImgList
    })
  }
  return batchDelImg
}

export function useBigFileUpload(flushList) {
  const showProgress = ref(false)
  const abort = ref(false)
  const percentage = ref(0)
  const customColors = ref([
    { color: '#f56c6c', percentage: 20 },
    { color: '#e6a23c', percentage: 40 },
    { color: '#6f7ad3', percentage: 60 },
    { color: '#1989fa', percentage: 80 },
    { color: '#5cb87a', percentage: 100 },
  ])

  let partList = [],
      suffix = '',
      currentCnt = 0;

  // 文件切片
  const changeFile = (fileObj) => {
    const file = fileObj.raw,
      chunkSize = 2097152, // 每片2M
      chunks = Math.ceil(file.size / chunkSize),
      spark = new sparkMD5.ArrayBuffer(),
      fileReader = new FileReader();
    let currentChunk = 0

    percentage.value = 0
    showProgress.value = true

    // 视频后缀
    suffix = file.name.split('.')[1]

    fileReader.onload = function (e) {
      console.log('read chunk nr', currentChunk + 1, 'of', chunks);
      spark.append(e.target.result)

      currentChunk++

      let section = {
        name: currentChunk,
        chunk: e.target.result
      }
      partList.push(section)

      if (currentChunk < chunks) {
        loadNext()
      } else {
        console.log('分片完成');
        const hash = spark.end()
        partList.forEach(part => part.name = `${part.name}_${hash}.${suffix}`)

        console.timeEnd('read time')

        // 开始发送
        sendSection()
      }
    }
    fileReader.onerror = function () {
      console.log('have something went wrong');
    }

    function loadNext() {
      const start = currentChunk * chunkSize
      const end = start + chunkSize >= file.size ? file.size : start + chunkSize

      fileReader.readAsArrayBuffer(file.slice(start, end))
    }
    console.time('read time')
    loadNext()
  }

  // 开始发送分片
  const sendSection = async () => {
    console.time('send time')
    for (let i = currentCnt; i < partList.length; i++) {
      if (!abort.value) {
        const formData = new FormData()
        formData.append('name', partList[i].name)
        formData.append('chunk', new Blob([partList[i].chunk]))
        await new Promise((resolve, reject) => {
          axios.post('/base/section', formData)
          .then(res => {
            currentCnt++
            percentage.value = ~~(currentCnt / partList.length * 100)
            resolve()
          })
        })
      } else {
        // 点击暂停
        break;
      }
    }
    if (currentCnt === partList.length) {
      // 发送完成
      axios.get('/base/merge').then(result => {
        let res = result.data
        if (res.code === 0) {
          partList = []
          setTimeout(() => {
            flushList()
            showProgress.value = false
            currentCnt = 0
          }, 3000)
        }
      })
      console.timeEnd('send time')
    }
  }

  // 断点续传
  const pauseSend =  () => {
    abort.value = true
  }
  const keepSend = () => {
    abort.value = false
    sendSection()
  }
  return {
    changeFile,
    percentage,
    customColors,
    showProgress,
    abort,
    pauseSend,
    keepSend
  }
}