import axios, {
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosRequestConfig,
} from "axios";
import qs from "qs";
import { useUserStoreHook } from "@/store/modules/user.store";
import { ResultEnum } from "@/enums/api/result.enum";
import { Auth } from "@/utils/auth";
import router from "@/router";

// 定义后端响应的基本结构
interface BackendApiResponse<T = any> {
  data: T;
  isSuc: boolean; // 新的成功标识
  code: number; // 状态码，成功时为 200
  msg: string; // 消息
}

/**
 * 创建 HTTP 请求实例
 *
 * 注意：如果后端API地址有变化，请修改下面的baseURL
 * - 开发环境通常是: http://localhost:端口号/
 * - 如果使用Docker或其他环境，请相应调整
 * - 如果后端服务未启动，可以将baseURL设置为空字符串，前端将使用模拟数据
 */
const service = axios.create({
  baseURL: "https://localhost:44375/",
  timeout: 50000,
  headers: { "Content-Type": "application/json;charset=utf-8" },
  paramsSerializer: (params) => qs.stringify(params),
  withCredentials: false, // 禁用跨源凭据
});

// 打印baseURL值，方便调试
console.log("HTTP请求baseURL:", service.defaults.baseURL);

/**
 * 请求拦截器 - 添加 Authorization 头
 */
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log(`📤 发送请求: ${config.method} ${config.url}`);

    // 确保登录接口使用POST方法
    if (config.url?.includes("/login") && !config.method) {
      console.log("强制设置登录请求为POST方法");
      config.method = "post";
    }

    // JWT认证相关代码已注释
    /*
    const accessToken = Auth.getAccessToken();

    // 如果 Authorization 设置为 no-auth，则不携带 Token
    if (config.headers.Authorization !== "no-auth" && accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
      delete config.headers.Authorization;
    }
    */

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器 - 统一处理响应和错误
 */
service.interceptors.response.use(
  (response: AxiosResponse<BackendApiResponse>) => {
    // 如果响应是二进制流，则直接返回（用于文件下载、Excel 导出等）
    if (response.config.responseType === "blob") {
      return response;
    }

    const { isSuc, data, msg, code } = response.data;

    // 请求成功：检查 isSuc 和 code
    if (isSuc === true && code.toString() === ResultEnum.SUCCESS) {
      return data;
    }

    // 业务错误
    ElMessage.error(msg || "系统出错");
    return Promise.reject(new Error(msg || "Business Error"));
  },
  async (error) => {
    console.error("Response interceptor error:", error);

    // 检查是否应该使用模拟数据
    const useMockData = localStorage.getItem("useMockData") === "true";
    if (useMockData) {
      console.log("已启用模拟数据模式，忽略API错误");
      // 返回一个空对象，让调用方继续执行
      return {};
    }

    const { response, code, message } = error;

    // 网络错误或服务器无响应
    if (!response) {
      // 提供更详细的错误信息
      let errorMsg = "网络连接失败";

      if (code === "ERR_NETWORK") {
        errorMsg = "网络错误，无法连接到服务器";
      } else if (code === "ECONNABORTED") {
        errorMsg = "请求超时，服务器响应时间过长";
      } else if (message) {
        errorMsg = `${errorMsg}: ${message}`;
      }

      ElMessage.error(errorMsg);
      console.error(`[API错误] ${errorMsg}`, error);

      // 建议用户启用模拟数据
      ElMessage.info('建议启用"使用模拟数据"选项继续开发');

      return Promise.reject(error);
    }

    // 使用后端返回的msg作为错误信息
    const { msg } = response.data as BackendApiResponse; // 确保这里使用新的BackendApiResponse类型

    ElMessage.error(msg || "请求失败");
    return Promise.reject(new Error(msg || "Request Error"));
  }
);

/**
 * 重试请求的回调函数类型
 */
type RetryCallback = () => void;

// JWT认证相关代码已注释
/*
// Token 刷新相关状态
let isRefreshingToken = false;
const pendingRequests: RetryCallback[] = [];

/**
 * 刷新 Token 并重试请求
 */
/*
async function refreshTokenAndRetry(config: InternalAxiosRequestConfig): Promise<any> {
  return new Promise((resolve, reject) => {
    // 封装需要重试的请求
    const retryRequest = () => {
      const newToken = Auth.getAccessToken();
      if (newToken && config.headers) {
        config.headers.Authorization = `Bearer ${newToken}`;
      }
      service(config).then(resolve).catch(reject);
    };

    // 将请求加入等待队列
    pendingRequests.push(retryRequest);

    // 如果没有正在刷新，则开始刷新流程
    if (!isRefreshingToken) {
      isRefreshingToken = true;

      useUserStoreHook()
        .refreshToken()
        .then(() => {
          // 刷新成功，重试所有等待的请求
          pendingRequests.forEach((callback) => {
            try {
              callback();
            } catch (error) {
              console.error("Retry request error:", error);
            }
          });
          // 清空队列
          pendingRequests.length = 0;
        })
        .catch(async (error) => {
          console.error("Token refresh failed:", error);
          // 刷新失败，清空队列并跳转登录页
          pendingRequests.length = 0;
          await redirectToLogin("登录状态已失效，请重新登录");
          // 拒绝所有等待的请求
          pendingRequests.forEach(() => {
            reject(new Error("Token refresh failed"));
          });
        })
        .finally(() => {
          isRefreshingToken = false;
        });
    }
  });
}
*/

/**
 * 重定向到登录页面
 */
async function redirectToLogin(message: string = "请重新登录"): Promise<void> {
  try {
    ElNotification({
      title: "提示",
      message,
      type: "warning",
      duration: 3000,
    });

    await useUserStoreHook().resetAllState();

    // 跳转到登录页，保留当前路由用于登录后跳转
    const currentPath = router.currentRoute.value.fullPath;
    await router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
  } catch (error) {
    console.error("Redirect to login error:", error);
  }
}

// 定义一个通用的请求函数，返回Promise<T>而不是Promise<AxiosResponse<T>>
const request = <T = any>(config: AxiosRequestConfig): Promise<T> => {
  return service(config) as Promise<T>; // Assert the return type to Promise<T>
};

export default request;
