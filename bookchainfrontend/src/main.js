import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import vuetify from './plugins/vuetify';
//import 'material-design-icons-iconfont/dist/material-design-icons.css'
import BookList from "./components/BookList";
import RequestPage from "./components/requests/RequestPage";


Vue.config.productionTip = false
Vue.use(VueRouter)

const routes = [
    {path: '/', component: BookList},
    {path: '/requests', component: RequestPage},
]

const router = new VueRouter({
    routes
})

new Vue({
    vuetify,
    router,
    render: h => h(App)
}).$mount('#app')
