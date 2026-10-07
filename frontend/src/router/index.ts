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
    {
      path: '/chamados/:id/editar',
      name: 'chamado-editar',
      component: () => import('../views/ChamadoFormView.vue'),
      meta: { requerAuth: true },
    },
    {
      path: '/admin',
      component: () => import('../views/admin/AdminView.vue'),
      meta: { requerAuth: true, papeis: ['ADMIN'] },
      children: [
        { path: '', redirect: { name: 'admin-categorias' } },
        {
          path: 'categorias',
          name: 'admin-categorias',
          component: () => import('../views/admin/CategoriasAdminView.vue'),
        },
        {
          path: 'usuarios',
          name: 'admin-usuarios',
          component: () => import('../views/admin/UsuariosAdminView.vue'),
        },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!auth.estaAutenticado) {
    return to.meta.requerAuth ? { name: 'login' } : true
  }
  if (to.name === 'login') {
    return { name: 'chamados' }
  }

  if (!auth.usuario) {
    try {
      await auth.carregarUsuarioAtual()
    } catch {
      auth.logout()
      return { name: 'login' }
    }
  }

  // Só esconde a tela; quem barra de verdade é o backend.
  const papel = auth.usuario?.papel
  if (to.meta.papeis && (!papel || !to.meta.papeis.includes(papel))) {
    return { name: 'chamados' }
  }
})

export default router
