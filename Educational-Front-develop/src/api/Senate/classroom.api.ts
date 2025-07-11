import request from "@/utils/request";

/**
 * 批量删除教室
 * @param data 包含教室ID的数组
 */
export function batchDeleteClassRoom(data: any) {
  return request({
    url: "/api/app/class-room/batch-delete",
    method: "delete",
    params: data,
  });
}

/**
 * 创建教室
 * @param data 教室数据
 */
export function createClassRoom(data: any) {
  return request({
    url: "/api/app/class-room/class-room",
    method: "post",
    data,
  });
}

/**
 * 获取教室列表下拉框
 * @param params 查询参数
 */
export function selectClassRoom(params?: any) {
  return request({
    url: "/api/app/class-room/class-room",
    method: "get",
    params,
  });
}

/**
 * 获取教室列表
 * @param params 查询参数
 */
export function getClassRoomList(params: any) {
  return request({
    url: "/api/app/class-room/class-room-list",
    method: "get",
    params,
  });
}

/**
 * 修改教室
 * @param id 教室ID
 * @param data 教室数据
 */
export function updateClassRoom(id: string, data: any) {
  return request({
    url: `/api/app/class-room/${id}/class-room`,
    method: "put",
    data,
  });
}
