// 积分调整信息接口
export interface StoreChangeInfo {
  changeCause: string
  changeStores: number
  excessStores: number
  desc: string
}

// 积分查询参数接口
export interface StoreQueryParams {
  guid?: string
  createTime?: string
  endTime?: string
  pageIndex?: number
  pageSize?: number
} 