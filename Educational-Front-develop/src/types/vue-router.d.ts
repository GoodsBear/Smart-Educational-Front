// 创建一个简化的Vue Router类型声明文件
declare module 'vue-router' {
  export type NavigationGuardNext = (to?: string | object | false | ((vm: any) => any) | void) => void;
  
  export interface RouteLocationNormalized {
    path: string;
    params: Record<string, any>;
    query: Record<string, any>;
    matched: any[];
    meta: Record<string, any>;
    fullPath: string;
    hash: string;
    name?: string | null;
    redirectedFrom?: RouteLocationNormalized;
  }
  
  export interface RouteRecordRaw {
    path: string;
    component: any;
    redirect?: string;
    children?: RouteRecordRaw[];
    meta?: Record<string, any>;
    name?: string;
  }
} 