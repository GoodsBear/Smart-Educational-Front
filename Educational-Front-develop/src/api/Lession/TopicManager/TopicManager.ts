import request from "@/utils/request";

// 获取专题列表（查询专题-分页+查询）
export function getTopicList(params: {
  Name?: string;
  CategoryId?: string;
  Teacher?: string;
  PageIndex: number;
  PageSize: number;
}) {
  return request({
    url: "/api/app/special-subject-services",
    method: "get",
    params,
  });
}

// 创建专题
export interface CreateTopicDto {
  name: string;
  categoryId: string; // 例如: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  logoPath: string;
  teacher: string;
  brief: string;
  details: string;
  achievementDisplay: string;
}

export function createTopic(data: CreateTopicDto) {
  return request({
    url: "/api/app/special-subject-services",
    method: "post",
    data,
  });
}

// 创建专题分类
export function createCategory(data: { categoryName: string }) {
  return request({
    url: "/api/app/special-subject-services/category",
    method: "get",
    data,
  });
}

// 获取专题分类列表
export function getCategoryList() {
  return request({
    url: "/api/app/special-subject-services/category",
    method: "get",
  });
}

// 获取教职员工下拉列表
export function getstaffList() {
  return request({
    url: "/api/app/staff-services/staff",
    method: "get",
  });
}

// 批量删除专题
export function batchDeleteTopic(guids: string[]) {
  return request({
    url: "/api/app/special-subject-services/guid",
    method: "delete",
    params: { guids },
  });
}

// 获取专题详情
export function getTopicDetail(id: string) {
  return request({
    url: `/api/app/special-subject-services/${id}`,
    method: "get",
  });
}

// 更新专题
export function updateTopic(
  id: string,
  data: {
    name: string;
    categoryId: string;
    logoPath: string;
    teacher: string;
    brief: string;
    details: string;
    achievementDisplay: string;
    concurrencyStamp?: string;
  }
) {
  return request({
    url: `/api/app/special-subject-services/${id}`,
    method: "put",
    data,
  });
}

// 下拉专题
export function getSpecialSubjectDropdown() {
  return request({
    url: "/api/app/special-subject-services/xi-aSpecial-subject",
    method: "post",
  });
}
