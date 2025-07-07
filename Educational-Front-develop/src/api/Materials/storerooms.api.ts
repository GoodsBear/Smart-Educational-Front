import request from "@/utils/request";

/**
 * 获取物料变动列表
 * @param params 查询参数
 */
export function getMaterialRetordList(params: any) {
  return request({
    url: "/api/app/material-retord/material-retord-list",
    method: "get",
    params,
  });
}

/**
 * 物料入库
 * @param data 入库数据
 */
export function materialRetordIn(data: any) {
  return request({
    url: "/api/app/material-retord/material-retord-in",
    method: "post",
    data,
  });
}

/**
 * 物料出库
 * @param data 出库数据
 */
export function materialRetordOut(data: any) {
  return request({
    url: "/api/app/material-retord/material-retord-out",
    method: "post",
    data,
  });
}
