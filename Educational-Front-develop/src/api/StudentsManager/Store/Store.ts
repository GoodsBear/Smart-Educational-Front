import request from '@/utils/request'
import type { StoreChangeInfo, StoreQueryParams } from './types'

// 积分管理相关接口
const api = {
  // 积分调整
  adjustStore(guid: string, addOrRecude: number, data: StoreChangeInfo) {
    return request({
      url: '/api/app/store-services',
      method: 'post',
      params: {
        guid,
        addOrRecude
      },
      data
    })
  },

  // 学生对应积分列表
  getStudentStoreList(params: StoreQueryParams) {
    return request({
      url: '/api/app/store-services/page',
      method: 'get',
      params
    })
  }
}

export default api
