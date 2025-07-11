import request from "@/utils/request";

// 获取薪资列表（分页+查询）
export function getSalaryList(params: {
  OrganizationId?: string;
  PageIndex: number;
  PageSize: number;
}) {
  return request({
    url: "/api/app/salary-setting-searvices",
    method: "get",
    params,
  });
}

// 获取薪资分表课时表分类列表
export function getSalaryHourList() {
  return request({
    url: "/api/app/salary-setting-searvices/class-hour-fee-setting",
    method: "get",
  });
}

// 更新薪资
export function updateSalary(
  id: string,
  data: {
    id: string;
    staffId: string;
    staffName: string;
    basicSalaryType: number;
    basicSalary: number;
    qualifiedClassHours: number;
    classHourFeeSettings: string;
    classHourDuration: number;
    classHourFee: number;
    assistantFee: number;
  }
) {
  return request({
    url: `/api/app/salary-setting-searvices/${id}`,
    method: "put",
    data,
  });
}
