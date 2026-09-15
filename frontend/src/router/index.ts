import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/',
      name: 'chamados',
      component: () => import('../views/ChamadosListView.vue'),
      meta: { requerAuth: true },
    },
    {
      path: '/chamados/novo',
      name: 'chamado-novo',
      component: () => import('../views/ChamadoFormView.vue'),
      meta: { requerAuth: true },
    },
    {
      path: '/chamados/:id',
      name: 'chamado-detalhe',
      component: () => import('../views/ChamadoDetailView.vue'),
      meta: { requerAuth: true },
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requerAuth && !auth.estaAutenticado) {
    return { name: 'login' }
  }
  if (to.name === 'login' && auth.estaAutenticado) {
    return { name: 'chamados' }
  }
})

export default router
