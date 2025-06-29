import request from '@/utils/request'

/**
 * @description 添加科目
 * @param {object} data 科目信息
 */
export function addSubject(data: {
  subjectName: string
  sortWeight: number
  subjectDescription: string
}) {
  return request({
    url: '/api/app/subject-serives/subject',
    method: 'post',
    data,
  })
}

/**
 * @description 获取科目下拉列表
 */
export function getSubjectDropdown() {
  return request({
    url: '/api/app/subject-serives/subject',
    method: 'get',
  })
}

/**
 * @description 批量删除科目
 * @param {string[]} data 科目ID列表
 */
export function deleteSubjects(data: string[]) {
  return request({
    url: '/api/app/subject-serives/subject-delete',
    method: 'post',
    data,
  })
}

/**
 * @description 根据ID获取单个科目信息
 * @param {string} id 科目ID
 */
export function getSubjectById(id: string) {
  return request({
    url: `/api/app/subject-serives/${id}/one`,
    method: 'get',
  })
}

/**
 * @description 获取科目分页列表
 * @param {object} params 查询参数
 */
export function getSubjectList(params: {
  SubjectName?: string
  PageIndex: number
  PageSize: number
}) {
  return request({
    url: '/api/app/subject-serives',
    method: 'get',
    params,
  })
}

/**
 * @description 修改科目信息
 * @param {string} id 科目ID
 * @param {object} data 科目信息
 */
export function updateSubject(
  id: string,
  data: {
    subjectName: string
    sortWeight: number
    subjectDescription: string
  }
) {
  return request({
    url: `/api/app/subject-serives/${id}`,
    method: 'put',
    data,
  })
} 