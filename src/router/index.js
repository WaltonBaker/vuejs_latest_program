import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/user/Login.vue'
import Home from '../components/user/Home.vue'
import Welcome from '../components/user/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Cate from '../components/goods/Cate.vue'
import Params from '../components/goods/Params.vue'
import List from '../components/goods/List.vue'
import Add from '../components/goods/Add.vue'
import Order from '../components/order/Order.vue'
import Report from '../components/report/Report.vue'

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
      },
      {
        path: '/rights',
        name: 'Rights',
        component: Rights
      },
      {
        path: '/roles',
        name: 'Roles',
        component: Roles
      },
      {
        path: '/categories',
        name: 'Cate',
        component: Cate
      },
      {
        path: '/params',
        name: 'Params',
        component: Params
      },
      {
        path: '/goods',
        name: 'List',
        component: List,
        // 使用children属性添加子组件时,访问子组件时不需要拼接父组件的path
        // 嵌套children属性时,在爷爷组件内添加router-view标签,孙子组件并不能在爷爷组件内渲染
        // children: [{
        //   path: '/add',
        //   name: 'Add',
        //   component: Add
        // }]
      },
      {
        // 此处的path属性是一种假象,并没有嵌套路由,只是为了读者看起来结构清晰
        path: '/goods/add',
        name: 'Add',
        component: Add
      },
      {
        path: '/orders',
        name: 'Order',
        component: Order
      },
      {
        path: '/reports',
        name: 'Report',
        component: Report
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
