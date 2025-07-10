import request from "@/utils/request";

/**
 * 用户API接口
 * 提供用户登录、获取用户信息等功能
 */
const MyUserAPI = {
  /**
   * 用户登录接口
   * @param data 登录表单数据
   */
  login(data: {
    staffAccount: string;
    staffPassword: string;
    captchaKey: string;
    captchaCode: string;
  }) {
    return request({
      url: "api/app/staff-services/login",
      method: "post",
      data, // 这里用 data，不是 params
      headers: {
        "Content-Type": "application/json",
      },
    });
  },

  /**
   * 获取当前登录用户信息
   */
  getUserInfo() {
    // // 检查是否使用模拟数据
    // const useMockData = !request.defaults.baseURL || localStorage.getItem("useMockData") === "true";
    // if (useMockData) {
    //   console.log("使用模拟用户信息数据");
    //   return new Promise<UserInfo>((resolve) => {
    //     setTimeout(() => {
    //       const username = localStorage.getItem("loginUser") || "admin";
    //       resolve({
    //         userId: "1",
    //         username,
    //         nickname: username === "admin" ? "管理员" : username,
    //         avatar: "",
    //         roles: ["admin"],
    //         perms: ["*:*:*"],
    //         userEmail: "admin@example.com",
    //         userPhone: "13800138000",
    //         userSex: true,
    //       });
    //     }, 300);
    //   });
    // }
    // return request<UserInfo>({
    //   url: "api/app/account/info",
    //   method: "get",
    // });
  },

  /**
   * 退出登录
   */
  logout() {
    // // 检查是否使用模拟数据
    // const useMockData = !request.defaults.baseURL || localStorage.getItem("useMockData") === "true";

    // if (useMockData) {
    //   console.log("使用模拟登出");
    //   return new Promise<void>((resolve) => {
    //     setTimeout(() => {
    //       localStorage.removeItem("isLoggedIn");
    //       localStorage.removeItem("loginUser");
    //       resolve();
    //     }, 300);
    //   });
    // }

    return request({
      url: "api/app/user/logout",
      method: "post",
    });
  },

  /**
   * 获取验证码
   */
  getCaptcha(id: any) {
    return request({
      url: `/api/Captcha/Captcha?id=${id}`,
      method: "get",
      responseType: "blob",
    });
  },
};

export default MyUserAPI;

/** 登录表单数据 */
export interface LoginFormData {
  /** 用户名 */
  StaffAccount: string;
  /** 密码 */
  StaffPassword: string;
  /** 验证码缓存key */
  CaptchaKey: string;
  /** 验证码 */
  CaptchaCode: string;
  /** 记住我 */
  rememberMe: boolean;
}

/** 登录响应体中的用户数据和令牌信息 */
export interface LoginResult {
  id: string;
  staffAccount: string;
  // userEmail: string;
  staffPhone: string;
  // userSex: boolean;
  staffName?: string;
  avatar?: string;
  roles?: string[];
  perms?: string[];
  // 假设令牌信息也包含在登录响应的data中，如果实际没有，则需要修改后端或前端逻辑
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
}
