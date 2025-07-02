import request from "@/utils/request";

const ORGANIZATION_BASE_URL = "/api/app/organization-services";

const OrganizationAPI = {
  /**
   * 创建组织机构
   * @param data 组织机构数据
   */
  createOrganization(data: any) {
    return request({
      url: `${ORGANIZATION_BASE_URL}`,
      method: "post",
      data,
    });
  },

  /**
   * 查询组织机构列表
   * @param params 查询参数
   */
  getOrganizationList(params?: any) {
    return request({
      url: `${ORGANIZATION_BASE_URL}`,
      method: "get",
      params,
    });
  },

  /**
   * 删除组织机构
   * @param id 组织机构ID
   */
  deleteOrganization(id: string) {
    return request({
      url: `${ORGANIZATION_BASE_URL}/${id}`,
      method: "delete",
    });
  },

  /**
   * 根据ID获取组织机构（反填）
   * @param id 组织机构ID
   */
  getOrganizationById(id: string) {
    return request({
      url: `${ORGANIZATION_BASE_URL}/${id}`,
      method: "get",
    });
  },

  /**
   * 更新组织机构
   * @param id 组织机构ID
   * @param data 组织机构数据
   */
  updateOrganization(id: string, data: any) {
    return request({
      url: `${ORGANIZATION_BASE_URL}/${id}`,
      method: "put",
      data,
    });
  },

  /**
   * 组织机构级别下拉表
   */
  getOrganizationLevelList() {
    return request({
      url: `${ORGANIZATION_BASE_URL}/level`,
      method: "get",
    });
  },

  /**
   * 组织机构级别添加
   * @param data 级别数据
   */
  addOrganizationLevel(data: any) {
    return request({
      url: `${ORGANIZATION_BASE_URL}/level`,
      method: "post",
      data,
    });
  },

  /**
   * 获取组织机构下拉框
   */
  getOrganizationSelect() {
    return request({
      url: `${ORGANIZATION_BASE_URL}/organization`,
      method: "get",
    });
  },

  /**
   * 树形组织机构表
   * @param parentId 父级ID
   */
  getOrganizationTree(parentId: string) {
    return request({
      url: `${ORGANIZATION_BASE_URL}/tree/${parentId}`,
      method: "get",
    });
  },
};

export default OrganizationAPI;
