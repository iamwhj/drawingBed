import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

export function useUploadImg() {
  const dialogImageUrl = ref('')
  const dialogVisible = ref(false)

  const handleRemove = function (file, fileList) {
    console.log(file, fileList);
  };
  const handlePictureCardPreview = function (file) {
    dialogImageUrl.value = file.url
    dialogVisible.value = true
  };

  return {
    dialogImageUrl,
    dialogVisible,
    handleRemove,
    handlePictureCardPreview
  }
}

export function useGetImgList() {
  const imgList = ref([])
  const nameLimit = 16
  function getImgList() {
    axios.post('/base/imgData').then(result => {
      let res = result.data
      if (res.code === 0) {
        const tempArr = res.data || []
  
        tempArr.forEach(img => {
          const len = img.name.length
          img.shortName = img.name.slice(len - nameLimit > 0 ? len - nameLimit : 0)
        })
        imgList.value = tempArr
      }
    })
  }
  return {
    imgList,
    getImgList
  }
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
      const imgPrefixPath = process.env.VUE_APP_IMAGE_PREFIX;
      const copyInp = document.createElement('input')
      copyInp.setAttribute('value', imgPrefixPath + imgName)
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
  const batchDelImg = (delImgList=[]) => {
    return axios.post('/base/deleteImg', {
      imgArr: delImgList
    })
  }
  return batchDelImg
}