import request from "@/utils/request";

const STAFF_BASE_URL = "/api/app/staff-services";

const StaffAPI = {
  /**
   * 获取成员列表
   *
   * @param queryParams 查询参数（可选）
   * @returns 成员列表数据
   */
  getList(queryParams?: StaffQuery) {
    return request<any[]>({
      url: `/api/app/staff-services/staff-list`,
      method: "get",
      params: queryParams,
    });
  },

  /**
   * 新增员工
   *
   * @param data 员工表单数据
   * @returns 请求结果
   */
  createStaff(data: StaffFormData) {
    return request({
      url: `${STAFF_BASE_URL}/staff`,
      method: "post",
      data,
    });
  },

  /**
   * 删除员工
   *
   *@param ids 员工ID，多个以英文逗号(,)分隔
   *@returns 删除结果
   */
  deleteStaff(ids: string) {
    return request({
      url: `${STAFF_BASE_URL}/staff/`,
      method: "delete",
      params: ids,
    });
  },

  /**
   * 编辑员工
   *
   *@param staffId 员工ID，多个以英文逗号(,)分隔
   *@returns 编辑结果
   */
  updateStaff(staffId: string, data: StaffFormData) {
    return request({
      url: `${STAFF_BASE_URL}/staff/${staffId}`,
      method: "put",
      data,
    });
  },

  /**
   * 更新员工状态
   * 0:离职 1:在职
   * @params ids 员工ID，多个以英文逗号(,)分隔
   * @params status 状态
   * @returns 更新结果
   * */
  updateStaffStatus(Ids: string, status: string) {
    return request({
      url: `${STAFF_BASE_URL}/staff-status?status=${status}`,
      method: "put",
      data: Ids,
    });
  },

  /**
   * 修改员工密码
   * @param staffId 员工ID
   * @param newPassword 新密码
   * @returns 请求结果
   */
  updateStaffPassword(staffId: string, newPassword: string) {
    return request({
      url: `/api/app/staff-services/staff-password/${staffId}`,
      method: "put",
      params: { newPassword },
    });
  },
};

export default StaffAPI;

/** 员工查询参数 */
export interface StaffQuery {
  /** 员工姓名搜索关键字 */
  StaffName?: string;
  /** 员工状态 (0或1) */
  Status?: number;
  /** 当前页码 */
  PageIndex: number;
  /** 每页数量 */
  PageSize: number;
}

/** 员工基本信息 */
export interface StaffFormData {
  staffName: string;
  staffAccount: string;
  staffPassword?: string; // 密码在更新时可选
  staffPhone: string;
  organization: string;
  staffGender: string;
  positionId: string; // UUID格式
  roleId: string; // UUID格式
  staffTypeId: string; // UUID格式
  entryDate: string; // ISO日期格式
  status: number;
  education: string;
  birthday: string; // ISO日期格式
  graduationSchool: string;
  introduction: string;
  photoUrl: string;
}

/** 员工列表项 */
export interface StaffListItem {
  id: string; // 假设返回数据中包含ID
  staffName: string;
  staffAccount: string;
  staffPhone: string;
  organization: string;
  staffGender: string;
  positionId: string;
  position: string; // 职位名称
  roleId: string;
  role: string; // 角色名称
  staffTypeId: string;
  staffType: string; // 员工类型名称
  entryDate: string; // ISO日期格式
  status: number;
  education: string;
  birthday: string; // ISO日期格式
  graduationSchool: string;
  introduction: string;
  photoUrl: string;
}

/** 员工列表响应类型 */
export interface DeptListResponse {
  data: StaffListItem[];
  totleCount: number;
  totlePage: number;
}
