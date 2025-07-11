<template>
  <el-upload class="single-upload" list-type="picture-card" :show-file-list="false" :accept="accept"
    :before-upload="handleBeforeUpload" :http-request="handleUpload" :on-success="onSuccess" :on-error="onError">
    <template #default>
      <el-image v-if="modelValue" :src="modelValue" fit="cover" :style="{ width: style.width, height: style.height }"
        preview-teleported :preview-src-list="[modelValue]" />
      <el-icon v-if="modelValue" class="single-upload__delete-btn" @click.stop="handleDelete" title="删除">
        <CircleCloseFilled />
      </el-icon>
      <el-icon v-else class="single-upload__add-btn">
        <Plus />
      </el-icon>
    </template>
  </el-upload>
</template>

<script setup lang="ts">
import { UploadRawFile, UploadRequestOptions, ElMessage, ElMessageBox } from "element-plus";
import { UploadImg } from "@/api/uoload/uoload.api";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  accept: {
    type: String,
    default: "image/*",
  },
  maxFileSize: {
    type: Number,
    default: 10, // MB
  },
  style: {
    type: Object,
    default: () => ({
      width: "150px",
      height: "150px",
    }),
  },
});

const emit = defineEmits(["update:modelValue"]);

/** 上传前校验 */
function handleBeforeUpload(file: UploadRawFile) {
  // 校验类型
  const acceptTypes = props.accept.split(",").map((type) => type.trim());
  const isValidType = acceptTypes.some((type) => {
    if (type === "image/*") return file.type.startsWith("image/");
    if (type.startsWith(".")) return file.name.toLowerCase().endsWith(type);
    return file.type === type;
  });
  if (!isValidType) {
    ElMessage.warning(`仅支持：${props.accept}`);
    return false;
  }
  // 校验大小
  if (file.size > props.maxFileSize * 1024 * 1024) {
    ElMessage.warning(`图片不能大于${props.maxFileSize}M`);
    return false;
  }
  return true;
}

/** 上传图片 */
function handleUpload(options: UploadRequestOptions) {
  return new Promise((resolve, reject) => {
    const file = options.file;
    const formData = new FormData();
    formData.append("file", file); // 参数名必须是file
    UploadImg(formData)
      .then((url: string) => {
        options.onSuccess?.(url);
        resolve(url);
      })
      .catch((error) => {
        options.onError?.(error);
        reject(error);
      });
  });
}

/** 删除图片（带确认） */
function handleDelete() {
  ElMessageBox.confirm("确定要删除这张图片吗？", "提示", {
    type: "warning",
    confirmButtonText: "删除",
    cancelButtonText: "取消",
  })
    .then(() => {
      emit("update:modelValue", "");
    })
    .catch(() => { });
}

/** 上传成功回调 */
function onSuccess(url: string) {
  ElMessage.success("上传成功");
  emit("update:modelValue", url);
}

/** 上传失败回调 */
function onError(error: any) {
  ElMessage.error("上传失败: " + (error?.message || error));
}
</script>

<style scoped lang="scss">
:deep(.el-upload--picture-card) {
  width: v-bind("style.width");
  height: v-bind("style.height");
}

.single-upload {
  position: relative;
  width: v-bind("style.width");
  height: v-bind("style.height");
  overflow: hidden;
  cursor: pointer;
  border: 1px var(--el-border-color) solid;
  border-radius: 5px;

  &:hover {
    border-color: var(--el-color-primary);
  }

  &__delete-btn {
    position: absolute;
    top: 1px;
    right: 1px;
    font-size: 16px;
    color: #ff7901;
    cursor: pointer;
    background: #fff;
    border-radius: 100%;

    :hover {
      color: #ff4500;
    }
  }
}
</style>