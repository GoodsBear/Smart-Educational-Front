<!-- 专题管理页面 -->
<template>
  <div class="app-container">
    <el-card shadow="never" class="search-wrapper">
      <el-form ref="queryForm" :model="queryParams" :inline="true">
        <el-form-item label="专题名称" prop="name">
          <el-input v-model="queryParams.name" placeholder="请输入专题名称" clearable />
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <!-- <el-input v-model="queryParams.categoryId" placeholder="请输入分类ID" clearable /> -->
          <el-select v-model="queryParams.categoryId" placeholder="专题级别" style="width: 240px">
            <el-option v-for="item in categoryOptions" :key="item.id" :label="item.categoryName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="讲师" prop="teacher">
          <!-- <el-input v-model="queryParams.teacher" placeholder="请输入讲师名称" clearable style="width: 240px;"
            @click="ShowTopicB == true" /> -->
          <el-select v-model="queryParams.teacher" placeholder="请输入讲师名称" style="width: 240px">
            <el-option v-for="item in staffList" :key="item.id" :label="item.staffName" :value="item.staffName" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      <!-- {{ Name }} 
      <TopicB v-model:Name="Name"></TopicB>
      <div :class="ShowTopicB">
        <TopicB v-model:Name="Name"></TopicB>
      </div>-->
    </el-card>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" :disabled="multiple" @click="handleBatchDelete">批量删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button @click="getList()">刷新</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button @click="showColumnDialog = true" type="primary">自定义显示列</el-button>
          </el-col>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="topicList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column v-for="col in showColumns" :key="col.prop" :prop="col.prop" :label="col.label"
          :width="col.width" :align="col.align">
          <template v-if="col.prop === 'logoPath'" #default="scope">
            <img :src="scope.row.logoPath" class="avatar" style="width: 80px; height: 80px;" />
          </template>
          <template v-else-if="col.prop === 'brief' || col.prop === 'details' || col.prop === 'achievementDisplay'"
            #default="scope">
            <div v-html="scope.row[col.prop]"></div>
          </template>
          <template v-else-if="col.prop === 'creationTime' || col.prop === 'lastModificationTime'" #default="scope">
            {{ moment(scope.row[col.prop]).format("YYYY-MM-DD HH:mm:ss") }}
          </template>
          <template v-else #default="scope">
            {{ scope.row[col.prop] }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="150">
          <template #default="scope">
            <el-button type="primary" link @click="handleUpdate(scope.row)">编辑</el-button>
            <el-button type="primary" link @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-if="total > 0" v-model:page="queryParams.pageIndex" v-model:limit="queryParams.pageSize"
        :total="total" @pagination="getList" />
    </el-card>
    <!-- 下拉组件 -->
    <!-- <el-dialog v-model="ShowTopicB" :title="title" width="600px" destroy-on-close :close-on-click-modal="false">
      <TopicB v-model:Name="Name"></TopicB>
    </el-dialog> -->
    <!-- 添加或修改专题对话框 -->
    <el-dialog v-model="open" :title="title" width="600px" destroy-on-close :close-on-click-modal="false">
      <el-form ref="topicForm" :model="form" :rules="rules" label-width="100px" status-icon>
        <el-form-item label="专题名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入专题名称" />
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <!-- <el-input v-model="form.categoryId" placeholder="请输入分类ID" /> -->
          <el-select v-model="form.categoryId" placeholder="请输入分类ID" style="width: 240px">
            <el-option v-for="item in categoryOptions" :key="item.id" :label="item.categoryName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="讲师" prop="teacher">
          <!-- <el-input v-model="form.teacher" placeholder="请输入讲师名称" /> -->
          <el-select v-model="form.teacher" placeholder="请输入讲师名称" style="width: 240px">
            <el-option v-for="item in staffList" :key="item.id" :label="item.staffName" :value="item.staffName" />
          </el-select>
        </el-form-item>
        <el-form-item label="Logo路径" prop="logoPath">
          <el-upload class="avatar-uploader custom-avatar-uploader" action="https://localhost:44375/api/upload/image"
            :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
            <img v-if="form.logoPath" :src="form.logoPath" class="avatar custom-avatar-img" />
            <el-icon v-else class="avatar-uploader-icon custom-avatar-icon">
              <Plus />
            </el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item v-model="form.brief" label="简介" prop="brief">
          <!-- <el-input  type="textarea" :rows="3" placeholder="请输入简介" /> -->
          <div style="border: 1px solid #ccc">
            <Editor v-model="form.brief" :api-key="apiKey" :init="TinyMCE_option" />
          </div>
        </el-form-item>
        <el-form-item label="详情" prop="details">
          <div style="border: 1px solid #ccc">
            <Editor v-model="form.details" :api-key="apiKey" :init="TinyMCE_option" />
            <!-- <Editor v-model="form.brief" :api-key="apiKey" :init="TinyMCE_option" initial-value="Welcome to TinyMCE!" /> -->
          </div>
          <!-- <el-input v-model="form.details" type="textarea" :rows="4" placeholder="请输入详情" /> -->
        </el-form-item>

        <el-form-item label="成就展示" prop="achievementDisplay">
          <div style="border: 1px solid #ccc">
            <Editor v-model="form.achievementDisplay" :api-key="apiKey" :init="TinyMCE_option" />
            <!-- <Editor v-model="form.brief" :api-key="apiKey" :init="TinyMCE_option" initial-value="Welcome to TinyMCE!" /> -->
          </div>
          <!-- <el-input v-model="form.achievementDisplay" type="textarea" :rows="3" placeholder="请输入成就展示" /> -->
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 自定义显示列弹窗 -->
    <el-dialog v-model="showColumnDialog" title="自定义显示列" width="400px">
      <el-checkbox-group v-model="checkedProps">
        <el-checkbox v-for="col in allColumns" :key="col.prop" :label="col.prop">
          {{ col.label }}
        </el-checkbox>
      </el-checkbox-group>
      <template #footer>
        <el-button @click="resetColumns">恢复默认</el-button>
        <el-button type="primary" @click="showColumnDialog = false">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import moment from 'moment'
import {
  createTopic,
  getTopicList,
  updateTopic,
  getTopicDetail,
  batchDeleteTopic,
  getCategoryList,
  getstaffList
} from '@/api/Lession/TopicManager/TopicManager'
import type { UploadProps } from 'element-plus'
import { Picture, Plus } from '@element-plus/icons-vue'
import { UploadImage } from '@/api/uoload/uoload.api'

// import WangEditor from '@/components/WangEditor/index.vue'
// 列表数据
const topicList = ref([])
const loading = ref(true)
const total = ref(0)
const title = ref('')
const open = ref(false)
const multiple = ref(true)
const selectedIdList = ref<string[]>([])
const categoryOptions = ref([{
  id: "",
  categoryName: ""
}])
const staffList = ref([
  {
    id: "",
    staffName: ""
  }
])
const topicForm = ref()
const Name = ref<string>("");
watch(Name, (newVal, oldVal) => {
  console.log('Name 变化:', newVal, oldVal);
  queryParams.value.teacher = newVal;
  // 执行自定义逻辑（如调用 API、更新其他状态等）
});
const logoImageUrl = ref('')

// 查询参数
// 查询参数queryParams
const queryParams = ref({
  name: '',
  categoryId: '',
  teacher: '',
  pageIndex: 1,
  pageSize: 10
})
//控制下拉讲师的
const ShowTopicB = ref(false);

// Logo上传相关方法
const handleLogoSuccess = (res: any) => {
  console.log('上传成功:', res)
  // 根据API响应结构获取图片路径
  form.value.logoPath = res.data || res
  logoImageUrl.value = form.value.logoPath
}

const beforeLogoUpload = (file: File) => {
  const isImage = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type)
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('上传Logo只能是图片格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('上传Logo图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 使用封装的UploadImage方法进行上传
const customUpload = async (options: any) => {
  const { file } = options
  // 创建FormData对象
  const formData = new FormData()
  formData.append('file', file)

  // 调用封装的UploadImage方法
  try {
    const result = await UploadImage(formData)
    // 直接调用成功回调，不做额外判断
    options.onSuccess(result)
  } catch (error) {
    console.error('上传失败:', error)
    options.onError('上传失败')
  }
}

// 表单参数
const form = ref({
  id: "",
  name: '',
  categoryId: '',
  teacher: '',
  logoPath: '',
  brief: '',
  details: '',
  achievementDisplay: '',
  concurrencyStamp: ''
})

// 表单校验
const rules = {
  name: [{ required: true, message: '专题名称不能为空', trigger: 'blur' }],
  categoryId: [{ required: true, message: '分类不能为空', trigger: 'blur' }],
  teacher: [{ required: true, message: '讲师不能为空', trigger: 'blur' }],
  // brief: [{ required: true, message: '简介不能为空', trigger: 'blur' }],
  details: [{ required: true, message: '详情不能为空', trigger: 'blur' }]
}

// 获取分类列表
const loadCategories = async () => {
  try {
    const response = await getCategoryList()
    categoryOptions.value = response || []
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

// 获取教职员工下拉列表
const loadstaff = async () => {
  try {
    const response = await getstaffList()
    staffList.value = response || []
  } catch (error) {
    console.error('获取教职员工下拉列表失败:', error)
  }
}
//getTopicDetail详情反填
const TopicDetail = async (id: any) => {
  try {
    const response = await getTopicDetail(id)
    form.value = response || []
  } catch (error) {
    console.error('获取教职员工下拉列表失败:', error)
  }
}

watch(categoryOptions, (val) => {
  console.log('categoryOptions:', val)
})
// 查询专题列表
const getList = () => {
  loading.value = true
  getTopicList({
    Name: queryParams.value.name,
    CategoryId: queryParams.value.categoryId,
    Teacher: queryParams.value.teacher,
    PageIndex: queryParams.value.pageIndex,
    PageSize: queryParams.value.pageSize
  }).then(response => {
    topicList.value = response.data || []
    total.value = response.totleCount
    loading.value = false
  }).catch(error => {
    console.error('获取专题列表失败:', error)
    loading.value = false
  })
}

// 表单重置
const reset = () => {
  console.log('重置表单')
  form.value = {
    id: '',
    name: '',
    categoryId: '',
    teacher: '',
    logoPath: '',
    brief: '',
    details: '',
    achievementDisplay: '',
    concurrencyStamp: ''
  }
  // 清空logo预览
  logoImageUrl.value = ''
}

// 多选框选中数据
const handleSelectionChange = (selection: any[]) => {
  selectedIdList.value = selection.map(item => item.id)
  multiple.value = !selection.length
}

// 搜索按钮操作
const handleQuery = () => {
  queryParams.value.pageIndex = 1
  getList()
}

// 重置按钮操作
const resetQuery = () => {
  queryParams.value.name = ''
  queryParams.value.categoryId = ''
  queryParams.value.teacher = ''
  handleQuery()
}

// 新增按钮操作
const handleAdd = () => {
  console.log('点击新增按钮')
  reset()
  open.value = true
  console.log('对话框状态设置为:', open.value)
  title.value = '添加专题'
}

// 修改按钮操作

const handleUpdate = async (row: any) => {
  try {
    reset()
    // const response = await getTopicDetail(row.id)
    //Object.assign(form.value, response.data) // 保持响应式
    //form.value = response.data
    // const response = await getTopicDetail(row.id)
    // form.value = response.data
    // // 设置logo预览
    // logoImageUrl.value = form.value.logoPath
    open.value = true
    title.value = '修改专题'
    TopicDetail(row.id)
    form.value = row;
  } catch (error: any) {
    console.error('获取详情失败:', error.response?.data)
    ElMessage.error(error.response?.data?.error?.message || '获取详情失败')
  }
}
// 提交按钮
const submitForm = async () => {
  const formEl = topicForm.value
  if (!formEl) return

  try {
    await formEl.validate()

    if (form.value.id) {
      // 修改
      try {
        await updateTopic(form.value.id, {
          id: form.value.id,
          name: form.value.name,
          categoryId: form.value.categoryId,
          teacher: form.value.teacher,
          logoPath: form.value.logoPath,
          brief: form.value.brief,
          details: form.value.details,
          achievementDisplay: form.value.achievementDisplay,
          concurrencyStamp: form.value.concurrencyStamp
        })
        ElMessage.success('修改成功')
        open.value = false
        getList()
      } catch (error: any) {
        console.error('修改失败:', error.response?.data)
        ElMessage.error(error.response?.data?.error?.message || '修改失败')
      }
    } else {
      // 新增
      try {
        await createTopic({
          name: form.value.name,
          categoryId: form.value.categoryId,
          teacher: form.value.teacher,
          logoPath: form.value.logoPath,
          brief: form.value.brief,
          details: form.value.details,
          achievementDisplay: form.value.achievementDisplay
        })
        ElMessage.success('新增成功')
        open.value = false
        getList()
      } catch (error: any) {
        console.error('新增失败:', error.response?.data)
        ElMessage.error(error.response?.data?.error?.message || '新增失败')
      }
    }
  } catch (error) {
    console.error('表单验证失败:', error)
    ElMessage.warning('请填写必填项')
    return false
  }
}

// 取消按钮
const cancel = () => {
  console.log('点击取消按钮')
  open.value = false
  reset()
}

// 删除按钮操作
const handleDelete = (row: any) => {
  ElMessageBox.confirm('确认删除该专题吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    batchDeleteTopic([row.id]).then(() => {
      ElMessage.success('删除成功')
      getList()
    })
  })
}

// 批量删除操作
const handleBatchDelete = () => {
  if (selectedIdList.value.length === 0) {
    ElMessage.warning('请选择要删除的数据')
    return
  }
  ElMessageBox.confirm('确认批量删除所选专题吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    batchDeleteTopic(selectedIdList.value).then(() => {
      ElMessage.success('批量删除成功')
      getList()
    })
  })
}


