import Vue from 'vue'
import router from './router'

import { request } from './network/request'
import './utils/index.js'
import App from './App.vue'

import './plugins/element.js'
import './plugins/vueTableWithTreeGrid.js'
import './plugins/vueQuillEditor.js'

// 导入全局样式
import './assets/css/global.css'
// 导入阿里图标库的字体图标，使用font-class方式引入图标
import './assets/font_80rsv2i4do/iconfont.css'

Vue.config.productionTip = false;
// 将封装的axios插件挂载到vue的原型上
Vue.prototype.$request = request

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
