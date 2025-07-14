import request from '@/utils/request'
// 报名表添加
export const addEnrollmentRecord = ( data:any) => {
  return request({
    url: `/api/app/enrollment-record/enrollment`,
    method: 'post',
    data
  })
}

export const getEnrollmentRecordList = ( data:any) => {
  return request({
    url: `/api/app/enrollment-record/enrollment-record-list`,
    method: 'get',
    params:data
  })
}







export default {
  addEnrollmentRecord,
  getEnrollmentRecordList
}
