<template>
  <div class="login-bg">
    <div class="login-main">
      <!-- 左侧内容 -->
      <div class="login-left">
        <img class="login-logo" :src="logo" alt="logo" />
        <div class="login-title">宏之博教务系统</div>
        <div class="login-desc">云上办公系统</div>
        <img class="login-illustration" :src="illustration" alt="illustration" />
      </div>
      <!-- 右侧登录框 -->
      <div class="login-right">
        <div class="login-container">
          <h2 class="login-welcome">欢迎使用</h2>
          <el-form
            ref="loginFormRef"
            :model="loginFormData"
            :rules="loginRules"
            size="large"
            :validate-on-rule-change="false"
          >
            <!-- 用户名 -->
            <el-form-item prop="StaffAccount">
              <el-input v-model="loginFormData.StaffAccount" :placeholder="t('login.username')">
                <template #prefix>
                  <el-icon>
                    <User />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>

            <!-- 密码 -->
            <el-tooltip :visible="isCapsLock" :content="t('login.capsLock')" placement="right">
              <el-form-item prop="StaffPassword">
                <el-input
                  v-model.trim="loginFormData.StaffPassword"
                  :placeholder="t('login.password')"
                  type="password"
                  show-password
                  @keyup="checkCapsLock"
                  @keyup.enter="handleLoginSubmit"
                >
                  <template #prefix>
                    <el-icon>
                      <Lock />
                    </el-icon>
                  </template>
                </el-input>
              </el-form-item>
            </el-tooltip>

            <el-form-item>
              <el-input
                v-model="loginFormData.CaptchaCode"
                placeholder="请输入验证码"
                style="width: 120px"
              />
              <template v-if="!captchaImgUrl">
                <el-button
                  :disabled="!loginFormData.StaffAccount || captchaLoading"
                  style="margin-left: 8px"
                  @click="getCaptchaImg"
                >
                  获取验证码
                </el-button>
              </template>
              <template v-else>
                <img
                  :src="captchaImgUrl"
                  style="height: 32px; margin-left: 8px; cursor: pointer"
                  title="点击刷新验证码"
                  @click="getCaptchaImg"
                />
              </template>
            </el-form-item>

            <div class="flex-x-between w-full">
              <el-checkbox v-model="loginFormData.rememberMe">
                {{ t("login.rememberMe") }}
              </el-checkbox>
              <el-link type="primary" underline="never" @click="toOtherForm('resetPwd')">
                {{ t("login.forgetPassword") }}
              </el-link>
            </div>

            <!-- 开发模式下显示模拟数据开关 -->
            <!--
            <div class="flex-x-between w-full mt-2">
              <el-checkbox v-model="useMockData" @change="handleMockDataChange">
                使用模拟数据
              </el-checkbox>
              <el-text type="info" size="small">后端未启动时使用</el-text>
            </div>
             -->

            <!-- 添加后端连接测试按钮 -->
            <!--
                        <div v-if="showDiagnosticTools" class="flex-x-between w-full mt-2">
              <el-button size="small" type="info" @click="testBackendConnection">
                测试后端连接
              </el-button>
              <el-text v-if="connectionStatus" type="info" size="small">
                {{ connectionStatus }}
              </el-text>
            </div>
            -->

            <!-- 登录按钮 -->
            <el-form-item>
              <el-button
                :loading="loading"
                type="primary"
                class="w-full"
                @click="handleLoginSubmit"
              >
                {{ t("login.login") }}
              </el-button>
            </el-form-item>
          </el-form>

          <div class="login-tips">
            <br />
            客服热线（电话/微信）：13854276666
          </div>
        </div>
      </div>
    </div>
    <div class="login-footer">备案号：鲁ICP备20020546号-2</div>
  </div>
</template>
<script setup lang="ts">
import type { FormInstance } from "element-plus";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/store/modules/user.store";
import { useRoute, useRouter } from "vue-router";
import { ref, watch, reactive } from "vue";
import MyUserAPI from "@/api/myuser.api";
import logo from "@/assets/icons/b_ecd07cbf1b39cf913b555c732b89b120.jpg";
import illustration from "@/assets/icons/65A3D8E6A127C519E4752FFFCBD6E5D9.gif";
import { useStore } from "@/store/pinia/user.pinia";
import { jwtDecode } from "jwt-decode"; // 注意是 jwtDecode（具名导出）
const userinfo = useStore();
const { t } = useI18n();

// 获取路由实例
// const route = useRoute();
const router = useRouter();

const loginFormRef = ref<FormInstance>();
const loading = ref(false);
// 是否大写锁定
const isCapsLock = ref(false);
// 验证码图片Base64字符串 - 已注释
// const captchaBase64 = ref();
// 记住我
// const rememberMe = Auth.getRememberMe();

// // 是否使用模拟数据（开发模式）
// const useMockData = ref(localStorage.getItem("useMockData") === "true");
// // 显示诊断工具（开发环境）
// const showDiagnosticTools = ref(import.meta.env.DEV);
// // 连接状态信息
// const connectionStatus = ref("");

// 1. 读取本地存储
const savedAccount = localStorage.getItem("rememberAccount") || "";
const savedPassword = localStorage.getItem("rememberPassword") || "";

// 2. 初始化表单
const loginFormData = reactive({
  StaffAccount: savedAccount,
  StaffPassword: savedPassword,
  CaptchaKey: "",
  CaptchaCode: "",
  rememberMe: !!(savedAccount && savedPassword),
});

