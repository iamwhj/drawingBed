<template>
  <div>
    <div style="margin: 10px 0 0 19px">
      <el-upload
        action="/base/uploadImage"
        list-type="picture-card"
        :on-preview="handlePictureCardPreview"
        :on-remove="handleRemove"
        :on-success="getImgList"
      >
        <i class="el-icon-plus"></i>
      </el-upload>
      <el-dialog v-model="dialogVisible">
        <img style="width: 100%; height: 100%" :src="dialogImageUrl" alt="" />
      </el-dialog>
    </div>
    <div class="delBox">
      <el-button type="primary" v-if="!batchDelFlag" @click="batchDelFlag=true">批量删除</el-button>
      <div v-else>
        <el-button type="danger" @click="deleteImg">确 定</el-button>
        <el-button type="info" @click="cancelDelImg">取 消</el-button>
      </div>
    </div>
    <div class="imgBox">
      <el-row>
        <el-col :span="4" v-for="img in imgList" :key="img.name">
          <el-badge :is-dot="delImgList.includes(img.name)" >
            <el-card :body-style="{ padding: '0px' }">
              <img
                style="width: 100%; display: block"
                :src="'/image/' + img.name"
                :title="img.name"
                @click="clickImgCard(img.name)"
              />
              <div style="padding: 10px">
                <p>{{ img.shortName }}</p>
                <span style="margin-right: 20px">Type: {{ img.type }}</span>
                <span>Size: {{ img.size }}</span>
              </div>
            </el-card>
          </el-badge>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { useUploadImg, useGetImgList, useClickImg, useDelImg } from "./useImage.js";
import { ref } from 'vue'

const {
  dialogImageUrl,
  dialogVisible,
  handleRemove,
  handlePictureCardPreview,
} = useUploadImg();

const { imgList, getImgList} = useGetImgList()
getImgList()

const { delImgList, batchDelFlag, clickImgCard, cancelDelImg } = useClickImg()

const batchDelImg = useDelImg()
const deleteImg = () => {
  batchDelImg(delImgList.value).then(result => {
    let res = result.data
    if (res.code === 0) {
      getImgList()
      batchDelFlag.value = false
    }
  })
}

</script>

<style lang="scss" scoped>
  .imgBox {
    margin-top: 20px;
  }
  .delBox {
    position: absolute;
    right: 400px;
    top: 60px;
  }
</style>