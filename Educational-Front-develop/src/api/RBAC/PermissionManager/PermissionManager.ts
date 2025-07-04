// src/api/permission.ts
import request from '@/utils/request'

/**
 * 添加权限
 * @param data 权限信息
 */
export function addPermission(data: {
  permissionName: string;
  permissionsDesc: string;
  parentId: string;
}) {
  return request({
    url: '/api/app/permissions-services/permissions',
    method: 'post',
    data
  })
}

/**
 * 修改权限
 * @param guid 权限ID
 * @param data 权限信息
 */
export function updatePermission(guid: string, data: {
  permissionName: string;
  permissionsDesc: string;
  parentId: string;
}) {
  return request({
    url: '/api/app/permissions-services/permissions',
    method: 'put',
    params: { guid },
    data
  })
}

/**
 * 删除权限
 * @param guid 权限ID
 */
export function deletePermission(guid: string) {
  return request({
    url: '/api/app/permissions-services/del-permissions',
    method: 'delete',
    params: { guid }
  })
}

/**
 * 获取权限树形结构
 */
export function getPermissionTree() {
  return request({
    url: '/api/app/permissions-services/permissions-tree',
    method: 'get'
  })
}

/**
 * 分页查询权限
 * @param params 查询参数
 */
export function getPermissionPage(params: {
  PermissionName?: string;
  PageIndex: number;
  PageSize: number;
}) {
  return request({
    url: '/api/app/permissions-services/page-permissions',
    method: 'get',
    params
  })
}

/**
 * 角色分配权限
 * @param data 角色权限分配信息
 */
export function addRolePermission(data: {
  roleId: string;
  permissionIds: string[];
}) {
  return request({
    url: '/api/app/role-perssion/role-permission',
    method: 'post',
    data
  })
}

/**
 * 获取角色已分配的权限
 * @param roleId 角色ID
 */
export function getRolePermissions(roleId: string) {
  return request({
    url: `/api/app/role-perssion/role-id-to-find-permission/${roleId}`,
    method: 'get'
  }).catch(() => {
    // 当接口返回404或其他错误时，静默处理，返回一个表示"无权限"的空数据结构
    // 这样就不会触发全局的错误提示
    return { data: [] };
  });
}