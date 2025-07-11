import request from "@/utils/request";

/**
 * @description 添加排课信息
 * @param {object} data 排课信息
 */

// 1. 定义DTO类型（大驼峰，类型名）
interface scheduleTimes {
  dayOfWeek?: number; // 周
  startTime?: number; // 开始
  endTime?: number; // 结束
  classroomId?: string; //教室Id
}
// 2. 创建响应式数据（小驼峰，变量名）
const scheduleTimeDto = ref<scheduleTimes[]>([
  // 可选：初始对象（也可留空数组 []）
  {
    dayOfWeek: undefined,
    startTime: undefined,
    endTime: undefined,
    classroomId: undefined,
  },
]);

export function addClassSchedule(data: {
  organizationId: string;
  classId: string;
  courseId: string;
  mainTeacher: string[];
  assistantTeacher: string[];
  startDate: Date;
  endDate: Date;
  consumptionBase: number;
  maxAttendees: number;
  maxSchedules: number;
  skipHolidays: boolean;
  isTimetableGenerated: boolean;
  hasSchedulingConflict: boolean;
  generatedSessionCount: number;
  scheduleTimes: scheduleTimes[];
}) {
  return request({
    url: "/api/app/class-schedule-services/class-schedule",
    method: "post",
    data,
  });
}

/**
 * @description 获取排课信息
 * @param {object} params 查询参数
 */
export function getClassSchedule(params: {
  organizationId?: string;
  ClassId?: string;
  CourseName?: string;
  PageIndex: number;
  PageSize: number;
}) {
  return request({
    url: "/api/app/class-schedule-services",
    method: "get",
    params,
  });
}

/**
 * @description 修改科目信息
 * @param {string} id 科目ID
 * @param {object} data 科目信息
 */
export function updateSubject(
  id: string,
  data: {
    subjectName: string;
    sortWeight: number;
    subjectDescription: string;
  }
) {
  return request({
    url: `/api/app/subject-serives/${id}`,
    method: "put",
    data,
  });
}
