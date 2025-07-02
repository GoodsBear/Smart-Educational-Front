import request from "@/utils/request";

const ORGANIZATION_BASE_URL = "/api/app/organization-services";

const OrganizationAPI = {
  // 创建组织机构
  createOrganization(data: any) {
    return request({
      url: `${ORGANIZATION_BASE_URL}`,
      method: "post",
      data,
    });
  },

  // 查询组织机构列表
  getOrganizationList() {
    return request({
      url: `${ORGANIZATION_BASE_URL}`,
      method: "get",
    });
  },

  // 删除组织机构
  deleteOrganization(id: string) {
    return request({
      url: `${ORGANIZATION_BASE_URL}/${id}`,
      method: "delete",
    });
  },

  // 根据ID获取组织机构（反填）
  getOrganizationById(id: string) {
    return request({
      url: `${ORGANIZATION_BASE_URL}/${id}`,
      method: "get",
    });
  },

  // 更新组织机构
  updateOrganization(id: string, data: any) {
    return request({
      url: `${ORGANIZATION_BASE_URL}/${id}`,
      method: "put",
      data,
    });
  },

  // 组织机构级别下拉表
  getOrganizationLevelList() {
    return request({
      url: `${ORGANIZATION_BASE_URL}/level`,
      method: "get",
    });
  },

  // 组织机构级别添加
  addOrganizationLevel(data: any) {
    return request({
      url: `${ORGANIZATION_BASE_URL}/level`,
      method: "post",
      data,
    });
  },

  // 获取组织机构下拉框
  getOrganizationSelect() {
    return request({
      url: `${ORGANIZATION_BASE_URL}/organization`,
      method: "get",
    });
  },

  // 字段全显示树形组织机构表
  getOrganizationTreeAll(parentId: string) {
    return request({
      url: `${ORGANIZATION_BASE_URL}/tree-all/${parentId}`,
      method: "get",
    });
  },

  // 树形组织机构表
  getOrganizationTree(parentId: string) {
    return request({
      url: `${ORGANIZATION_BASE_URL}/tree/${parentId}`,
      method: "get",
    });
  },

  // 获取机构树
  getOrganizationTreeSimple() {
    return request({
      url: `${ORGANIZATION_BASE_URL}/organization-tree`,
      method: "get",
    });
  },
  /**
   * 批量删除职位
   * @param data 职位ID数组
   */
  batchDeleteOrganization(data: any) {
    return request({
      url: `${ORGANIZATION_BASE_URL}/batch-delete`,
      method: "delete",
      params: data,
    });
  },
};

export default OrganizationAPI;
