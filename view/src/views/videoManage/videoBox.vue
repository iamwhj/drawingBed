<template>
  <div>
    <div style="margin: 10px 0 0 19px">
      <el-upload
        drag
        :auto-upload="false"
        action=""
        :on-change="changeFile"
        :show-file-list="false"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">
          Drop file here or <em>click to upload</em>
        </div>
        <template #tip>
          <div class="el-upload__tip" style="width: 400px" v-show="showProgress">
            <el-progress :percentage="percentage" :color="customColors" />
            <div style="position: absolute; left: 430px; top: 310px">
              <el-button type="danger" size="mini" v-if="!abort" @click="pauseSend">暂停</el-button>
              <el-button type="success" size="mini" v-else @click="keepSend">继续</el-button>
            </div>
          </div>
        </template>
      </el-upload>
    </div>
    <div class="delBox">
      <el-button type="primary" v-if="!batchDelFlag" @click="batchDelFlag=true">批量删除</el-button>
      <div v-else>
        <el-button type="danger" @click="deleteImg">确 定</el-button>
        <el-button type="info" @click="cancelDelImg">取 消</el-button>
      </div>
    </div>
    <div class="videoBox">
      <el-row>
        <el-col :span="5" v-for="video in videoList" :key="video.name">
          <el-badge :is-dot="delImgList.includes(video.name)" >
            <el-card :body-style="{ padding: '0px' }" @click="clickImgCard(video.name)">
              <div style="width: 100%; display: block">
                <videoPlay v-bind="videoOptions" :src="'/video/' + video.name">
                </videoPlay>
              </div>
              <div style="padding: 0 0px 10px 10px">
                <p>{{ video.shortName }}</p>
                <span style="margin-right: 20px">Type: {{ video.type }}</span>
                <span>Size: {{ video.size }}</span>
              </div>
            </el-card>
          </el-badge>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { videoPlay } from "vue3-video-play";
import "vue3-video-play/dist/style.css";
import { useUploadVideo, useGetVideoList, useGetVideoOpt, useClickImg, useDelImg, useBigFileUpload } from "./useVideo.js";



const {
  dialogVideoUrl,
  dialogVisible,
  handleRemove,
  handlePictureCardPreview,
} = useUploadVideo();

const { videoList, getVideoList} = useGetVideoList()
getVideoList()

const videoOptions = useGetVideoOpt()

const { delImgList, batchDelFlag, clickImgCard, cancelDelImg } = useClickImg()

const batchDelImg = useDelImg()
const deleteImg = () => {
  batchDelImg(delImgList.value).then(result => {
    let res = result.data
    if (res.code === 0) {
      let newList = videoList.value.filter(v => !delImgList.value.includes(v.name))
      videoList.value = newList
      batchDelFlag.value = false
      delImgList.value = []
    }
  })
}

const { changeFile, customColors, percentage, showProgress, abort, pauseSend, keepSend } = useBigFileUpload(getVideoList)
</script>

<style lang="scss" scoped>
  .delBox {
    position: absolute;
    right: 400px;
    top: 60px;
  }
</style>