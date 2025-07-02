import request from '@/utils/request'

// 员工管理相关接口
const api = {
  // 获取员工列表
  getStaffList() {
    return request({
      url: '/api/app/staff-services/staff',
      method: 'get'
    })
  }
}

export default api 