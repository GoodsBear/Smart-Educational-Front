
import request from '@/utils/request';

// 创建组织机构
export function createOrganization(data: any) {
  return request({
    url: '/api/app/organization-services',
    method: 'post',
    data,
  });
}

// 分页查询组织机构列表
export function getOrganizationList(params: { PageIndex: number; PageSize: number }) {
  return request({
    url: '/api/app/organization-services',
    method: 'get',
    params,
  });
}

// 删除组织机构
export function deleteOrganization(id: string) {
  return request({
    url: `/api/app/organization-services/${id}`,
    method: 'delete',
  });
}

// 根据ID获取组织机构（反填）
export function getOrganizationById(id: string) {
  return request({
    url: `/api/app/organization-services/${id}`,
    method: 'get',
  });
}

// 更新组织机构
export function updateOrganization(id: string, data: any) {
  return request({
    url: `/api/app/organization-services/${id}`,
    method: 'put',
    data,
  });
}

// 组织机构级别下拉表
export function getOrganizationLevelList() {
  return request({
    url: '/api/app/organization-services/level',
    method: 'get',
  });
}

// 组织机构级别添加
export function addOrganizationLevel(data: { name: string }) {
  return request({
    url: '/api/app/organization-services/level',
    method: 'post',
    data,
  });
}

// 获取组织机构下拉框
export function getOrganizationDropdown() {
  return request({
    url: '/api/app/organization-services/organization',
    method: 'get',
  });
}

// 字段全显示树形组织机构表
export function getOrganizationTreeAll(parentId: string) {
  return request({
    url: `/api/app/organization-services/tree-all/${parentId}`,
    method: 'get',
  });
}

// 获取树形组织机构（部分字段）
export function getOrganizationTree(parentId: string) {
  return request({
    url: `/api/app/organization-services/tree/${parentId}`,
    method: 'get',
  });
}

// 获取组织机构树
export function getOrganizationTreeSimple() {
  return request({
    url: '/api/app/organization-services/organzation-tree',
    method: 'get',
  });
}
