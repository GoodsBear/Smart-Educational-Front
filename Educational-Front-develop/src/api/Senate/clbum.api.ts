import request from "@/utils/request";

/**
 * 批量删除班级
 * @param data 包含班级ID的数组
 */
export function batchDeleteClassInfo(data: any) {
  return request({
    url: "/api/app/class-info/batch-delete",
    method: "delete",
    params: data,
  });
}

/**
 * 创建班级
 * @param data 班级数据
 */
export function createClassInfo(data: any) {
  return request({
    url: "/api/app/class-info/class",
    method: "post",
    data,
  });
}

/**
 * 班级下拉框
 * @param params 查询参数
 */
export function selectClassInfo(params?: any) {
  return request({
    url: "/api/app/class-info/class",
    method: "get",
    params,
  });
}

/**
 * 班级列表
 * @param params 查询参数
 */
export function getClassInfoList(params: any) {
  return request({
    url: "/api/app/class-info/class-list",
    method: "get",
    params,
  });
}

/**
 * 修改班级
 * @param id 班级ID
 * @param data 班级数据
 */
export function updateClassInfo(id: string, data: any) {
  return request({
    url: `/api/app/class-info/${id}/class`,
    method: "put",
    data,
  });
}

/**
 * 批量修改班级状态
 * @param data 包含班级ID和状态的对象
 */
export function batchUpdateClassStatus(data: any) {
  return request({
    url: "/api/app/class-info/batch-update-class-status",
    method: "put",
    data,
  });
}
/**
 * 反填
 * @param id 班级ID
 */
export function FTClassInfo(id: string) {
  return request({
    url: `/api/app/class-info/${id}/f-tClass-info`,
    method: "get"
  });
}
