import type { NavigationGuardNext, RouteLocationNormalized, RouteRecordRaw } from "vue-router";
import NProgress from "@/utils/nprogress";
import { Auth } from "@/utils/auth";
import router from "@/router";
import { usePermissionStore, useUserStore } from "@/store";
import { ROLE_ROOT } from "@/constants";
import { useUserStoreHook } from "@/store/modules/user.store";
import { usePermissionStoreHook } from "@/store/modules/permission.store";
import { ElMessage } from "element-plus";
import "nprogress/nprogress.css";

// 路由生成锁，防止重复生成
let isGeneratingRoutes = false;

export function setupPermission() {
  // 白名单路由
  const whiteList = ["/login", "/register", "/403", "/404"];

  // 恢复路由守卫，检查登录状态
  router.beforeEach(async (to: RouteLocationNormalized, _: RouteLocationNormalized, next: NavigationGuardNext) => {
    NProgress.start();
    
    // 获取token
    const token = useUserStoreHook().token;

    // 判断是否有token
    if (token) {
      // 已登录状态
      if (to.path === "/login") {
        // 如果已登录，则重定向到首页
        next({ path: "/" });
        NProgress.done();
      } else {
        // 只要有token，就放行
        next();
      }
    } else {
      // 未登录状态
      if (whiteList.includes(to.path)) {
        // 在免登录白名单中，直接放行
        next();
      } else {
        // 否则重定向到登录页
        next(`/login?redirect=${to.fullPath}`);
        NProgress.done();
      }
    }
  });

  // 后置守卫，确保进度条关闭
  router.afterEach(() => {
    NProgress.done();
  });
}

/**
 * 重定向到登录页
 */
function redirectToLogin(to: RouteLocationNormalized, next: NavigationGuardNext) {
  const params = new URLSearchParams(to.query as Record<string, string>);
  const queryString = params.toString();
  const redirect = queryString ? `${to.path}?${queryString}` : to.path;

  console.log("🔄 Redirecting to login with redirect:", redirect);
  next(`/login?redirect=${encodeURIComponent(redirect)}`);
}

/** 判断是否有权限 */
export function hasAuth(value: string | string[], type: "button" | "role" = "button") {
  const { roles, perms } = useUserStore().userInfo;

  // 超级管理员 拥有所有权限
  if (type === "button" && roles.includes(ROLE_ROOT)) {
    return true;
  }

  const auths = type === "button" ? perms : roles;
  return typeof value === "string"
    ? auths.includes(value)
    : value.some((perm) => auths.includes(perm));
}

export default router;
