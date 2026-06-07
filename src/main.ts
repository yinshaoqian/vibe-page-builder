import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import './assets/main.css'

import Builder from './views/Builder.vue'
import ComponentEditor from './views/ComponentEditor.vue'
import GlobalConfig from './views/GlobalConfig.vue'

const routes = [
  { path: '/', redirect: '/builder' },
  { path: '/builder', name: 'Builder', component: Builder },
  { path: '/component-editor', name: 'ComponentEditor', component: ComponentEditor },
  { path: '/global-config', name: 'GlobalConfig', component: GlobalConfig },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

const app = createApp(App)
app.use(router)
app.mount('#app')