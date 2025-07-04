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
          <!-- <el-input v-model="queryParams.teacher" placeholder="请输入讲师名称" clearable /> -->
          <el-select v-model="queryParams.teacher" placeholder="请输入讲师名称" style="width: 240px">
            <el-option v-for="item in staffList" :key="item.id" :label="item.staffName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
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
        </el-row>
      </template>

      <el-table v-loading="loading" :data="topicList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="专题名称" align="center" prop="name" />
        <el-table-column label="分类名称" align="center" prop="categoryName" />
        <el-table-column label="讲师" align="center" prop="teacher" />
        <el-table-column label="Logo" align="center" prop="logoPath" />
        <el-table-column label="简介" align="center" prop="brief" />
        <el-table-column label="详情" align="center" prop="details" />
        <el-table-column label="成就展示" align="center" prop="achievementDisplay" />
        <el-table-column label="创建时间" align="center" prop="creationTime" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.creationTime) }}
          </template>
        </el-table-column>
        <el-table-column label="修改时间" align="center" prop="lastModificationTime" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.lastModificationTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="150">
          <template #default="scope">
            <el-button type="primary" link @click="handleUpdate(scope.row)">
              编辑
            </el-button>
            <el-button type="primary" link @click="handleDelete(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-if="total > 0" v-model:page="queryParams.pageIndex" v-model:limit="queryParams.pageSize"
        :total="total" @pagination="getList" />
    </el-card>

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
            <el-option v-for="item in staffList" :key="item.id" :label="item.staffName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="Logo路径" prop="logoPath">
          <el-input v-model="form.logoPath" placeholder="请输入Logo路径" />
        </el-form-item>
        <el-form-item v-model="form.brief" label="简介" prop="brief">
          <!-- <el-input  type="textarea" :rows="3" placeholder="请输入简介" /> -->
          <div style="border: 1px solid #ccc">
            <Toolbar style="border-bottom: 1px solid #ccc" :editor="editorRef" :default-config="toolbarConfig"
              :mode="mode" />
            <Editor v-model="valueHtml" style="height: 500px; overflow-y: hidden;" :default-config="editorConfig"
              :mode="mode" @on-created="handleCreated" />
            {{ valueHtml }}
          </div>
        </el-form-item>
        <el-form-item label="详情" prop="details">
          <el-input v-model="form.details" type="textarea" :rows="4" placeholder="请输入详情" />
        </el-form-item>
        <el-form-item label="成就展示" prop="achievementDisplay">
          <el-input v-model="form.achievementDisplay" type="textarea" :rows="3" placeholder="请输入成就展示" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  createTopic,
  getTopicList,
  updateTopic,
  getTopicDetail,
  batchDeleteTopic,
  getCategoryList,
  getstaffList
} from '@/api/Lession/TopicManager/TopicManager'
// 列表数据
const topicList = ref([])
const loading = ref(true)
const total = ref(0)
const title = ref('')
const open = ref(false)
const multiple = ref(true)
const selectedIdList = ref<string[]>([])
const categoryOptions = ref([])
const staffList = ref([])
const topicForm = ref()

// 查询参数
const queryParams = ref({
  name: '',
  categoryId: '',
  teacher: '',
  pageIndex: 1,
  pageSize: 10
})

// 表单参数
const form = ref({
  id: '',
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
  brief: [{ required: true, message: '简介不能为空', trigger: 'blur' }],
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
    total.value = response.totalCount
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
    const response = await getTopicDetail(row.id)
    form.value = response.data
    open.value = true
    title.value = '修改专题'
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
import '@wangeditor/editor/dist/css/style.css' // 引入 css  可以在main.js中引入
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
const editorRef = shallowRef()
const valueHtml = ref('<p>hello</p>')
const mode = 'default'
const toolbarConfig = {}
const editorConfig = { placeholder: '请输入内容...' }
// 模拟 ajax 异步获取内容
onMounted(() => {
  setTimeout(() => {
    valueHtml.value = '<p>模拟 Ajax 异步设置内容</p>'
  }, 1500)
})

onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})
const handleCreated = (editor) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}
</script>

<style scoped>
.search-wrapper {
  margin-bottom: 20px;
}

.mb8 {
  margin-bottom: 8px;
}
</style>
