import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '@/Layout/index.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/main',
    children: [
      {
        path: 'main',
        component: () => import('@/views/Main.vue'),
        redirect: '/main/image',
        children: [
          {
            path: 'image',
            component: () => import('@/views/imgManage/imageBox.vue'),
          }, {
            path: 'video',
            component: () => import('@/views/videoManage/videoBox.vue'),
          }, 
        ]
      }
    ]
  },

]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router