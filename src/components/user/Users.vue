<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="9">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.params.query"
            clearable
            @clear="getUsersList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUsersList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary">添加用户</el-button>
        </el-col>
      </el-row>

      <el-table :data="usersList" style="width: 100%" border stripe>
        <el-table-column type="index"> </el-table-column>
        <el-table-column prop="username" label="姓名"> </el-table-column>
        <el-table-column prop="email" label="邮箱"> </el-table-column>
        <el-table-column prop="mobile" label="电话"> </el-table-column>
        <el-table-column prop="role_name" label="角色"> </el-table-column>
        <el-table-column prop="mg_state" label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChange(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <el-tooltip
              class="item"
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <!-- 分配角色按钮 -->
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.params.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.params.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 修改用户的对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 修改用户信息的表单 -->
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
        label-width="80px"
      >
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色的对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      @close="setRoleDialogClosed"
    >
      <div>
        <p>当前用户：{{ userInfo.username }}</p>
        <p>当前角色：{{ userInfo.role_name }}</p>
        <el-select v-model="selectedRoleId" placeholder="请选择">
          <el-option
            v-for="item in rolesList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: 'Users',
  data() {
    // 自定义校验方法
    // 自定义校验 callback 必须被调用
    const checkEmail = function(rule, value, callback) {
      const myreg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/
      if (!myreg.test(value)) {
        callback(new Error('请输入正确的邮箱格式'))
      }
      callback()
    }
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        method: 'get',
        url: 'users',
        params: { query: '', pagenum: 1, pagesize: 2 }
      },
      usersList: [],
      total: 0,
      // 控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      // 使用id查询到的用户信息
      editForm: {},
      // editForm的表单校验规则
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [{ required: true, message: '请输入手机号', trigger: 'blur' }]
      },
      // 控制分配角色对话框的显示与隐藏
      setRoleDialogVisible: false,
      // 需要被分配角色的用户信息
      userInfo: {},
      // 所有角色的数据列表
      rolesList: [],
      // 已选中的用户新角色
      selectedRoleId: ''
    }
  },
  created() {
    this.getUsersList()
  },
  methods: {
    async getUsersList() {
      const { data: res } = await this.$request(this.queryInfo)
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户数据列表失败')
      }
      this.usersList = res.data.users
      this.total = res.data.total
      // console.log(res)
    },
    // 监听页面能显示多少条数据
    handleSizeChange(newSize) {
      this.queryInfo.params.pagesize = newSize
    },
    // 监听当前页面的页码数
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
    },
    // 监听switch开关状态的改变,并将更新后的状态更新到服务器
    async userStateChange(userinfo) {
      const { data: res } = await this.$request({
        url: `users/${userinfo.id}/state/${userinfo.mg_state}`,
        method: 'put'
      })
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败')
      }
      this.$message.success('更新用户状态成功')
    },
    // 展示编辑用户的对话框
    async showEditDialog(id) {
      this.editDialogVisible = true
      const { data: res } = await this.$request({ url: 'users/' + id })
      if (res.meta.status !== 200) {
        this.$$message.error('查询用户信息失败!')
      }
      this.editForm = res.data
    },
    // 监听修改用户对话框的关闭事件
    addDialogClosed() {
      // 重置修改表单数据后的提示信息
      this.$refs.editFormRef.resetFields()
    },
    // 提交用户信息的数据预检测
    editUserInfo() {
      this.$refs.editFormRef.validate(async (validate, validate_obj) => {
        if (!validate) {
          return
        }
        // 发起修改用户信息的数据请求
        const { data: res } = await this.$request({
          method: 'put',
          url: 'users/' + this.editForm.id,
          data: {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('更新用户信息失败!')
        }
        console.log(res)
        // 关闭对话框
        this.editDialogVisible = false
        // 刷新数据列表
        this.getUsersList()
        // 提示修改成功
        this.$message.success('更新用户信息成功!')
      })
    },
    // 删除用户信息
    async removeUserById(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 如果用户确认删除,则返回值为字符串confirm
      // 如果用户取消删除,则返回值为字符串cancel
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      // 用户点击了确认删除按钮
      const { data: res } = await this.$request({
        url: 'users/' + id,
        method: 'delete'
      })
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败')
      }
      this.$message.success('删除用户成功')
      this.getUsersList()
    },
    // 展示分配角色的对话框
    async setRole(userInfo) {
      this.userInfo = userInfo
      const { data: res } = await this.$request({
        url: 'roles'
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
      this.setRoleDialogVisible = true
    },
    // 点击按钮分配角色
    async saveRoleInfo() {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择要分配的角色')
      }
      const { data: res } = await this.$request({
        url: `users/${this.userInfo.id}/role`,
        method: 'put',
        data: { rid: this.selectedRoleId }
      })
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success('更新用户角色成功')
      this.getUsersList()
      this.setRoleDialogVisible = false
    },
    setRoleDialogClosed() {
      this.selectedRoleId = ''
      this.userInfo = {}
    }
  }
}
</script>
<style scoped>
.el-table {
  margin-top: 15px;
  font-size: 12px;
}
.el-pagination {
  margin-top: 10px;
}
</style>