// 时间格式化
const formatDateTime = (dateTimeStr: string) => {
  if (!dateTimeStr) return '-'

  const date = new Date(dateTimeStr)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 监听对话框状态
watch(() => open.value, (newVal) => {
  console.log('对话框状态变化:', newVal)
})

onMounted(() => {
  console.log('组件已挂载')
  loadCategories()
  loadstaff()
  getList()
})


// 图片上传相关
const imageUrl = ref("");

const handleAvatarSuccess: UploadProps["onSuccess"] = (response, uploadFile) => {
  console.log("图片", response);
  // debugger;
  imageUrl.value = URL.createObjectURL(uploadFile.raw!);
  form.value.logoPath = response;//.data.fileUrl;
  // from.value.logoPath = imageUrl.value;
};

const beforeAvatarUpload: UploadProps["beforeUpload"] = (rawFile) => {
  /*
  if (rawFile.type !== "image/jpeg/gif/png") {
    ElMessage.error("Avatar picture must be JPG format!");
    return false;
  } else
   */ if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error("Avatar picture size can not exceed 2MB!");
    return false;
  }
  return true;
};
//富文本

import Editor from '@tinymce/tinymce-vue'
import { reactive } from 'vue';
// import TopicB from './topicB.vue'

const apiKey = 'c84dxh4zz5sav5fvpfj8ats9tqewf49axrzcpc6ftqzhep17' // 替换为你的 API 密钥

