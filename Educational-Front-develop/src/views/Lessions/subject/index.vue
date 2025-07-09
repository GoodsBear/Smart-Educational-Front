<!-- 科目管理主页面 -->
<template>
  <div class="subject-management">
    <!-- 搜索栏 -->
    <el-card style="max-width: 10000px">
      <div class="search-bar">
        <el-form :inline="true" :model="queryParams">
          <el-form-item label="搜索名称：">
            <el-input v-model="queryParams.SubjectName" placeholder="请输入" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">查询</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <el-card style="max-width: 10000px; margin-top: 10px">
      <!-- 表格标题和操作按钮区 -->
      <div class="table-header-bar">
        <div class="table-title">科目列表</div>
        <div class="operation-area">
          <el-button type="primary" @click="handleAdd">新增</el-button>
          <el-button :disabled="multiple" @click="handleBatchDelete" type="danger">删除</el-button>
          <el-button @click="handleQuery" type="success">刷新</el-button>
          <el-button @click="showColumnDialog = true" type="primary">自定义显示列</el-button>
        </div>
      </div>
      <!-- 科目列表表格 -->
      <el-table ref="tableRef" v-loading="loading" :data="subjectList" style="width: 100%; margin-top: 10px"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column v-for="col in showColumns" :key="col.prop" :prop="col.prop" :label="col.label">
          <template v-if="col.prop === 'creationTime'" #default="scope">
            {{ formatDateTime(scope.row.creationTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
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

    <!-- 添加或修改科目对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" destroy-on-close :close-on-click-modal="false"
      @closed="resetForm">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" status-icon>
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
          <el-button @click="dialogVisible = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 自定义显示列对话框 -->
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
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  getSubjectList, getSubjectById, updateSubject, addSubject, deleteSubjects,
} from '@/api/Lession/SubjectManager/Subject'

defineOptions({
  name: 'SubjectManagement'
})

// 响应式数据
const loading = ref(false)
const subjectList = ref([])
const total = ref(0)
const queryParams = reactive({
  SubjectName: "",
  PageIndex: 1,
  PageSize: 10
})
const selectedIdList = ref<string[]>([])
const multiple = ref(true)
const dialogVisible = ref(false)
const dialogTitle = ref("")
const formRef = ref<FormInstance>()
const isAdd = ref(true)
const form = reactive({
  id: "",
  subjectName: '',
  sortWeight: 0,
  subjectDescription: ''
})

// 自定义列相关
const allColumns = ref([
  { prop: 'subjectName', label: '科目名称' },
  { prop: 'sortWeight', label: '权重' },
  { prop: 'subjectDescription', label: '科目描述' },
  { prop: 'creationTime', label: '创建时间' }
])
const checkedProps = ref(allColumns.value.map(col => col.prop))
const showColumnDialog = ref(false)

const showColumns = computed(() => {
  return allColumns.value.filter(col => checkedProps.value.includes(col.prop))
})

// 生命周期钩子
onMounted(() => {
  handleQuery()
})

// 查询方法
const handleQuery = () => {
  loading.value = true
  getSubjectList({
    SubjectName: queryParams.SubjectName,
    PageIndex: queryParams.PageIndex,
    PageSize: queryParams.PageSize
  }).then(response => {
    subjectList.value = response.data || []
    total.value = response.totleCount
    loading.value = false
  }).catch(error => {
    console.error('获取科目列表失败:', error)
    loading.value = false
  })
}

// 新增方法
const handleAdd = () => {
  resetForm()
  dialogTitle.value = "新增科目信息"
  isAdd.value = true
  dialogVisible.value = true
}

// 编辑方法
const handleEdit = (row: any) => {
  resetForm()
  dialogTitle.value = "修改科目信息"
  isAdd.value = false
  Object.assign(form, row)
  dialogVisible.value = true
}

// 批量删除方法
const handleBatchDelete = () => {
  if (selectedIdList.value.length === 0) {
    ElMessage.warning("请选择要删除的科目")
    return
  }
  ElMessageBox.confirm(
    `确定删除选中的 ${selectedIdList.value.length} 条科目信息吗?`,
    "提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  ).then(async () => {
    await deleteSubjects(selectedIdList.value)
    ElMessage.success("删除成功")
    handleQuery()
  }).catch(() => {
    ElMessage.info("删除已取消")
  })
}

// 处理选择项变化
const handleSelectionChange = (selection: any[]) => {
  selectedIdList.value = selection.map(item => item.id)
  multiple.value = !selection.length
}

// 处理每页显示数量变化
const handleSizeChange = (val: number) => {
  queryParams.PageSize = val
  handleQuery()
}

// 处理页码变化
const handleCurrentChange = (val: number) => {
  queryParams.PageIndex = val
  handleQuery()
}

// 表单重置
const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(form, { id: "", subjectName: '', sortWeight: 0, subjectDescription: '' })
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

// 表单校验规则
const rules: FormRules = {
  subjectName: [{ required: true, message: '科目名称不能为空', trigger: 'blur' }],
  sortWeight: [{ required: true, message: '排序权重不能为空', trigger: 'blur' }],
  subjectDescription: [{ required: true, message: '科目说明不能为空', trigger: 'blur' }]
}

// 提交按钮
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isAdd.value) {
          await addSubject(form)
          ElMessage.success("新增成功")
        } else {
          await updateSubject(form.id, form)
          ElMessage.success("修改成功")
        }
        dialogVisible.value = false
        handleQuery()
      } catch (error) {
        console.error('提交失败:', error)
        ElMessage.error('提交失败')
      }
    }
  })
}

// 恢复默认列
const resetColumns = () => {
  checkedProps.value = allColumns.value.map(c => c.prop)
}
</script>

<style scoped>
.subject-management {
  padding: 20px;
}

.search-bar {
  margin-bottom: 15px;
}

.table-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.table-title {
  font-size: 18px;
  font-weight: bold;
}

.operation-area {
  display: flex;
  gap: 10px;
}

.pagination-container {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  text-align: right;
}
</style>
