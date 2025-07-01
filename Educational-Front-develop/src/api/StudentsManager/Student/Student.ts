import request from '@/utils/request'
import type { StudentInfo } from './types'

// 学生管理相关接口
const api = {
  // 新增学员
  addStudent(data: StudentInfo) {
    return request({
      url: '/api/app/student-services',
      method: 'post',
      data
    })
  },

  // 分页查询结业学员
  getFinishStudents(params: {
    studentName?: string
    orgaizationId?: string
    gradeId?: string
    pageIndex?: number
    pageSize?: number
  }) {
    return request({
      url: '/api/app/student-services/page-finish',
      method: 'get',
      params
    })
  },

  // 分页查询在学学员
  getLessonStudents(params: {
    studentName?: string
    orgaizationId?: string
    gradeId?: string
    pageIndex?: number
    pageSize?: number
  }) {
    return request({
      url: '/api/app/student-services/page-lesson',
      method: 'get',
      params
    })
  },

  // 分页查询意向学员
  getReadyStudents(params: {
    studentName?: string
    orgaizationId?: string
    gradeId?: string
    pageIndex?: number
    pageSize?: number
  }) {
    return request({
      url: '/api/app/student-services/page-ready',
      method: 'get',
      params
    })
  },

  // 删除学员
  deleteStudent(guid: string) {
    return request({
      url: '/api/app/student-services/del-student',
      method: 'delete',
      params: { guid }
    })
  },

  // 更新学员信息
  updateStudent(guid: string, data: StudentInfo) {
    return request({
      url: '/api/app/student-services/student',
      method: 'put',
      params: { guid },
      data
    })
  },

  // 更新学员 在线学员，意向学员，结业学员
  updateStudentType(studentEnum: number, guids: string[]) {
    return request({
      url: '/api/app/student-services/student-type',
      method: 'put',
      params: { 
        studentEnum // 学员类型：0-在线学员，1-意向学员，2-结业学员
      },
      data: guids
    })
  },

  // 转校
  transferSchool(params: { campusId: string, guids: string[] }) {
    return request({
      url: `/api/app/student-services/student-school/${params.campusId}`,
      method: 'put',
      data: params.guids
    })
  },

  // 修改顾问
  updateConsultant(params: { consultant: string, guids: string[] }) {
    return request({
      url: `/api/app/student-services/student-consultant?consultant=${params.consultant}`,
      method: 'put',
      data: params.guids
    })
  },

  // 批量删除学员
  batchDeleteStudents(guids: string[]) {
    return request({
      url: '/api/app/student-services/del-student-list',
      method: 'delete',
      params: { guids }
    })
  },

  // 获取组织机构列表
  getOrganizationList() {
    return request({
      url: '/api/app/organization-services/organization',
      method: 'get'
    })
  },

  // 获取年级列表
  getGradeList() {
    return request({
      url: '/api/app/grade/grade',
      method: 'get'
    })
  },

  // 获取员工列表
  getStaffList() {
    return request({
      url: '/api/app/staff-services/staff',
      method: 'get'
    })
  }
}

export default api
