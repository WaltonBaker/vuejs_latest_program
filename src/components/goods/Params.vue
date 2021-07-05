<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert
        title="只允许为第三级分类设置相关参数"
        type="warning"
        :closable="false"
        show-icon
      >
      </el-alert>
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类:</span>
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tab页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many"
          ><el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加参数</el-button
          >
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="item"
                  closable
                  @close="handleClose(i, scope.row)"
                  >{{ item }}
                </el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加的按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称">
            </el-table-column>
            <el-table-column>
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >
                  编辑</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                >
                  删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only"
          ><el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加属性</el-button
          >
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="item"
                  closable
                  @close="handleClose(i, scope.row)"
                  >{{ item }}
                </el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加的按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称">
            </el-table-column>
            <el-table-column>
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >
                  编辑</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                >
                  删除</el-button
                >
              </template>
            </el-table-column>
          </el-table></el-tab-pane
        >
      </el-tabs>
    </el-card>
    <!-- 添加参数对话框 -->
    <!-- 添加动态参数和添加静态属性公用同一个对话框,根据当前的activeName参数判断实现对话框的标题 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="ruleFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数的对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: 'Params',
  data() {
    return {
      cateList: [],
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      selectedCateKeys: [],
      // 被激活的页签的名称
      activeName: 'many',
      //   动态参数的数据
      manyTableData: [],
      //   静态参数的数据
      onlyTableData: [],
      //   控制添加对话框的显示与隐藏
      addDialogVisible: false,
      //   添加参数的表单数据对象
      addForm: { attr_name: '' },
      //   添加表单的验证规则对象
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      //   控制编辑对话框的显示与隐藏
      editDialogVisible: false,
      //   修改的表单数据对象
      editForm: {},
      //   修改editForm表单的校验规则对象
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      }
      //   //   控制按钮与文本框的切换显示
      //   inputVisible: false,
      //   //   文本框输入的内容
      //   inputValue: ''
    }
  },
  methods: {
    //   获取所有商品分类列表
    async getCateList() {
      const { data: res } = await this.$request({ url: 'categories' })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.cateList = res.data
    },
    // 级联选择框选中项变化,会触发这个函数
    handleChange() {
      this.getParamsData()
    },
    handleTabClick() {
      this.getParamsData()
    },
    async getParamsData() {
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        // 此处return很关键,只有当selectedCateKeys数组长度为3时,才发出请求
        // 避免了cateId值为null时,发送请求失败
        return
      }
      //   根据所选分类的id和当前所处的面板,获取对应的参数
      const { data: res } = await this.$request({
        url: `categories/${this.cateId}/attributes`,
        params: { sel: this.activeName }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败')
      }

      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 为每一行数据单独设置inputVisible和inputValue值,避免共用同一个值引发混乱
        item.inputVisible = false
        item.inputValue = ''
      })

      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 监听参数对话框关闭
    addDialogClosed() {
      // 将表单重置,避免之前的验证规则残留
      this.$refs.ruleFormRef.resetFields()
    },
    // 点击确定按钮,提交参数
    addParams() {
      this.$refs.ruleFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$request({
          url: `categories/${this.cateId}/attributes`,
          method: 'post',
          data: { attr_name: this.addForm.attr_name, attr_sel: this.activeName }
        })
        if (res.meta.status !== 201) {
          this.$message.error('添加参数失败')
        }
        this.getParamsData()
        this.addDialogVisible = false
      })
    },
    // 点击编辑按钮展示修改对话框
    async showEditDialog(attr_id) {
      // 重大问题:复制变量时,将添加参数的dialog展示了出来,造成混淆
      this.editDialogVisible = true
      // 查询当前参数的信息
      const { data: res } = await this.$request({
        url: `categories/${this.cateId}/attributes/${attr_id}`,
        params: { attr_sel: this.activeName }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数信息失败!')
      }
      this.editForm = res.data
    },
    // 编辑对话框关闭时处理函数
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 点击按钮,修改参数信息
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$request({
          url: `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          method: 'put',
          data: {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改参数失败!')
        }
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    // 删除参数
    async removeParams(attr_id) {
      // 弹出提示框
      const confirmResult = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') return
      const { data: res } = await this.$request({
        url: `categories/${this.cateId}/attributes/${attr_id}`,
        method: 'delete'
      })
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败!')
      }
      this.getParamsData()
    },
    // 当文本框被按下enter键或者失去焦点时触发
    handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      //   如果失去焦点后,文本框有内容
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      //   将前端操作的数据进行持久化操作
      this.saveAttrVals(row)
      //   因为前端面板已经跟新,所以没必要再调用getParamsData()刷新数据
      //   this.getParamsData()
    },
    // 当按下添加标签按钮,显示输入框
    showInput(row) {
      row.inputVisible = true
      // 让文本框自动获得焦点
      // $nextTick的作用是,当页面上的元素被重新渲染后,才能执行回调函数里的代码
      // 当this.inputVisible = true时,vue还没有进行完update,调用focus()会报错
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 点击标签的删除按钮时
    handleClose(index, row) {
      row.attr_vals.splice(index, 1)
      this.saveAttrVals(row)
    },
    async saveAttrVals(row) {
      const { data: res } = await this.$request({
        url: `categories/${this.cateId}/attributes/${row.attr_id}`,
        method: 'put',
        data: {
          attr_name: row.attr_name,
          attr_sel: this.activeName,
          attr_vals: row.attr_vals.join(' ')
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败!')
      }
      this.$message.success('修改参数项成功!')
    }
  },
  computed: {
    //   如果添加按钮被禁用,则返回True,否则返回False
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的三级分类的id
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  },
  created() {
    this.getCateList()
  }
}
</script>
<style lang='less' scoped>
.cat_opt {
  margin-top: 15px;
}
.el-tag {
  margin-right: 20px;
}
.input-new-tag {
  width: 150px;
}
</style>