<template>
  <div>
    <el-menu
      :default-active="activeIndex"
      class="el-menu-demo"
      mode="horizontal"
      :router="true"
    >
      <el-menu-item index="image">图片管理</el-menu-item>
      <el-menu-item index="video">视频管理</el-menu-item>
    </el-menu>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  const activeIndex = ref('image')
</script>

<style lang="scss" scoped>
</style>