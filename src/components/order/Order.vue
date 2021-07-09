<template>
  <div id="order">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card
      ><el-row>
        <el-col :span="6">
          <el-input placeholder="请输入内容">
            <el-button
              slot="append"
              icon="el-icon-search"
            ></el-button> </el-input></el-col
      ></el-row>
      <!-- 订单列表数据 -->
      <el-table :data="orderList" border stripe style="width: 100%">
        <el-table-column type="index"></el-table-column>
        <el-table-column
          label="订单编号"
          prop="order_number"
          width="400"
        ></el-table-column>
        <el-table-column
          label="订单价格"
          prop="order_price"
          width="150"
        ></el-table-column>
        <el-table-column label="是否付款" prop="pay_status" width="150">
          <template slot-scope="scope"
            ><el-tag type="success" v-if="scope.row.pay_status === '1'"
              >已付款</el-tag
            >
            <el-tag type="danger" v-else>未付款</el-tag></template
          >
        </el-table-column>
        <el-table-column
          label="是否发货"
          prop="is_send"
          width="150"
        ></el-table-column>
        <!-- 下单时间需要在父级作用域按需渲染，因此使用作用域插槽 -->
        <!-- 在el-table-item组件上不需要再指定prop="create_time"属性 -->
        <el-table-column label="下单时间" width="200">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}</template
          ></el-table-column
        >
        <el-table-column label="操作">
          <template>
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showBox"
            >
            </el-button>
            <el-button
              type="success"
              icon="el-icon-location"
              size="mini"
              @click="showProgressBox"
            >
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 3, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
      <!-- 修改地址对话框 -->
      <el-dialog
        title="修改地址"
        :visible.sync="addressDialogVisible"
        width="50%"
        @close="addressDialogClosed"
      >
        <el-form
          :model="addressForm"
          :rules="addressFormRules"
          ref="addressFormRef"
          label-width="100px"
        >
          <el-form-item label="省市区/县" prop="address1">
            <el-cascader
              v-model="addressForm.address1"
              :options="newdata"
              :props="addressProps"
              @change="handleChange"
              id="order"
            ></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="address2">
            <el-input v-model="addressForm.address2"></el-input>
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="addressDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addressDialogVisible = false"
            >确 定</el-button
          >
        </span>
      </el-dialog>
      <!-- 展示物流进度的对话框 -->
      <el-dialog title="提示" :visible.sync="progressVisible" width="50%">
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in progressInfo"
            :key="index"
            :timestamp="activity.time"
          >
            {{ activity.context }}
          </el-timeline-item>
        </el-timeline>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import { cityData, kuaidi } from './cityData.js'
// 使用递归函数删除数组中child属性为空的对象
function removeChild(list) {
  for (let item of list) {
    // 先确定递归结束条件
    if (!item.child) {
      return
    }
    if (item.child.length === 0) {
      delete item.child
      continue
    }
    removeChild(item.child)
  }
  return list
}
const newdata = removeChild(cityData)

export default {
  name: 'Order',
  data() {
    return {
      queryInfo: { query: '', pagenum: 1, pagesize: 5 },
      orderList: [],
      //   订单列表总数
      total: 0,
      addressDialogVisible: false,
      addressForm: { address1: [], address2: '' },
      addressFormRules: {
        address1: [
          { required: true, message: '请选择省市区县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      newdata,
      addressProps: {
        label: 'name',
        value: 'id',
        children: 'child',
        expandTrigger: 'hover',
        checkStrictly: true
      },
      progressVisible: false,
      progressInfo: []
    }
  },
  methods: {
    async getOrderList() {
      const { data: res } = await this.$request({
        url: 'orders',
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        this.$message.error('获取订单数据失败!')
      }
      this.total = res.data.total
      this.orderList = res.data.goods
    },
    handleSizeChange(newsize) {
      this.queryInfo.pagesize = newsize
      this.getOrderList()
    },
    handleCurrentChange(newpage) {
      this.queryInfo.pagenum = newpage
      this.getOrderList()
    },
    // 展示修改地址的对话框
    showBox() {
      this.addressDialogVisible = true
    },
    handleChange() {},
    addressDialogClosed() {
      this.$refs.addressFormRef.resetFields()
    },
    showProgressBox() {
      //   const { data: res } = await this.$request({
      //     url: '/kuaidi/1106975712662'
      //   })
      //   if (res.meta.status !== 200) {
      //     return this.$message.error('获取物流信息出错！')
      //   }
      this.progressInfo = kuaidi.data
      this.progressVisible = true
      console.log(this.progressInfo)
    }
  },
  created() {
    this.getOrderList()
  }
}
</script>

<style scoped>
.el-cascader {
  width: 100%;
}
</style>

