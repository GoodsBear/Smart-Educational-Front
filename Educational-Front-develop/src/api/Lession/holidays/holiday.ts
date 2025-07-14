import request from '@/utils/request'

// 获取节假日列表
export function getHolidayList(year: number) {
  return request({
    url: `/api/app/holiday`,
    method: 'get',
    params: { Year: year }
  })
}

// 新增节假日
export function addHoliday(date: string) {
  return request({
    url: `/api/app/holiday`,
    method: 'post',
    data: { date }
  })
}

// 删除节假日
export function deleteHoliday(id: string) {
  return request({
    url: `/api/app/holiday/${id}`,
    method: 'delete'
  })
}
