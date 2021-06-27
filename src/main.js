import Vue from 'vue'
import router from './router'

import { request } from './network/request'
import './plugins/element.js'
import App from './App.vue'

// 导入全局样式
import './assets/css/global.css'
// 导入阿里图标库的字体图标，使用font-class方式引入图标
import './assets/font_4tzesc5rhds/iconfont.css'

Vue.config.productionTip = false;
// 将封装的axios插件挂载到vue的原型上
Vue.prototype.$request = request

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
