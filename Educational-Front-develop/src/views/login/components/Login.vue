<template>
  <div>
    <h3 text-center m-0 mb-20px>{{ t("login.login") }}</h3>
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

      <el-form-item label="验证码">
        <el-input
          v-model="loginFormData.CaptchaCode"
          placeholder="请输入验证码"
          style="width: 120px"
        />
        <el-button
          :disabled="!loginFormData.StaffAccount || captchaLoading"
          style="margin-left: 8px"
          @click="getCaptchaImg"
        >
          获取验证码
        </el-button>
        <img
          v-if="captchaImgUrl"
          :src="captchaImgUrl"
          style="height: 32px; margin-left: 8px; cursor: pointer"
          title="点击刷新验证码"
          @click="getCaptchaImg"
        />
      </el-form-item>

      <div class="flex-x-between w-full">
        <el-checkbox v-model="loginFormData.rememberMe">{{ t("login.rememberMe") }}</el-checkbox>
        <el-link type="primary" underline="never" @click="toOtherForm('resetPwd')">
          {{ t("login.forgetPassword") }}
        </el-link>
      </div>

      <!-- 开发模式下显示模拟数据开关 -->
      <div class="flex-x-between w-full mt-2">
        <el-checkbox v-model="useMockData" @change="handleMockDataChange">使用模拟数据</el-checkbox>
        <el-text type="info" size="small">后端未启动时使用</el-text>
      </div>

      <!-- 添加后端连接测试按钮 -->
      <div v-if="showDiagnosticTools" class="flex-x-between w-full mt-2">
        <el-button size="small" type="info" @click="testBackendConnection">测试后端连接</el-button>
        <el-text v-if="connectionStatus" type="info" size="small">{{ connectionStatus }}</el-text>
      </div>

      <!-- 登录按钮 -->
      <el-form-item>
        <el-button :loading="loading" type="primary" class="w-full" @click="handleLoginSubmit">
          {{ t("login.login") }}
        </el-button>
      </el-form-item>
    </el-form>

    <div flex-center gap-10px>
      <el-text size="default">{{ t("login.noAccount") }}</el-text>
      <el-link type="primary" underline="never" @click="toOtherForm('register')">
        {{ t("login.reg") }}
      </el-link>
    </div>

    <!-- 第三方登录 -->
    <div class="third-party-login">
      <div class="divider-container">
        <div class="divider-line"></div>
        <span class="divider-text">{{ t("login.otherLoginMethods") }}</span>
        <div class="divider-line"></div>
      </div>
      <div class="flex-center gap-x-5 w-full text-[var(--el-text-color-secondary)]">
        <CommonWrapper>
          <div text-20px class="i-svg:wechat" />
        </CommonWrapper>
        <CommonWrapper>
          <div text-20px cursor-pointer class="i-svg:qq" />
        </CommonWrapper>
        <CommonWrapper>
          <div text-20px cursor-pointer class="i-svg:github" />
        </CommonWrapper>
        <CommonWrapper>
          <div text-20px cursor-pointer class="i-svg:gitee" />
        </CommonWrapper>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { FormInstance } from "element-plus";
import { useI18n } from "vue-i18n";
import CommonWrapper from "@/components/CommonWrapper/index.vue";
import { Auth } from "@/utils/auth";
import { ElMessage } from "element-plus";
import { ApiDetector } from "@/utils/apiDetector";
import { useUserStore } from "@/store/modules/user.store";
import { useRoute, useRouter } from "vue-router";
import { ref, watch, reactive } from "vue";
import MyUserAPI from "@/api/myuser.api";

const { t } = useI18n();

// 获取路由实例
const route = useRoute();
const router = useRouter();

const loginFormRef = ref<FormInstance>();
const loading = ref(false);
// 是否大写锁定
const isCapsLock = ref(false);
// 验证码图片Base64字符串 - 已注释
// const captchaBase64 = ref();
// 记住我
const rememberMe = Auth.getRememberMe();

// 是否使用模拟数据（开发模式）
const useMockData = ref(localStorage.getItem("useMockData") === "true");
// 显示诊断工具（开发环境）
const showDiagnosticTools = ref(import.meta.env.DEV);
// 连接状态信息
const connectionStatus = ref("");

const loginFormData = reactive({
  StaffAccount: "",
  StaffPassword: "",
  CaptchaKey: "",
  CaptchaCode: "",
  rememberMe,
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
    await userStore.login(loginFormData);

    // 3. 登录成功
    ElMessage.success(t("login.loginSuccess"));

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

// 监听模拟数据模式变化
function handleMockDataChange(val: any) {
  localStorage.setItem("useMockData", val ? "true" : "false");
  console.log(`模拟数据模式: ${val ? "开启" : "关闭"}`);
}

const captchaImgUrl = ref(""); // 用于显示验证码图片
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
  } catch (e) {
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