const TinyMCE_option = reactive({
  // 插件
  plugins: [
    'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
    'checklist', 'mediaembed', 'casechange', 'export', 'formatpainter', 'pageembed', 'permanentpen', 'powerpaste', 'advtable', 'advcode', 'editimage', 'advtemplate', 'mentions', 'tinycomments', 'tableofcontents', 'footnotes', 'mergetags', 'autocorrect', 'inlinecss', 'markdown', 'importword', 'exportword', 'exportpdf'
  ],
  // 是否显示底部工具栏 默认为 true
  statusbar: false,
  // 工具栏
  toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat | selectiveDateButton',
  // 使用者
  tinycomments_mode: 'embedded',
  tinycomments_author: '张三',
  // 语言
  language: 'zh_CN',
  // 自定义功能键
  setup: (editor: any) => {
    const toDateHtml = (date: any) => `<time datetime="${date.toString()}">${date.toDateString()}</time>`;
    editor.ui.registry.addButton('selectiveDateButton', {
      icon: 'insert-time',
      tooltip: '插入当前时间',
      onAction: () => editor.insertContent(toDateHtml(new Date()))
    });
    // 内容存入v-model前的处理
    editor.on('SaveContent', (e: any) => {
      // 示例：移除所有script标签，防止XSS攻击
      e.content = e.content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      // 示例：将所有段落的class添加统一前缀
      e.content = e.content.replace(/<p([^>]*)>/g, '<p class="custom-paragraph $1">');
    });
  }
})

