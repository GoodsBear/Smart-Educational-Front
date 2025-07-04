import request from "@/utils/request";

/******
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
  totalCount?: number;
  totalPage?: number;
  roleCount?: number;
  data: RoleItem[];
}

/**
 * 角色列表项接口
 */
export interface RoleItem extends RoleData {
  id: string;
  creationTime: string;
  creatorId: string | null;
  lastModificationTime: string | null;
  lastModifierId: string | null;
  isDeleted: boolean;
  deleterId: string | null;
  deletionTime: string | null;
  extraProperties: Record<string, any>;
  concurrencyStamp: string;
}

/**
 * API响应接口
 */
export interface ApiResponse {
  issuc: boolean;
  code: number;
  msg: string;
}

/**
 * 角色API响应结构
 */
export interface RoleApiResponse {
  data: RolePageResult;
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
    console.log('请求角色列表参数:', params);
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

/**
 * 用户分配角色
 * @param data 用户角色分配信息
 */
export function assignUserRole(data: {
  staffId: string;
  roleIds: string[];
}) {
  return request({
    url: '/api/app/staf-role/staff-role',
    method: 'post',
    data
  })
}

/**
 * 给角色分配用户
 * @param data 角色用户分配信息
 */
export function assignRoleToStaff(data: {
  roleId: string;
  staffIds: string[];
}) {
  return request({
    url: '/api/app/staf-role/role-staff',
    method: 'post',
    data
  })
}

/**
 * 角色下拉
 */
export function selRole (){
  return request({
    url:'/api/app/role-services/sel-role',
    method:'get'
  })
}

export default RoleManagerAPI;
