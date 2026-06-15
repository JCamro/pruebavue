import { createRouter, createWebHistory } from 'vue-router'
import EnrollmentCertificate from '../views/EnrollmentCertificate.vue'

const routes = [
  {
    path: '/',
    redirect: '/constancia/20250100',
  },
  {
    path: '/constancia/:cui?',
    name: 'certificate',
    component: EnrollmentCertificate,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
