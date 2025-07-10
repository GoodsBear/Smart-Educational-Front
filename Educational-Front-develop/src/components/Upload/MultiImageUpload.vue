<template>
  <el-upload ref="uploadRef" v-model:file-list="fileList" :auto-upload="true" list-type="picture-card" multiple
    accept="image/*" :on-remove="handleRemove" :on-preview="handlePreview" :on-change="handleChange" :limit="limit">
    <el-icon>
      <Plus />
    </el-icon>
  </el-upload>
  <el-dialog v-model="previewVisible" width="400px">
    <img :src="previewUrl" alt="预览" style="width: 100%" />
  </el-dialog>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { UploadImg } from '@/api/uoload/uoload.api'

const props = defineProps({
  modelValue: { type: [Array, String], default: () => '' },
  limit: { type: Number, default: 10 }
})
const emit = defineEmits(['update:modelValue'])

const fileList = ref([])

// 工具函数：将modelValue转为数组
function getUrlArray(val) {
  if (!val) return []
  if (Array.isArray(val)) return val
  if (typeof val === 'string') return val.split(',').filter(Boolean)
  return []
}

// 回显
watch(
  () => props.modelValue,
  (val) => {
    const arr = getUrlArray(val)
    if (!arr.length) {
      fileList.value = []
    } else if (arr.length && fileList.value.length === 0) {
      fileList.value = arr.map(url => ({
        name: url.split(',').pop(),
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
  emit('update:modelValue', urls.join(','))
}

// 自动上传并校验格式
const uploadRef = ref()
async function handleChange(file, fileList_) {
  // 统计本次选择的文件
  let successCount = 0
  let invalidCount = 0
  const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
  // 只处理本次新添加的文件
  const newFiles = fileList_.filter(f => f.status === 'ready' && !f.url)
  for (const f of newFiles) {
    const fileName = f.name ? f.name.toLowerCase() : ''
    const valid = allowedExts.some(ext => fileName.endsWith(ext))
    if (!valid) {
      invalidCount++
      const idx = fileList_.findIndex(ff => ff.uid === f.uid)
      if (idx !== -1) fileList_.splice(idx, 1)
      continue
    }
    if (f.raw && !f.url) {
      const formData = new FormData()
      formData.append('file', f.raw)
      try {
        const url = await UploadImg(formData)
        if (typeof url === 'string' && url) {
          f.url = url
          successCount++
          const urls = fileList_.filter(ff => ff.url).map(ff => ff.url)
          emit('update:modelValue', urls.join(','))
        } else {
          ElMessage.error('图片上传失败')
        }
      } catch (e) {
        ElMessage.error('图片上传失败')
      }
    }
  }
  if (successCount > 0 || invalidCount > 0) {
    ElMessage.success(`成功上传${successCount}张，格式不支持${invalidCount}张`)
  }
}
</script>