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