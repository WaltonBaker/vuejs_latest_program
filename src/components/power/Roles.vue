<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/rights' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row
        ><el-col>
          <el-button type="primary">添加角色</el-button></el-col
        ></el-row
      >
      <!-- 添加角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
              :class="['bdbottom', 'vcenter', i1 === 0 ? 'bdtop' : '']"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  @close="removeRightById(scope.row, item1.id)"
                  closable
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级、三级权限 -->
              <el-col :span="19">
                <el-row
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                >
                  <!-- 渲染二级权限 -->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      @close="removeRightById(scope.row, item2.id)"
                      closable
                    >
                      {{ item2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 渲染三级权限 -->
                  <el-col :span="18">
                    <!-- 三级权限不需要再按行排列，因此没有使用el-row -->
                    <el-tag
                      v-for="(item3, i3) in item2.children"
                      :key="item3.id"
                      type="warning"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"> </el-table-column>
        <el-table-column label="角色名称" prop="roleName"> </el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"> </el-table-column>
        <!-- 操作按钮需要使用作用域插槽，就不需要使用prop属性 -->
        <el-table-column label="操作" width="400px">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit"
              >编辑</el-button
            >
            <el-button type="danger" size="mini" icon="el-icon-delete"
              >删除</el-button
            >
            <el-button
              type="warning"
              size="mini"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限的对话框 -->
    <el-dialog
      title="提示"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- data属性指定tree组件的数据源 -->
      <!-- props属性指定是一个对象，指定层级标签名和层级关系 -->
      <!-- node-key属性指定每个树节点用来作为唯一标识的属性 -->
      <!-- default-expanded-keys属性指定默认勾选的节点的 key 的数组 -->
      <!-- el-tree组件内无法使用插槽 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defaultKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: 'Roles',
  data() {
    return {
      // 所有角色列表数据
      rolesList: [],
      //   控制分配权限对话框的分配与隐藏
      setRightDialogVisible: false,
      //   所有权限的数据
      rightsList: [],
      //   树形控件的属性绑定对象，children属性表示树形结构内的按照children属性分配层级关系
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      defaultKeys: [],
      roleId: 0
    }
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$request({ url: 'roles' })
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色信息失败')
      }
      this.rolesList = res.data
    },
    async removeRightById(role, rightId) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$request({
        url: `roles/${role.id}/rights/${rightId}`,
        method: 'delete'
      })
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      }
      //   此处不建议调用getRolesList()，因为此方法会刷新页面
      //   this.getRolesList()
      //   调用删除角色指定权限接口，会返回被删除后剩下的所有权限，赋值给当前行的数据对象的children属性
      role.children = res.data
    },
    async showSetRightDialog(role) {
      // 在data数据内保存角色的id
      this.roleId = role.id
      // 获取所有权限的数据
      const { data: res } = await this.$request({ url: 'rights/tree' })
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限失败')
      }
      //   把获取到的权限数据保存到data中
      this.rightsList = res.data
      console.log(this.rightsList)
      //   递归获取三级节点的id
      this.getLeafKeys(role, this.defaultKeys)

      this.setRightDialogVisible = true
    },
    getLeafKeys(node, arr) {
      // 先设置递归结束条件
      if (!node.children) {
        // 说明已到达三级节点
        // 此处为什么会要有一个return：因为如果当前node参数如果有children参数
        // 就说明这是一个对象，就不应该执行后面的forEach()方法
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 点击对话框取消按钮时，将defaultKeys重置为空
    setRightDialogClosed() {
      this.defaultKeys = []
    },
    // 点击为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const keysStr = keys.join(',')
      const { data: res } = await this.$request({
        url: `roles/${this.roleId}/rights`,
        method: 'post',
        data: {
          rids: keysStr
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      //   刷新角色列表，更新角色的权限
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  },
  created() {
    this.getRolesList()
  }
}
</script>
<style scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>