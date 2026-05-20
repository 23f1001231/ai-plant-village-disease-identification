import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import AboutView from '@/views/AboutView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/result', name: 'result', component: () => import('@/views/DiagnosisResultView.vue') },
    { path: '/treatment', name: 'treatment', component: () => import('@/views/HyperlocalTreatmentAdvisorView.vue') },
    { path: '/about', name: 'about', component: AboutView },
  ],
})

export default router
