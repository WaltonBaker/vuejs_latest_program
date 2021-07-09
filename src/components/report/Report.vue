<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <div id="main" style="width: 700px;height:400px;"></div>
    </el-card>
  </div>
</template>
<script>
import * as echarts from 'echarts'
import _ from 'lodash'
export default {
  name: 'Report',
  data() {
    return {
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  async mounted() {
    // 基于准备好的dom，初始化echarts实例
    let myChart = echarts.init(document.getElementById('main'))
    // 指定图表的配置项和数据

    const { data: res } = await this.$request({ url: 'reports/type/1' })
    const newData = _.merge(res.data, this.options)
    console.log(res)
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(newData)
  }
}
</script>
<style scoped>
</style>