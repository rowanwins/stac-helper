import { createRouter, createWebHistory } from 'vue-router'

import Stac from '@/pages/Stac.vue'
import ExternalCatalogs from '@/pages/ExternalCatalogs.vue'

const routes = [
  {
    path: "/",
    name: "external-catalogs",
    component: ExternalCatalogs,
  },
  {
    path: "/external/:stacUrl(.*)",
    name: "stac",
    component: Stac
  },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: ExternalCatalogs },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
