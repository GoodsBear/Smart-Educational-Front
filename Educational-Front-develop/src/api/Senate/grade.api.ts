import request from '@/utils/request'

/**
 * 批量删除年级
 * @param data 年级ID数组
 */
export function batchDeleteGrade(data: any) {
  return request({
    url: '/api/app/grade/batch-delete',
    method: 'delete',
    params: data,
  })
}

/**
 * 创建年级
 * @param data 年级数据
 */
export function createGrade(data: any) {
  return request({
    url: '/api/app/grade/position',
    method: 'post',
    data,
  })
}

/**
 * 获取年级列表
 * @param params 查询参数
 */
export function getGradeList(params?: any) {
  return request({
    url: '/api/app/grade/position-list',
    method: 'get',
    params,
  })
}

/**
 * 修改年级
 * @param id 年级ID
 * @param data 年级数据
 */
export function updateGrade(id: string | number, data: any) {
  return request({
    url: `/api/app/grade/${id}/position`,
    method: 'put',
    data,
  })
}

/**
 * 获取年级下拉框
 * @param params 查询参数
 */
export function getGradeDropdown(params?: any) {
  return request({
    url: '/api/app/grade/grade',
    method: 'get',
    params,
  })
}
