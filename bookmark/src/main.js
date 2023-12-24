import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import '@/assets/style/index.scss'
import { locale } from './utils/locale'
const app = createApp(App)
const pinia = createPinia()
app.use(router).use(pinia).mount('#app')


