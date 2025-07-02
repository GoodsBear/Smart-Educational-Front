import request from "@/utils/request";

export function UploadImage(data: any) {
  return request({
    url: "/api/upload/image",
    method: "post",
    data,
  });
}
