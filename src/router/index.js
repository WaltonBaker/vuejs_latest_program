import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/Users.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/Home'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        name: 'Welcome',
        component: Welcome
      },
      {
        path: '/users',
        name: 'Users',
        component: Users
      }
    ]
  },

]

const router = new VueRouter({
  routes,
  mode: 'history'
})
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const token = window.sessionStorage.getItem('token')
  if (!token) {
    // 这里不能使用this.$router的方法跳转，因为这是在导航守卫里面
    next('/login')

  }
  else next()
})

export default router
