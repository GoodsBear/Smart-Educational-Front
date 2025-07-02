import request from '@/utils/request'

// 跟进记录类型定义
interface FollowRecord {
  getInTouchEnum: number
  followStageEnum: number
  touchTime: string
  nextTouchTime: string
  touchWay: string
  followDesc: string
}

// 添加跟进记录
export const addFollowRecord = (guid: string, data: FollowRecord) => {
  return request({
    url: `/api/app/follow-services?guid=${guid}`,
    method: 'post',
    data
  })
}

// 删除跟进记录
export const deleteFollowRecord = (followGuid: string, studentGuid: string) => {
  return request({
    url: `/api/app/follow-services/del-follow?followGuid=${followGuid}&StudentGuid=${studentGuid}`,
    method: 'delete'
  })
}

// 获取跟进记录列表
export const getFollowList = (studentGuid: string) => {
  return request({
    url: `/api/app/follow-services/follow-list?StudentGuid=${studentGuid}`,
    method: 'get'
  })
}

export default {
  addFollowRecord,
  deleteFollowRecord,
  getFollowList
}
