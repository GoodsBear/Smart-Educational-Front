import request from "@/utils/request";
//上传单张图片
export function UploadImage(data: any) {
  return request({
    url: "/api/upload/image",
    method: "post",
    data,
  });
}
//上传多张图片
export function UploadImages(formData: FormData) {
  return request<string[]>({
    url: "/api/upload/images",
    method: "post",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    responseType: "text", // 后端返回text/plain
    transformResponse: [(data) => {
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    }],
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
