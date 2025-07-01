import request from "@/utils/request";

/**
 * 角色数据接口定义
 */
export interface RoleData {
  roleName: string;
  roleEncode: string;
  roleDesc: string;
  roleStatus: number;
}

/**
 * 角色查询参数接口
 */
export interface RoleQueryParams {
  roleName?: string;
  pageIndex: number;
  pageSize: number;
}

/**
 * 分页角色结果接口
 */
export interface RolePageResult {
  totalCount: number;
  totalPage: number;
  data: RoleItem[];
}

/**
 * 角色列表项接口
 */
export interface RoleItem extends RoleData {
  id: string;
  creationTime: string;
  creatorId: string;
  lastModificationTime: string;
  lastModifierId: string;
  isDeleted: boolean;
  deleterId: string;
  deletionTime: string;
}

/**
 * API响应接口
 */
export interface ApiResponse {
  issue: boolean;
  code: number;
  msg: string;
}

/**
 * 角色管理API
 * 提供角色的增删改查功能
 */
const RoleManagerAPI = {
  /**
   * 创建角色
   * @param data 角色数据
   */
  createRole(data: RoleData) {
    return request<ApiResponse>({
      url: "/api/app/role-services/role",
      method: "post",
      data,
    });
  },

  /**
   * 获取角色列表（分页）
   * @param params 查询参数
   */
  getRoleList(params: RoleQueryParams) {
    return request<RolePageResult>({
      url: "/api/app/role-services/page-role",
      method: "get",
      params,
    });
  },

  /**
   * 更新角色
   * @param guid 角色ID
   * @param data 角色数据
   */
  updateRole(guid: string, data: RoleData) {
    return request<ApiResponse>({
      url: "/api/app/role-services/role",
      method: "put",
      params: { guid },
      data,
    });
  },

  /**
   * 删除角色
   * @param guid 角色ID
   */
  deleteRole(guid: string) {
    return request<ApiResponse>({
      url: "/api/app/role-services/del-role",
      method: "delete",
      params: { guid },
    });
  },
};

export default RoleManagerAPI; 