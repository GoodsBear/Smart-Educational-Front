import type { RouteRecordRaw } from "vue-router";
import { constantRoutes } from "@/router";
import { store } from "@/store";
import router from "@/router";

// import MenuAPI, { type RouteVO } from "@/api/system/menu.api"; // 注释掉动态菜单API的导入
const modules = import.meta.glob("../../views/**/**.vue");
console.log("DEBUG: modules object keys:", Object.keys(modules));
const Layout = () => import("@/layouts/index.vue");

export const usePermissionStore = defineStore("permission", () => {
  // 存储所有路由
  const routes = ref<RouteRecordRaw[]>([]);
  // 混合模式左侧菜单路由
  const sideMenuRoutes = ref<RouteRecordRaw[]>([]);
  // 路由是否加载完成
  const routesLoaded = ref(false);

  /**
   * 生成静态路由数据并注册到全局路由
   */
  function generateRoutes() {
    return new Promise<RouteRecordRaw[]>((resolve, reject) => {
      try {
        console.log("🔧 生成静态菜单...");

        // 如果路由已经加载过，不再重复加载
        if (routesLoaded.value) {
          console.log("⚠️ 路由已加载，跳过重复加载");
          resolve(routes.value.filter((route) => !constantRoutes.includes(route)));
          return;
        }

        // 定义静态路由
        const staticRoutes = [
          {
            path: "/dashboard",
            component: Layout,
            redirect: "/dashboard",
            children: [
              {
                path: "",
                name: "Dashboard",
                component: () => import("@/views/dashboard/index.vue"),
                meta: { title: "仪表盘", icon: "ep:odometer", affix: true, keepAlive: true },
              },
            ],
          },

          {
            path: "/Students",
            component: Layout,
            redirect: "/Students/OnlineStudents",
            meta: { title: "学员", icon: "ep:user-filled" },
            children: [
              {
                path: "OnlineStudents",
                name: "OnlineStudents",
                component: () => import("@/views/Students/OnlineStudents/index.vue"),
                meta: { title: "在学学员", icon: "ep:user" },
              },
              {
                path: "ThingStudents",
                name: "ThingStudents",
                component: () => import("@/views/Students/ThinkStudents/index.vue"),
                meta: { title: "意向学员", icon: "ep:star-filled" },
              },
              {
                path: "FinishStudents",
                name: "FinishStudents",
                component: () => import("@/views/Students/FinishStudents/index.vue"),
                meta: { title: "结业学员", icon: "ep:medal" },
              },
              {
                path: "detail",
                name: "StudentDetail",
                component: () => import("@/views/Students/StudentDetail/index.vue"),
                meta: { title: "学员详情", icon: "ep:info", hidden: true },
              },
            ],
          },
          {
            path: "/material",
            component: Layout,
            redirect: "/material/user",
            meta: { title: "物料", icon: "ep:setting" },
            children: [
              {
                path: "material",
                name: "Material",
                component: () => import("@/views/Materials/material/index.vue"),
                meta: { title: "物料列表", icon: "ep:collection" },
              },
              {
                path: "storerooms",
                name: "Storerooms",
                component: () => import("@/views/Materials/storerooms/index.vue"),
                meta: { title: "出入库记录", icon: "ep:collection" },
              },
            ],
          },
          {
            path: "/tissue",
            component: Layout,
            redirect: "/tissue/user",
            meta: { title: "组织", icon: "ep:setting" },
            children: [
              {
                path: "staff",
                name: "Staff",
                component: () => import("@/views/system/staff/index.vue"),
                meta: { title: "员工管理", icon: "ep:collection" },
              },
              //{
              // path: "money",
              //name: "money",
              //component: () => import("@/views/tissue/money/index.vue"),
              //meta: { title: "薪资设置", icon: "ep:collection" },
              //},
              {
                path: "organization",
                name: "Organization",
                component: () => import("@/views/tissue/organization/index.vue"),
                meta: { title: "组织管理", icon: "ep:collection" },
              },
              {
                path: "position",
                name: "Position",
                component: () => import("@/views/tissue/position/index.vue"),
                meta: { title: "职位管理", icon: "ep:collection" },
              },
            ],
          },
          {
            path: "/system",
            component: Layout,
            redirect: "/system/user",
            meta: { title: "系统", icon: "ep:setting" },
            children: [
              {
                path: "user",
                name: "User",
                component: () => import("@/views/system/user/index.vue"),
                meta: { title: "用户管理", icon: "ep:user" },
              },
              {
                path: "role",
                name: "Role",
                component: () => import("@/views/system/role/index.vue"),
                meta: { title: "角色管理", icon: "ep:key" },
              },
              // {
              //   path: "dict",
              //   name: "Dict",
              //   component: () => import("@/views/system/dict/index.vue"),
              //   meta: { title: "字典管理", icon: "ep:collection" },
              // },
              {
                path: "announcement",
                component: () => import("@/views/system/announcement/index.vue"),
                name: "Announcement",
                meta: {
                  title: "内部公告",
                  icon: "notification",
                  permission: ["system:announcement:list"],
                },
              },
            ],
          },

          {
            path: "/educational",
            component: Layout,
            redirect: "/educational/course",
            name: "Educational",
            meta: {
              title: "课程",
              icon: "education",
              order: 1,
            },
            children: [
              {
                path: "course",
                component: () => import("@/views/Lessions/course/index.vue"),
                name: "CourseManagement",
                meta: {
                  title: "课程管理",
                  icon: "course",
                },
              },
              {
                path: "subject",
                component: () => import("@/views/Lessions/subject/index.vue"),
                name: "SubjectManagement",
                meta: {
                  title: "科目管理",
                  icon: "subject",
                },
              },
              {
                path: "topic",
                component: () => import("@/views/Lessions/topic/index.vue"),
                name: "TopicManagement",
                meta: {
                  title: "专题管理",
                  icon: "topic",
                },
              },
            ],
          },
        ];
        // 清理可能存在的重复路由
        try {
          // 尝试移除可能已存在的路由
          staticRoutes.forEach((route) => {
            if (route.name) {
              try {
                router.removeRoute(route.name);
              } catch (e) {
                // 忽略移除不存在路由的错误
              }
            }
          });
        } catch (e) {
          console.warn("清理已存在路由时出错:", e);
        }

        // 注册路由 - 添加详细日志
        staticRoutes.forEach((route, index) => {
          try {
            console.log(`➕ 添加路由[${index}]: ${route.path}`);
            router.addRoute(route);
          } catch (e) {
            console.error(`❌ 添加路由[${index}]失败: ${route.path}`, e);
          }
        });

        // 更新存储
        routes.value = [...constantRoutes, ...staticRoutes];
        routesLoaded.value = true;

        // 打印当前路由表以便调试
        console.log(
          "📋 当前路由表:",
          router.getRoutes().map((r: RouteRecordRaw) => r.path)
        );
        console.log("✅ 静态菜单生成完成");
        resolve(staticRoutes);
      } catch (error) {
        console.error("❌ 生成路由失败:", error);
        // 尽管出错，仍然尝试resolve，而不是reject
        // 这样可以让应用继续初始化，而不是完全失败
        resolve([]);
      }
    });
  }

  /**
   * 根据父菜单路径设置侧边菜单
   */
  const updateSideMenu = (parentPath: string) => {
    const matchedItem = routes.value.find((item) => item.path === parentPath);
    if (matchedItem && matchedItem.children) {
      sideMenuRoutes.value = matchedItem.children;
    }
  };

  /**
   * 重置路由
   */
  const resetRouter = () => {
    // 创建常量路由名称集合
    const constantRouteNames = new Set(constantRoutes.map((route) => route.name).filter(Boolean));

    // 从 router 实例中移除动态路由
    routes.value.forEach((route) => {
      if (route.name && !constantRouteNames.has(route.name)) {
        router.removeRoute(route.name);
      }
    });

    // 重置为仅包含常量路由
    routes.value = [...constantRoutes];
    sideMenuRoutes.value = [];
    routesLoaded.value = false;
  };

  return {
    routes,
    sideMenuRoutes,
    routesLoaded,
    generateRoutes,
    updateSideMenu,
    resetRouter,
  };
});

/**
 * 解析后端返回的路由数据并转换为 Vue Router 兼容的路由配置 (已注释，因为使用静态路由)
 *
 * @param rawRoutes 后端返回的原始路由数据
 * @returns 解析后的路由集合
 */
// const parseDynamicRoutes = (rawRoutes: RouteVO[]): RouteRecordRaw[] => {
//   const parsedRoutes: RouteRecordRaw[] = [];

//   rawRoutes.forEach((route) => {
//     const normalizedRoute = { ...route } as RouteRecordRaw;

//     // 处理组件路径
//     normalizedRoute.component =
//       normalizedRoute.component?.toString() === "Layout"
//         ? Layout
//         : modules[`../../views/${normalizedRoute.component}.vue`] ||
//           modules["../../views/error-page/404.vue"];

//     // 递归解析子路由
//     if (normalizedRoute.children) {
//       normalizedRoute.children = parseDynamicRoutes(route.children);
//     }

//     parsedRoutes.push(normalizedRoute);
//   });

//   return parsedRoutes;
// };

/**
 * 导出此hook函数用于在非组件环境中获取权限store实例
 */
export function usePermissionStoreHook() {
  return usePermissionStore(store);
}
