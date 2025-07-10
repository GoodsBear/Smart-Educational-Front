import request from "@/utils/request";
import { List } from "echarts";

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
export function getSalaryHourList(SalarySettingId: string) {
  return request({
    url: `/api/app/salary-setting-searvices/class-hour-fee-setting/${SalarySettingId}`,
    method: "get",
  });
}
// 1. 定义DTO类型（大驼峰，类型名）
interface UpdateSalaryDto {
  classHourDuration?: number; // 课时时长（可选）
  classHourFee?: number; // 课时费（可选）
  assistantFee?: number; // 助教费（可选，修正大小写）
}

// 2. 创建响应式数据（小驼峰，变量名）
const updateSalaryDto = ref<UpdateSalaryDto[]>([
  // 可选：初始对象（也可留空数组 []）
  {
    classHourDuration: undefined,
    classHourFee: undefined,
    assistantFee: undefined,
  },
]);

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
    classHourFeeSettings?: UpdateSalaryDto[];
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
