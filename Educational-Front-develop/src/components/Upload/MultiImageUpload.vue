<template>
  <el-upload ref="uploadRef" v-model:file-list="fileList" :auto-upload="false" list-type="picture-card" multiple
    accept="image/*" :on-remove="handleRemove" :on-preview="handlePreview" :limit="limit">
    <el-icon>
      <Plus />
    </el-icon>
  </el-upload>
  <el-button type="primary" @click="submitUpload" :disabled="fileList.length === 0">上传</el-button>
  <el-dialog v-model="previewVisible" width="400px">
    <img :src="previewUrl" alt="预览" style="width: 100%" />
  </el-dialog>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { UploadImages } from '@/api/uoload/uoload.api'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  limit: { type: Number, default: 10 }
})
const emit = defineEmits(['update:modelValue'])

const fileList = ref([])

// 回显
watch(
  () => props.modelValue,
  (val) => {
    if (val && val.length && fileList.value.length === 0) {
      fileList.value = val.map(url => ({
        name: url.split('/').pop(),
        url
      }))
    }
  },
  { immediate: true }
)

// 预览
const previewVisible = ref(false)
const previewUrl = ref('')
function handlePreview(file) {
  previewUrl.value = file.url
  previewVisible.value = true
}

// 移除
function handleRemove(file, _fileList) {
  const urls = _fileList.filter(f => f.url).map(f => f.url)
  emit('update:modelValue', urls)
}

// 手动上传
const uploadRef = ref()
async function submitUpload() {
  const formData = new FormData()
  // 只上传未上传的文件
  fileList.value.forEach(file => {
    if (file.raw) {
      formData.append('files', file.raw)
    }
  })
  try {
    const urls = await UploadImages(formData)
    // 合并到 v-model
    const allUrls = [
      ...props.modelValue,
      ...urls.filter(url => !props.modelValue.includes(url))
    ]
    emit('update:modelValue', allUrls)
    // 更新 fileList 预览
    let i = 0
    fileList.value.forEach(file => {
      if (!file.url && urls[i]) {
        file.url = urls[i]
        i++
      }
    })
    ElMessage.success('上传成功')
  } catch (e) {
    ElMessage.error('上传失败')
  }
}
</script>