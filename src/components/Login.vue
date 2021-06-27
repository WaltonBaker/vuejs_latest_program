<template>
  <div class="login_container">
    <div class="login_box">
      <div class="avatar_box">
        <img src="@/assets/logo.png" alt="" />
      </div>
      <el-form
        ref="loginFormRef"
        :rules="loginFormRules"
        :model="login_Form"
        class="login_form"
      >
        <el-form-item prop="username" label="用户名:" label-width="80px">
          <el-input
            v-model="login_Form.username"
            prefix-icon="iconfont icon-tubiao211"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password" label="密码:" label-width="80px">
          <el-input
            type="password"
            v-model="login_Form.password"
            prefix-icon="iconfont icon-icon-mima"
          ></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button @click="login" type="primary">提交</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data: function() {
    return {
      message: '你好',
      //   这是登录表单的数据绑定对象
      login_Form: {
        username: 'admin',
        password: '123456'
      },
      loginFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 1, max: 5, message: '长度在 1 到 5 个字符', trigger: 'blur' }
        ],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      }
    }
  },
  methods: {
    resetForm: function() {
      this.$refs.loginFormRef.resetFields()
    },
    login() {
      // 对表单元素进行预检测
      this.$refs.loginFormRef.validate(async (validate, validate_obj) => {
        // 第一个参数表示校验是否通过
        console.log(validate)
        // 第二个参数表示未通过校验的字段
        console.log(validate_obj)
        if (!validate) return
        const { data: res } = await this.$request({
          method: 'post',
          url: 'login',
          data: this.login_Form
          // 如果是post请求添加params参数，参数对象依然会以键值对的形式拼接到url的后面
          //   params: { id: 1234 }
        })
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('登陆失败')
        }
        // 调用Message组件的success方法;
        this.$message.success('登录成功')
        window.sessionStorage.setItem('token', res.data.token)
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  height: 100%;
  background-color: #2b4b6b;
}
.login_box {
  position: absolute;
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.avatar_box {
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  height: 130px;
  width: 130px;
  border: 1px solid #eee;
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 0 10px #ddd;

  img {
    height: 100%;
    width: 100%;
    border-radius: 50%;
    background-color: #eee;
  }
}
.btns {
  display: flex;
  justify-content: flex-end;
}
.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  box-sizing: border-box;
  padding: 0 30px 0 0;
}
</style>