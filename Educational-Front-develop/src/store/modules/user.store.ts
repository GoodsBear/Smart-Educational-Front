import { ref } from "vue";
import { defineStore } from "pinia";
import { store } from "@/store";
import { Auth } from "@/utils/auth";
import type { LoginFormData } from "@/api/myuser.api";
import { usePermissionStore } from "./permission.store";
import { Storage } from "@/utils/storage";
import { AUTH_KEYS } from "@/constants";
import MyUserAPI from "@/api/myuser.api";

export const useUserStore = defineStore("user", () => {
  // token
  const token = ref(Auth.getAccessToken() || "");

  // 用户信息
  const userInfo = ref({
    userId: "1",
    username: "admin",
    realName: "管理员",
    avatar: "",
    roles: ["admin"],
    perms: ["*:*:*"],
  });

  // 登录
  async function login(loginData: LoginFormData) {
    try {
      // 调用API进行登录
      console.log("调用真实API登录，参数:", loginData);
      const result = await MyUserAPI.login(loginData);

      // 保存记住我选项
      Storage.set(AUTH_KEYS.REMEMBER_ME, loginData.rememberMe);

      // 设置token
      const accessToken = result.accessToken || "mock-token";
      token.value = accessToken;

      // 设置登录状态
      Auth.setTokens(
        accessToken,
        result.refreshToken || "mock-refresh-token",
        loginData.rememberMe
      );

      return result;
    } catch (error) {
      console.error("登录失败:", error);
      throw error;
    }
  }

  // 获取用户信息
  async function getUserInfo() {
    try {
      // 返回静态用户信息
      return userInfo.value;
    } catch (error) {
      console.error("获取用户信息失败:", error);
      throw error;
    }
  }

  // 退出登录
  async function logout() {
    try {
      // 清理本地存储
      localStorage.clear();
      sessionStorage.clear();
      // 重置状态
      await resetAllState();
      return true;
    } catch (error) {
      console.error("退出登录失败:", error);
      throw error;
    }
  }

  // 重置所有状态
  async function resetAllState() {
    try {
      // 清除token
      token.value = "";
      Auth.clearAuth();
      // 重置路由
      usePermissionStore().resetRouter();
      return true;
    } catch (error) {
      console.error("重置状态失败:", error);
      throw error;
    }
  }

  return {
    token,
    userInfo,
    login,
    getUserInfo,
    logout,
    resetAllState,
  };
});

// 在非setup环境下使用store
export function useUserStoreHook() {
  return useUserStore(store);
}
