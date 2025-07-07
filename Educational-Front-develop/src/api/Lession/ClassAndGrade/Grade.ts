import request from '@/utils/request';

// 批量删除年级
export function batchDeleteGrades(ids: string[]) {
  return request({
    url: '/api/app/grade/batch-delete',
    method: 'delete',
    params: { ids },
  });
}

// 创建年级
export function createGrade(data: { gradeName: string; enrollYear: string; sort: number; remark: string }) {
  return request({
    url: '/api/app/grade/position',
    method: 'post',
    data,
  });
}

// 年级列表（分页/条件）
export function getGradeList(params: { GradeName?: string; EnrollYear?: string; PageIndex?: number; PageSize?: number }) {
  return request({
    url: '/api/app/grade/position-list',
    method: 'get',
    params,
  });
}

// 修改年级
export function updateGrade(id: string, data: { gradeName: string; enrollYear: string; sort: number; remark: string }) {
  return request({
    url: `/api/app/grade/${id}/position`,
    method: 'put',
    data,
  });
}

// 获取年级列表下拉框
export function getGradeDropdown() {
  return request({
    url: '/api/app/grade/grade',
    method: 'get',
  });
}
