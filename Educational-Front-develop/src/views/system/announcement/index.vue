// src/views/system/announcement/index.vue
<template>
  <div class="app-container">
    <el-card shadow="never" class="search-wrapper">
      <el-form :model="queryParams" ref="queryForm" :inline="true">
        <el-form-item label="标题" prop="title">
          <el-input v-model="queryParams.title" placeholder="请输入公告标题" clearable />
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
            <el-button type="primary" @click="handleAdd" v-hasPermi="['system:announcement:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" @click="handleBatchDelete" v-hasPermi="['system:announcement:delete']"
              :disabled="multiple">批量删除</el-button>
          </el-col>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="announcementList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="标题" align="center" prop="title" />
        <el-table-column label="添加时间" align="center" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.creationTime) }}
          </template>
        </el-table-column>
        <el-table-column label="修改时间" align="center" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.lastModificationTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="150">
          <template #default="scope">
            <el-button type="primary" link @click="handleUpdate(scope.row)" v-hasPermi="['system:announcement:edit']">
              编辑
            </el-button>
            <el-button type="primary" link @click="handleDelete(scope.row)" v-hasPermi="['system:announcement:delete']">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-if="total > 0" :total="total" v-model:page="queryParams.pageIndex"
        v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <!-- 添加或修改公告对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="announcementForm" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="公告标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入公告标题" />
        </el-form-item>
        <el-form-item label="公告内容" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="6" placeholder="请输入公告内容" />
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
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  createAnnouncement, 
  getAnnouncementList, 
  updateAnnouncement, 
  deleteAnnouncement,
  batchDeleteAnnouncement
} from '@/api/PositionManager/PositionManager'

// 列表数据
const announcementList = ref([])
const loading = ref(true)
const total = ref(0)
const title = ref('')
const open = ref(false)
const multiple = ref(true)
// 定义一个List<String>类型的变量，用于存储批量操作选中的ID
const selectedIdList = ref<string[]>([])

// 查询参数
const queryParams = ref({
  title: '',
  pageIndex: 1,
  pageSize: 20
})

// 表单参数
const form = ref({
  id: '',
  title: '',
  description: ''
})

// 表单校验
const rules = {
  title: [{ required: true, message: '公告标题不能为空', trigger: 'blur' }],
  description: [{ required: true, message: '公告内容不能为空', trigger: 'blur' }]
}

// 查询公告列表
const getList = () => {
  loading.value = true
  getAnnouncementList({
    Title: queryParams.value.title,
    PageIndex: queryParams.value.pageIndex,
    PageSize: queryParams.value.pageSize
  }).then(response => {
    announcementList.value = response.data
    total.value = response.data.totalCount
    loading.value = false
    console.log(announcementList.value)
  }).catch(error => {
    console.error('获取公告列表失败:', error)
    loading.value = false
  })
}

// 表单重置
const reset = () => {
  form.value = {
    id: '',
    title: '',
    description: ''
  }
}

// 多选框选中数据
const handleSelectionChange = (selection: any[]) => {
  // 将选中的ID传入selectedIdList变量
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
  queryParams.value.title = ''
  handleQuery()
}

// 新增按钮操作
const handleAdd = () => {
  reset()
  open.value = true
  title.value = '添加内部公告'
}

// 修改按钮操作
const handleUpdate = (row: any) => {
  reset()
  form.value = JSON.parse(JSON.stringify(row))
  open.value = true
  title.value = '修改内部公告'
}

// 提交按钮
const submitForm = () => {
  if (form.value.id) {
    updateAnnouncement(form.value.id, {
      title: form.value.title,
      description: form.value.description
    }).then(() => {
      ElMessage.success('修改成功')
      open.value = false
      getList()
    })
  } else {
    createAnnouncement({
      title: form.value.title,
      description: form.value.description
    }).then(() => {
      ElMessage.success('新增成功')
      open.value = false
      getList()
    })
  }
}

// 取消按钮
const cancel = () => {
  open.value = false
  reset()
}

// 删除按钮操作
const handleDelete = (row: any) => {
  ElMessageBox.confirm('确认删除该公告吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteAnnouncement(row.id).then(() => {
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
  
  ElMessageBox.confirm('确认批量删除所选公告吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    batchDeleteAnnouncement(selectedIdList.value).then(() => {
      ElMessage.success('批量删除成功')
      getList()
    }).catch(error => {
      console.error('批量删除失败:', error)
    })
  })
}

// 添加时间格式化函数
const formatDateTime = (dateTimeStr: string) => {
  if (!dateTimeStr) return '-'
  
  // 解析时间字符串
  const date = new Date(dateTimeStr)
  
  // 格式化为 年-月-日 时:分:秒
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

onMounted(() => {
  getList()
})
</script>