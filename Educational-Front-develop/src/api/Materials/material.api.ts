import request from "@/utils/request";

/**
 * 新增物料
 * @param data 物料数据
 */
export function addMaterial(data: any) {
  return request({
    url: "/api/app/material/material",
    method: "post",
    data
  });
}

/**
 * 分页获取物料列表
 * @param params 查询参数
 */
export function getPagedMaterials(params: any) {
  return request({
    url: "/api/app/material/paged-materials",
    method: "get",
    params
  });
}

/**
 * 入库
 * @param id 物料ID
 * @param data 入库数据
 */
export function stockInMaterial(id: string, data: any) {
  return request({
    url: `/api/app/material/${id}/stock-in`,
    method: "put",
    data
  });
}

/**
 * 出库
 * @param id 物料ID
 * @param data 出库数据
 */
export function stockOutMaterial(id: string, data: any) {
  return request({
    url: `/api/app/material/${id}/stock-out`,
    method: "put",
    data
  });
}

/**
 * 批量修改物料状态
 * @param data 包含物料ID和状态的对象
 */
export function updateMaterialStatus(data: any) {
  return request({
    url: "/api/app/material/updata-status",
    method: "put",
    data
  });
}
