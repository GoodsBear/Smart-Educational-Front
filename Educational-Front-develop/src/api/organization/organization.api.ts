import request from "@/utils/request";

/**
 * 获取机构树形结构
 * @param parentId 父级ID
 * @returns Promise
 */
export function getOrganizationTree(parentId: string) {
  return request({
    url: `/api/app/organization-services/tree/${parentId}`,
    method: "get",
  });
}
