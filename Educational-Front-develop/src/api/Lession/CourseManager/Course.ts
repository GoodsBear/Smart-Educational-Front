import request from "@/utils/request";

/**
 * @description 新增课程
 * @param {object} data 课程信息
 */
export function addCourse(data: {
  id: string,
  courseName: string,
  campusId: string,
  subjectId: string,
  topicId: string,
  gratorId: string,
  sellUnit: string,
  courseTypeId: number,
  totalPrice: number,
  lessonNum: number,
  validMonthNum: number,
  isReserve: boolean,
  lessonCut: number,
  isAfterPay: boolean,
  lessonCutMode: number,
  lessonDuration: number,
  status: boolean,
  isOnlineSale: boolean,
  coverImage: string,
  isOpenRecommend: boolean,
  classQrCode: string,
  stockNum: number,
  stopSaleDate: Date,
  detailImageList: string,
  teacherRemark: string,
  serviceRemark: string
}) {
  return request({
    url: "/api/app/course-services/course",
    method: "post",
    data,
  });
}

/**
 * @description 获取课程分页列表
 * @param {object} params 查询参数
 */
export function getCourseList(params: {
  CourseName?: string;
  CampusId?: string;
  SubjectId?: string;
  Status?: boolean;
  GradeId?: string;
  PageIndex: number;
  PageSize: number;
}) {
  return request({
    url: "/GetListCourse",
    method: "get",
    params,
  });
}

/**
 * @description 批量修改课程状态
 * @param {object} params URL参数
 * @param {string[]} data 课程ID列表
 */
export function updateCourseStatus(params: { status: boolean; type: number }, data: string[]) {
  return request({
    url: "/api/app/course-services/course-status",
    method: "put",
    params,
    data,
  });
}

/**
 * @description 获取课程列表下拉框
 */
export function getCourseDropdown() {
  return request({
    url: "/GetCourseAsync",
    method: "get",
  });
}

/**
 * @description 修改课程信息
 * @param {object} data 课程信息
 */
export function updateCourse(data: any) {
  return request({
    url: "/UpdateCourse",
    method: "put",
    data,
  });
}
