<!-- 科目管理主页面 -->
<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- 查询 -->
      <el-card class="box-card">
        <div class="filter-item">
          <el-input v-model="queryParams.SubjectName" placeholder="请输入科目名称" style="width: 200px" class="filter-item"
            @keyup.enter="handleQuery" />
          <el-button type="primary" class="filter-item" @click="handleQuery, queryParams.PageIndex = 1">
            搜索
          </el-button>
          <el-button type="success" class="filter-item" @click="handleAdd">
            新增
          </el-button>
          <el-button type="danger" :disabled="multiple" @click="handleBatchDelete">
            批量删除
          </el-button>
        </div>
      </el-card>
    </div>
    <!-- 显示 -->
    <el-card class="box-card">
      <el-table v-loading="loading" :data="subjectList" style="width: 100%" border
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="科目名称" prop="subjectName" />
        <el-table-column label="权重" prop="sortWeight" />
        <el-table-column label="科目描述" prop="subjectDescription" />
        <el-table-column label="创建时间" prop="creationTime" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.creationTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <el-button type="primary" link @click="handleEdit(scope.row)">
              编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination v-model:current-page="queryParams.PageIndex" v-model:page-size="queryParams.PageSize"
          :total="total" :page-sizes="[10, 20, 30, 50]" layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </el-card>
    <!-- 添加或修改专题对话框 -->
    <el-dialog v-model="open" :title="title" width="600px" destroy-on-close :close-on-click-modal="false">
      <el-form ref="topicForm" :model="form" :rules="rules" label-width="100px" status-icon>
        <el-form-item label="科目名称" prop="subjectName">
          <el-input v-model="form.subjectName" placeholder="请输入科目名称" />
        </el-form-item>
        <el-form-item label="排序权重" prop="sortWeight">
          <el-input v-model="form.sortWeight" placeholder="请输入排序权重" />
        </el-form-item>
        <el-form-item label="科目说明" prop="subjectDescription">
          <el-input v-model="form.subjectDescription" type="textarea" placeholder="请输入科目说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">提交</el-button>
          <el-button @click="open = false, reset()">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  getSubjectList, getSubjectById, updateSubject, addSubject, deleteSubjects,
} from '@/api/Lession/SubjectManager/Subject'
defineOptions({
  name: 'SubjectManagement'
})
//add+update
const topicForm = ref()
//对话框标题
const title = ref("");
const open = ref(false);
// 加载状态
const loading = ref(false)
// 科目列表数据
const subjectList = ref([])
// 总记录数
const total = ref(0)
// 查询参数
const queryParams = ref({
  SubjectName: "",
  PageIndex: 1,
  PageSize: 10
})
//批量删除ids
const selectedIdList = ref<string[]>([])
const multiple = ref(true)
// 表单参数
const form = ref({
  id: "",
  subjectName: '',
  sortWeight: 0,
  subjectDescription: ''
})
//生命钩子
onMounted(() => {
  console.log('组件已挂载')
  handleQuery()
})
// 查询方法 
const handleQuery = () => {
  loading.value = true
  getSubjectList({
    SubjectName: queryParams.value.SubjectName,
    PageIndex: queryParams.value.PageIndex,
    PageSize: queryParams.value.PageSize
  }).then(response => {
    console.log('获取专题列表失败:', response)
    debugger;
    subjectList.value = response.data || []
    total.value = response.totleCount
    loading.value = false
  }).catch(error => {
    console.error('获取专题列表失败:', error)
    loading.value = false
  })
}

// 新增方法
const handleAdd = () => {
  reset();
  title.value = "新增科目信息";
  open.value = true;
  // TODO: 实现新增逻辑
}
// 编辑方法
const handleEdit = (row: any) => {
  try {
    reset()
    title.value = "修改科目信息";
    open.value = true;
    getSubjectById(row.id)
    form.value = row;
  } catch (error: any) {
    console.error('获取详情失败:', error.response?.data)
    ElMessage.error(error.response?.data?.error?.message || '获取详情失败')
  }

  // TODO: 实现编辑逻辑
}
// 删除方法
const handleDelete = (row: any) => {
  // TODO: 实现删除逻辑
}
// 处理每页显示数量变化
const handleSizeChange = (val: number) => {
  queryParams.value.PageSize = val
  handleQuery()
}

// 处理页码变化
const handleCurrentChange = (val: number) => {
  queryParams.value.PageIndex = val
  handleQuery()
}
// 表单重置
const reset = () => {
  console.log('重置表单')
  form.value = {
    subjectName: '',
    sortWeight: 0,
    subjectDescription: ''
  }
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
// 表单校验
const rules = {
  subjectName: [{ required: true, message: '科目名称不能为空', trigger: 'blur' }],
  sortWeight: [{ required: true, message: '排序权重不能为空', trigger: 'blur' }],
  subjectDescription: [{ required: true, message: '科目说明不能为空', trigger: 'blur' }]
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
        await updateSubject(form.value.id, {
          subjectName: form.value.subjectName,
          sortWeight: form.value.sortWeight,
          subjectDescription: form.value.subjectDescription
        })
        ElMessage.success('修改成功')
        open.value = false
        reset()
        handleQuery()
      } catch (error: any) {
        console.error('修改失败:', error.response?.data)
        ElMessage.error(error.response?.data?.error?.message || '修改失败')
      }
    } else {
      // 新增
      try {
        await addSubject({
          subjectName: form.value.subjectName,
          sortWeight: form.value.sortWeight,
          subjectDescription: form.value.subjectDescription
        })
        ElMessage.success('新增成功')
        open.value = false
        handleQuery()
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

// 多选框选中数据
const handleSelectionChange = (selection: any[]) => {
  selectedIdList.value = selection.map(item => item.id)
  multiple.value = !selection.length
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
    deleteSubjects(selectedIdList.value).then(() => {
      ElMessage.success('批量删除成功')
      handleQuery()
    })
  })
}
//
</script>

<style scoped>
.filter-container {
  margin-bottom: 20px;
}

.filter-item {
  display: inline-block;
  margin-right: 10px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}
</style>
