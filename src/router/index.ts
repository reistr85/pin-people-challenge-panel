import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'

import NavBar from '@/components/NavBar.vue'
import ListClients from '@/views/ListClients.vue'
import ListEmployees from '@/views/ListEmployees.vue'
import Dashboard from '@/views/Dashboard.vue'
import ShowClient from '@/views/ShowClient.vue'
import ShowEmployee from '@/views/ShowEmployee.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: Dashboard },
    { path: '/clientes', component: ListClients },
    { path: '/clientes/novo', component: ShowClient },
    { path: '/clientes/:uuid', component: ShowClient },
    { path: '/clientes/:uuid/editar', component: ShowClient },
    { path: '/colaboradores', component: ListEmployees },
    { path: '/colaboradores/novo', component: ShowEmployee },
    { path: '/colaboradores/:uuid', component: ShowEmployee },
    { path: '/colaboradores/:uuid/editar', component: ShowEmployee },
  ],
})

router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (localStorage.getItem('vuetify:dynamic-reload')) {
      console.error('Dynamic import error, reloading page did not fix it', err)
    } else {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