const loginRules = computed(() => {
  return {
    username: [
      {
        required: true,
        trigger: "blur",
        message: t("login.message.username.required"),
      },
    ],
    password: [
      {
        required: true,
        trigger: "blur",
        message: t("login.message.password.required"),
      },
      {
        min: 6,
        message: t("login.message.password.min"),
        trigger: "blur",
      },
    ],
    // 注释验证码的验证规则
    /*
    captchaCode: [
      {
        required: true,
        trigger: "blur",
        message: t("login.message.captchaCode.required"),
      },
    ],
    */
  };
});

/**
 * 登录提交
 */
async function handleLoginSubmit() {
  try {
    // 1. 表单验证
    const valid = await loginFormRef.value?.validate();
    if (!valid) return;
    loading.value = true;
    // 2. 调用登录API
    const userStore = useUserStore();
    console.log("提交数据", loginFormData);
    const res = await userStore.login(loginFormData);

    // 新增：记住账号密码
    if (loginFormData.rememberMe) {
      localStorage.setItem("rememberAccount", loginFormData.StaffAccount);
      localStorage.setItem("rememberPassword", loginFormData.StaffPassword);
    } else {
      localStorage.removeItem("rememberAccount");
      localStorage.removeItem("rememberPassword");
    }

    // 3. 获取token
    const token = res.token;

    // 4. 解析token
    const staffInfo = jwtDecode(token);

    // 5. 存储token和员工信息到Pinia或localStorage

    userStore.token = token;
    userStore.userInfo = staffInfo;

    // 也可以存到localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("staffInfo", JSON.stringify(staffInfo));

    // 3. 登录成功
    ElMessage.success(t("login.loginSuccess"));
    // userinfo.userinfo.token = userStore.token;
    // userinfo.userinfo.staffid = userStore.userInfo.userId;
    // 4. 获取重定向地址或默认跳转到仪表盘
    //const redirect = route.query.redirect?.toString() || '/dashboard';
    await router.replace({ path: "/dashboard" });
    window.location.reload();
  } catch (error: any) {
    console.error("登录失败:", error);

    // 如果使用模拟数据模式，告知用户
    if (localStorage.getItem("useMockData") === "true") {
      ElMessage.warning("已切换到模拟数据模式，请使用admin/123456登录");
    } else {
      ElMessage.error(error.message || "登录失败，请稍后重试");
    }
  } finally {
    loading.value = false;
  }
}

// 检查输入大小写
function checkCapsLock(event: KeyboardEvent) {
  // 防止浏览器密码自动填充时报错
  if (event instanceof KeyboardEvent) {
    isCapsLock.value = event.getModifierState("CapsLock");
  }
}

const emit = defineEmits(["update:modelValue"]);
function toOtherForm(type: "register" | "resetPwd") {
  emit("update:modelValue", type);
}

// // 监听模拟数据模式变化
// function handleMockDataChange(val: any) {
//   localStorage.setItem("useMockData", val ? "true" : "false");
//   console.log(`模拟数据模式: ${val ? "开启" : "关闭"}`);
// }

const captchaImgUrl = ref("");
const captchaLoading = ref(false);

const getCaptchaImg = async () => {
  if (!loginFormData.StaffAccount) {
    ElMessage.warning("请先输入账号");
    return;
  }
  captchaLoading.value = true;
  try {
    const res = await MyUserAPI.getCaptcha(loginFormData.StaffAccount);
    captchaImgUrl.value = URL.createObjectURL(res.data || res);
    loginFormData.CaptchaKey = loginFormData.StaffAccount;
  } catch {
    ElMessage.error("获取验证码失败");
  } finally {
    captchaLoading.value = false;
  }
};

watch(
  () => loginFormData.StaffAccount,
  (val) => {
    loginFormData.CaptchaKey = val;
  }
);
</script>

<style lang="scss" scoped>
html,
body {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.login-bg {
  width: 100vw;
  height: 100vh;
  min-height: 600px;
  background: linear-gradient(120deg, #e0f2ff 0%, #f8fbff 100%);
  position: fixed;
  left: 0;
  top: 0;
  z-index: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
}

.login-main {
  flex: 1;
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100vw;
  box-sizing: border-box;
}

.login-left {
  flex: 1.2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-left: 8vw;

  .login-logo {
    width: 80px;
    margin-bottom: 24px;
  }

  .login-title {
    font-size: 2.2rem;
    font-weight: bold;
    color: #222;
    margin-bottom: 8px;
  }

  .login-desc {
    font-size: 1.1rem;
    color: #666;
    margin-bottom: 32px;
  }

  .login-illustration {
    width: 380px;
    max-width: 90%;
    margin-top: 24px;
  }
}

.login-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 420px;
}

.login-container {
  width: 380px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  padding: 40px 32px 32px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;

  .login-welcome {
    text-align: center;
    margin-bottom: 24px;
    font-weight: 600;
    font-size: 1.5rem;
  }

  .login-tips {
    margin-top: 18px;
    color: #888;
    font-size: 13px;
    text-align: center;
    line-height: 1.6;
  }
}

.login-footer {
  width: 100vw;
  text-align: center;
  color: #888;
  font-size: 13px;
  padding: 12px 0 8px 0;
  letter-spacing: 1px;
}

.third-party-login {
  .divider-container {
    display: flex;
    align-items: center;
    margin: 20px 0;

    .divider-line {
      flex: 1;
      height: 1px;
      background: linear-gradient(to right, transparent, var(--el-border-color-light), transparent);
    }

    .divider-text {
      padding: 0 16px;
      font-size: 12px;
      color: var(--el-text-color-regular);
      white-space: nowrap;
    }
  }
}
</style>
