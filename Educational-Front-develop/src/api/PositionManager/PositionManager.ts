import request from '@/utils/request'

/**
 * 创建公告
 * @param data 公告信息
 */
export function createAnnouncement(data: {
  title: string;
  description: string;
}) {
  return request({
    url: '/api/app/announcement/position',
    method: 'post',
    data
  })
}

/**
 * 获取公告列表
 * @param params 查询参数
 */
export function getAnnouncementList(params: {
  Title?: string;
  PageIndex: number;
  PageSize: number;
}) {
  return request({
    url: '/api/app/announcement/position-list',
    method: 'get',
    params
  })
}

/**
 * 修改公告
 * @param id 公告ID
 * @param data 公告信息
 */
export function updateAnnouncement(id: string, data: {
  title: string;
  description: string;
}) {
  return request({
    url: `/api/app/announcement/${id}/position`,
    method: 'put',
    data
  })
}

/**
 * 删除公告
 * @param id 公告ID
 */
export function deleteAnnouncement(id: string) {
  return request({
    url: `/api/app/announcement/${id}/position`,
    method: 'delete'
  })
}

/**
 * 批量删除公告
 * @param ids 公告ID数组
 */
export function batchDeleteAnnouncement(ids: string[]) {
  return request({
    url: '/api/app/announcement/batch-delete',
    method: 'delete',
    params: { ids }
  })
}