// 自定义显示列相关
const showColumnDialog = ref(false)
const allColumns = ref([
  { label: 'Logo', prop: 'logoPath', width: 250, align: 'center' },
  { label: '专题名称', prop: 'name', align: 'center' },
  { label: '分类名称', prop: 'categoryName', align: 'center' },
  { label: '讲师', prop: 'teacher', align: 'center' },
  { label: '简介', prop: 'brief', align: 'center' },
  { label: '详情', prop: 'details', align: 'center' },
  { label: '成就展示', prop: 'achievementDisplay', align: 'center' },
  { label: '创建时间', prop: 'creationTime', width: 180, align: 'center' },
  { label: '修改时间', prop: 'lastModificationTime', width: 180, align: 'center' }
])
const checkedProps = ref(allColumns.value.map(col => col.prop))
const resetColumns = () => {
  checkedProps.value = allColumns.value.map(col => col.prop)
}
const showColumns = computed(() =>
  allColumns.value.filter(col => checkedProps.value.includes(col.prop))
)

</script>

<style scoped>
.search-wrapper {
  margin-bottom: 20px;
}

.mb8 {
  margin-bottom: 8px;
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 12px;
}

.image-error .el-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

/* Logo上传样式 */
.logo-uploader {
  width: 150px;
  height: 150px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
}

.logo-uploader:hover {
  border-color: #409eff;
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.logo-uploader-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #8c939d;
}

.logo-uploader-placeholder .el-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.logo-path {
  margin-top: 8px;
  font-size: 12px;
  color: #606266;
}

.custom-avatar-uploader {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
}

.custom-avatar-img {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  border: 2px solid #e4e7ed;
  object-fit: cover;
  transition: box-shadow 0.2s, border-color 0.2s;
}

.custom-avatar-img:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
  border-color: #409eff;
}

.custom-avatar-icon {
  font-size: 32px;
  color: #c0c4cc;
  border: 2px dashed #e4e7ed;
  border-radius: 8px;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s;
}

.custom-avatar-icon:hover {
  border-color: #409eff;
  color: #409eff;
}
</style>
