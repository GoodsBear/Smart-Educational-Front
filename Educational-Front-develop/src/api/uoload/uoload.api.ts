import request from "@/utils/request";
//上传单张图片
export function UploadImage(data: any) {
  return request({
    url: "/api/upload/image",
    method: "post",
    data,
  });
}
/**
 * @description 批量上传图片到 wwwwroot/Uploads/images/yyyyMMdd 目录
 * @param {FormData} formData 需包含字段 files（多文件）
 * @returns Promise<string> 图片上传后的路径字符串
 */
export function uploadImages(formData: FormData) {
  return request<string>({
    url: '/api/upload/images',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    responseType: 'text',
    transformResponse: [(data) => data], // 保持原始字符串
  });
}
// 单图片上传，返回图片URL字符串
export function UploadImg(formData: FormData) {
  return request<string>({
    url: "/api/upload/image",
    method: "post",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    responseType: "text",
    transformResponse: [(data) => data], // 防止被JSON.parse
  });
}
