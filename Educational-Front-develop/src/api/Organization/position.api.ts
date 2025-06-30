import request from "@/utils/request";

const POSITION_BASE_URL = "/api/app/position";

const PositionAPI = {
  /**
   * 创建职位
   * @param data 职位数据
   */
  createPosition(data: any) {
    return request({
      url: `${POSITION_BASE_URL}/position`,
      method: "post",
      data,
    });
  },

  /**
   * 修改职位
   * @param id 职位ID
   * @param data 职位数据
   */
  updatePosition(id: string, data: any) {
    return request({
      url: `${POSITION_BASE_URL}/${id}/position`,
      method: "put",
      data,
    });
  },

  /**
   * 获取职位列表
   * @param params 查询参数
   */
  getPositionList(params?: any) {
    return request({
      url: `${POSITION_BASE_URL}/position-list`,
      method: "get",
      params,
    });
  },

  /**
   * 导出职位列表
   * @param params 查询参数
   */
  exportPositionList(params?: any) {
    return request({
      url: `${POSITION_BASE_URL}/export-position-list`,
      method: "get",
      params,
      responseType: "blob",
    });
  },

  /**
   * 批量删除职位
   * @param data 职位ID数组
   */
  batchDeletePosition(data: any) {
    return request({
      url: `${POSITION_BASE_URL}/batch-delete`,
      method: "delete",
      params: data,
    });
  },
};

export default PositionAPI;
