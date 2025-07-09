import { createApp } from "vue";
import App from "./App.vue";
import setupPlugins from "@/plugins";
import { ApiDetector } from "@/utils/apiDetector";
import { usePermissionStore } from "@/store";
import { ElMessage } from "element-plus";
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 暗黑主题样式
import "element-plus/theme-chalk/dark/css-vars.css";
import "vxe-table/lib/style.css";
// 暗黑模式自定义变量
import "@/styles/dark/css-vars.css";
import "@/styles/index.scss";
import "uno.css";

// 过渡动画
import "animate.css";

// 自动为某些默认事件（如 touchstart、wheel 等）添加 { passive: true },提升滚动性能并消除控制台的非被动事件监听警告
import "default-passive-events";

console.log("🚀 应用启动...");

// 检测后端API是否可用
ApiDetector.testConnection(`${import.meta.env.VITE_APP_BASE_API}`)
  .then((status) => {
    console.log(`🔌 API连接状态: ${status}`);

    // 根据状态设置模拟数据模式
    const useMockData =
      status.includes("网络错误") || status.includes("连接失败") || status.includes("连接超时");
    localStorage.setItem("useMockData", useMockData ? "true" : "false");

    if (useMockData) {
      console.log("⚠️ 使用模拟数据模式");
      ElMessage.warning({
        message: "后端API不可用，已启用模拟数据模式",
        duration: 5000,
      });
    }
  })
  .catch((err) => {
    console.error("🔴 API检测失败", err);
    localStorage.setItem("useMockData", "true");
  });

const app = createApp(App);
// 注册插件
app.use(setupPlugins);
app.use(pinia);
// 添加全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error("Vue应用错误:", err);
  console.error("错误信息:", info);
};

// 先初始化路由，再挂载应用
const permissionStore = usePermissionStore();

// 改为异步初始化
async function initializeApp() {
  try {
    // 1. 先初始化路由
    await permissionStore.generateRoutes();
    console.log("✅ 静态路由初始化完成");
    
    // 2. 然后挂载应用
    app.mount("#app");
    console.log("✅ 应用挂载完成");
  } catch (error) {
    console.error("❌ 应用初始化失败:", error);
    // 即使路由初始化失败，也尝试挂载应用
    app.mount("#app");
  }
}

// 启动应用初始化
initializeApp();
