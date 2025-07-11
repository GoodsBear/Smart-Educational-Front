<template>
  <div class="learning-students">
    <!-- 查询条件卡片 -->
    <el-card class="search-card">
      <div class="card-header">
        <span>查询条件</span>
      </div>
      <!-- 搜索区域 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="学员姓名">
          <el-input v-model="queryParams.studentName" placeholder="请输入学员姓名" clearable />
        </el-form-item>
        <el-form-item label="所属机构">
          <el-select v-model="queryParams.orgaizationId" placeholder="请选择机构" style="width:200px" clearable>
            <el-option v-for="item in orgList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属年级">
          <el-select v-model="queryParams.gradeId" placeholder="请选择年级" style="width:200px" clearable>
            <el-option v-for="item in gradeList" :key="item.id || item.gradeId" :label="item.gradeName || item.name"
              :value="item.id || item.gradeId" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="reloadData">刷新数据</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 列表区域卡片 -->
    <el-card class="list-card">
      <div class="card-header">
        <span>在学学员列表</span>
        <div class="button-group">
          <el-button type="warning" :disabled="!selectedIds.length" @click="handleToIntention">转为意向学员</el-button>
          <el-button type="danger" :disabled="!selectedIds.length" @click="handleToFinish">转为结业学员</el-button>
          <el-button type="danger" :disabled="!selectedIds.length" @click="handleBatchDelete">批量删除</el-button>
          <el-button type="primary" :disabled="!selectedIds.length" @click="handleTransferSchool">转校区</el-button>
          <el-button type="primary" :disabled="!selectedIds.length" @click="handleChangeConsultant">修改顾问</el-button>
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </div>
      </div>
      <!-- 表格区域 -->
      <el-table v-loading="loading" :data="studentList" border style="width: 100%"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="编号" type="index" width="60" align="center" />
        <el-table-column label="学员姓名" prop="name" align="center" />
        <el-table-column label="分校" prop="campusName" align="center" />
        <el-table-column label="家长姓名" prop="parentName" align="center" />
        <el-table-column label="亲属关系" align="center">
          <template #default="{ row }">
            {{ formatRelation(row.relation) }}
          </template>
        </el-table-column>
        <el-table-column label="联系电话" prop="phone" align="center" />
        <el-table-column label="顾问" prop="staffName" align="center" />
        <el-table-column label="年级" prop="gradeName" align="center" />
        <el-table-column label="课时数" prop="lessonNums" align="center" />
        <el-table-column label="积分" prop="score" align="center" />
        <el-table-column label="性别" align="center">
          <template #default="{ row }">
            {{ formatSex(row.sex) }}
          </template>
        </el-table-column>
        <el-table-column label="年龄" prop="age" align="center" />
        <el-table-column label="备注" prop="remark" align="center" show-overflow-tooltip />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button type="success" link @click="">报名</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination v-model:current-page="queryParams.pageIndex" v-model:page-size="queryParams.pageSize"
        :total="total" :page-sizes="[10, 20, 30, 50]" layout="total, sizes, prev, pager, next, jumper"
        class="pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </el-card>

    <!-- 添加学员对话框 -->
    <el-dialog v-model="addDialogVisible" title="在学学员" width="40%" :close-on-click-modal="false" @close="resetForm">
      <el-form ref="studentFormRef" :model="studentForm" :rules="studentFormRules" label-width="100px"
        label-position="right">
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="studentForm.phone" placeholder="一个的手机号支持添加多个学生"></el-input>
        </el-form-item>
        <el-form-item label="所属校区" prop="campusId">
          <el-select v-model="studentForm.campusId" placeholder="请选择" style="width:100%">
            <el-option v-for="item in orgList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="家长姓名">
          <el-input v-model="studentForm.parentName"></el-input>
        </el-form-item>
        <el-form-item label="亲属关系">
          <el-select v-model="studentForm.relation" placeholder="请选择" style="width:100%">
            <el-option :value="0" label="爸爸"></el-option>
            <el-option :value="1" label="妈妈"></el-option>
            <el-option :value="2" label="爷爷"></el-option>
            <el-option :value="3" label="奶奶"></el-option>
            <el-option :value="4" label="姥爷"></el-option>
            <el-option :value="5" label="姥姥"></el-option>
            <el-option :value="6" label="姑姑"></el-option>
            <el-option :value="7" label="其他"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="学员姓名" prop="name">
          <el-input v-model="studentForm.name" placeholder="请输入姓名"></el-input>
        </el-form-item>
        <el-form-item label="学生性别" prop="sex">
          <el-select v-model="studentForm.sex" placeholder="请选择性别" style="width:100%">
            <el-option :value="0" label="男"></el-option>
            <el-option :value="1" label="女"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="入学时间">
          <el-date-picker v-model="studentForm.enrollTime" type="date" style="width:100%"
            value-format="YYYY-MM-DD"></el-date-picker>
        </el-form-item>
        <el-form-item label="年级">
          <el-select v-model="studentForm.gradeId" placeholder="请选择" style="width:100%">
            <el-option v-for="item in gradeList" :key="item.id || item.gradeId" :label="item.gradeName || item.name"
              :value="item.id || item.gradeId" />
          </el-select>
        </el-form-item>
        <el-form-item label="出生年月">
          <el-date-picker v-model="studentForm.birthday" type="date" style="width:100%"
            value-format="YYYY-MM-DD"></el-date-picker>
        </el-form-item>
        <el-form-item label="身份证号">
          <el-input v-model="studentForm.idCard"></el-input>
        </el-form-item>
        <el-form-item label="来源">
          <el-select v-model="studentForm.source" placeholder="请选择" style="width:100%">
            <el-option value="老带新" label="老带新"></el-option>
            <el-option value="自然进店" label="自然进店"></el-option>
            <el-option value="广告投放" label="广告投放"></el-option>
            <el-option value="其他" label="其他"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="studentForm.remark" type="textarea" rows="3"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">提交</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 转校区对话框 -->
    <el-dialog v-model="transferDialogVisible" title="转校区" width="30%" :close-on-click-modal="false">
      <el-form :model="transferForm" label-width="80px">
        <el-form-item label="目标校区">
          <el-select v-model="transferForm.campusId" placeholder="请选择校区" style="width:100%">
            <el-option v-for="item in orgList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="transferDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitTransfer">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改顾问对话框 -->
    <el-dialog v-model="consultantDialogVisible" title="修改顾问" width="30%" :close-on-click-modal="false">
      <el-form :model="consultantForm" label-width="80px">
        <el-form-item label="选择顾问">
          <el-select v-model="consultantForm.consultantId" placeholder="请选择顾问" style="width:100%">
            <el-option v-for="item in staffList" :key="item.guid || item.id" :label="item.staffName || item.name"
              :value="item.guid || item.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="consultantDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitConsultant">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import studentApi from '@/api/StudentsManager/Student/Student'
import { formatDate } from '@/utils/date'
import { getCourseList } from '@/api/Lession/CourseManager/Course'
import router from '@/router'
//#region 
// 查询参数
const queryParams = reactive({
  studentName: '',
  orgaizationId: '',
  gradeId: '',
  pageIndex: 1,
  pageSize: 10
})

// 数据列表
const studentList = ref([])
const total = ref(0)
const loading = ref(false)
const orgList = ref<any[]>([]) // 明确指定类型为数组
const gradeList = ref<any[]>([]) // 明确指定类型为数组

// 数据加载状态
const dataLoadStatus = reactive({
  org: false,
  grade: false,
  staff: false
})

// 学员表单
const studentFormRef = ref<FormInstance>()
const addDialogVisible = ref(false)
const studentForm = reactive({
  name: '',
  phone: '',
  campusId: '',
  parentName: '',
  relation: 0,
  sex: 0,
  enrollTime: '',
  gradeId: '',
  birthday: '',
  idCard: '',
  source: '',
  remark: '',
  studentType: 0,
  consultant: '3a1aa9d3-b077-f2a4-7ebc-f6bfa605dfb7',
  lessonNums: 0,
})

// 表单验证规则
const studentFormRules = {
  name: [{ required: true, message: '请输入学员姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  campusId: [{ required: true, message: '请选择所属校区', trigger: 'change' }],
  sex: [{ required: true, message: '请选择性别', trigger: 'change' }],
  idCard: [{ required: true, message: '请输入身份证号', trigger: 'blur' }],
  source: [{ required: true, message: '请选择来源', trigger: 'change' }],
  parentName: [{ required: true, message: '请输入家长姓名', trigger: 'blur' }],
  remark: [{ required: true, message: '请输入备注', trigger: 'blur' }]
}

// 格式化性别
const formatSex = (sex: number) => {
  const sexMap: Record<number, string> = {
    0: '男',
    1: '女'
  }
  return sexMap[sex] || '未知'
}

// 格式化亲属关系
const formatRelation = (relation: number) => {
  const relationMap: Record<number, string> = {
    0: '爸爸',
    1: '妈妈',
    2: '爷爷',
    3: '奶奶',
    4: '姥爷',
    5: '姥姥',
    6: '姑姑',
    7: '其他'
  }
  return relationMap[relation] || '未知'
}

// 获取学员列表
const getStudentList = async () => {
  try {
    loading.value = true
    const res = await studentApi.getLessonStudents(queryParams)
    if (res) {
      console.log('获取到的学员列表数据:', res.data)
      studentList.value = res.data
      total.value = res.totleCount || 0
    } else {
      studentList.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取在学学员列表失败:', error)
    ElMessage.error('获取列表失败')
    studentList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 获取机构列表
const getOrganizationList = async () => {
  try {
    dataLoadStatus.org = false
    const res = await studentApi.getOrganizationList()
    console.log('机构数据:', res)

    // 直接将返回结果赋值给orgList
    orgList.value = res
    dataLoadStatus.org = true
    console.log('机构列表:', orgList.value)
  } catch (error) {
    console.error('获取机构列表失败:', error)
    ElMessage.error('获取机构列表失败')
    dataLoadStatus.org = false
  }
}

// 获取年级列表
const getGradeList = async () => {
  try {
    dataLoadStatus.grade = false
    const res = await studentApi.getGradeList()
    console.log('年级数据:', res)

    // 直接将返回结果赋值给gradeList
    gradeList.value = res
    dataLoadStatus.grade = true
    console.log('年级列表:', gradeList.value)
  } catch (error) {
    console.error('获取年级列表失败:', error)
    ElMessage.error('获取年级列表失败')
    dataLoadStatus.grade = false
  }
}

// 员工列表数据
const staffList = ref<any[]>([])

// 获取员工列表
const getStaffList = async () => {
  try {
    const res = await studentApi.getStaffList()
    console.log('员工数据结构:', res)
    if (Array.isArray(res)) {
      staffList.value = res
    } else if (res && res.data && Array.isArray(res.data)) {
      staffList.value = res.data
    } else {
      staffList.value = []
      console.error('员工数据格式不正确:', res)
    }
    console.log('处理后的员工列表:', staffList.value)
  } catch (error) {
    console.error('获取员工列表失败:', error)
    ElMessage.error('获取员工列表失败')
    staffList.value = []
  }
}

// 搜索
const handleSearch = () => {
  queryParams.pageIndex = 1
  getStudentList()
}

// 重置
const handleReset = () => {
  queryParams.studentName = ''
  queryParams.orgaizationId = ''
  queryParams.gradeId = ''
  queryParams.pageIndex = 1
  getStudentList()
}

// 分页大小改变
const handleSizeChange = (val: number) => {
  queryParams.pageSize = val
  getStudentList()
}

// 页码改变
const handleCurrentChange = (val: number) => {
  queryParams.pageIndex = val
  getStudentList()
}

// 查看学员详情
const handleView = (row: any) => {
  console.log('查看学员详情:', row)
  router.push({
    path: '/satena/detail',
    query: {
      id: row.guid || row.id,
      name: row.name,
      phone: row.phone,
      campusId: row.campusId,
      parentName: row.parentName,
      relation: row.relation?.toString(),
      sex: row.sex?.toString(),
      enrollTime: row.enrollTime,
      gradeId: row.gradeId,
      birthday: row.birthday,
      idCard: row.idCard,
      source: row.source,
      remark: row.remark,
      studentType: row.studentType?.toString(),
      consultant: row.consultant,
      lessonNums: row.lessonNums?.toString()
    }
  })
}

// 重新加载所有数据
const reloadData = () => {
  getOrganizationList()
  getGradeList()
  getStaffList()
  getStudentList()
}

// 打开新增对话框
const handleAdd = () => {
  addDialogVisible.value = true
}

// 重置表单
const resetForm = () => {
  studentFormRef.value?.resetFields()
  Object.assign(studentForm, {
    name: '',
    phone: '',
    campusId: '',
    parentName: '',
    relation: 0,
    sex: 0,
    enrollTime: '',
    gradeId: '',
    birthday: '',
    idCard: '',
    source: '',
    remark: '',
    studentType: 0,
    consultant: '',
    lessonNums: 0,
    storeId: ''
  })
}

// 提交表单
const submitForm = async () => {
  try {
    await studentApi.addStudent(studentForm)
    ElMessage.success('添加学员成功')
    addDialogVisible.value = false
    resetForm()
    getStudentList()
  } catch (error) {
    console.error('添加学员失败:', error)
    ElMessage.error('添加学员失败')
  }
}

// 选中的ID数组
const selectedIds = ref<string[]>([])

// 表格多选变化事件
const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = [] // 清空数组
  selection.forEach(item => {
    console.log('选中的行数据:', item) // 打印完整的行数据
    // 尝试获取id，可能是guid或id字段
    const studentId = item.guid || item.id
    if (studentId) {
      selectedIds.value.push(studentId)
    }
  })
  console.log('收集到的ID数组:', selectedIds.value)
}

// 转为意向学员
const handleToIntention = () => {
  if (!selectedIds.value.length) {
    ElMessage.warning('请选择要转换的学员')
    return
  }

  console.log('准备转换的学员ID:', selectedIds.value)

  ElMessageBox.confirm('确认将选中的学员转为意向学员吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      console.log('发送请求前的ID数组:', selectedIds.value)
      await studentApi.updateStudentType(1, selectedIds.value) // 1代表意向学员
      ElMessage.success('转换成功')
      getStudentList() // 刷新列表
    } catch (error) {
      console.error('转换失败:', error)
      ElMessage.error('转换失败')
    }
  }).catch(() => { })
}

// 转为结业学员
const handleToFinish = () => {
  if (!selectedIds.value.length) {
    ElMessage.warning('请选择要转换的学员')
    return
  }

  console.log('准备转换的学员ID:', selectedIds.value)

  ElMessageBox.confirm('确认将选中的学员转为结业学员吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      console.log('发送请求前的ID数组:', selectedIds.value)
      await studentApi.updateStudentType(2, selectedIds.value) // 2代表结业学员
      ElMessage.success('转换成功')
      getStudentList() // 刷新列表
    } catch (error) {
      console.error('转换失败:', error)
      ElMessage.error('转换失败')
    }
  }).catch(() => { })
}

// 批量删除学员
const handleBatchDelete = () => {
  if (!selectedIds.value.length) {
    ElMessage.warning('请选择要删除的学员')
    return
  }

  ElMessageBox.confirm('确认要删除选中的学员吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const deleteIds: string[] = []
      selectedIds.value.forEach(id => {
        deleteIds.push(id)
      })
      await studentApi.batchDeleteStudents(deleteIds)
      ElMessage.success('删除成功')
      getStudentList() // 刷新列表
    } catch (error) {
      console.error('批量删除失败:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => { })
}

// 转校区相关数据
const transferDialogVisible = ref(false)
const transferForm = reactive({
  campusId: ''
})

// 打开转校区对话框
const handleTransferSchool = () => {
  if (!selectedIds.value.length) {
    ElMessage.warning('请选择要转校区的学员')
    return
  }
  transferDialogVisible.value = true
  transferForm.campusId = '' // 重置选择的校区
}

// 提交转校区
const submitTransfer = async () => {
  if (!transferForm.campusId) {
    ElMessage.warning('请选择目标校区')
    return
  }

  try {
    const transferIds: string[] = []
    selectedIds.value.forEach(id => {
      transferIds.push(id)
    })

    await studentApi.transferSchool({
      campusId: transferForm.campusId,
      guids: transferIds
    })

    ElMessage.success('转校区成功')
    transferDialogVisible.value = false
    getStudentList() // 刷新列表
  } catch (error) {
    console.error('转校区失败:', error)
    ElMessage.error('转校区失败')
  }
}

// 修改顾问相关数据
const consultantDialogVisible = ref(false)
const consultantForm = reactive({
  consultantId: ''
})

// 打开修改顾问对话框
const handleChangeConsultant = async () => {
  if (!selectedIds.value.length) {
    ElMessage.warning('请选择要修改顾问的学员')
    return
  }
  consultantDialogVisible.value = true
  consultantForm.consultantId = '' // 重置选择的顾问
  await getStaffList() // 获取员工列表
  console.log('当前员工列表数据:', staffList.value)
}

// 提交修改顾问
const submitConsultant = async () => {
  if (!consultantForm.consultantId) {
    ElMessage.warning('请选择顾问')
    return
  }

  try {
    const studentIds: string[] = []
    selectedIds.value.forEach(id => {
      studentIds.push(id)
    })

    await studentApi.updateConsultant({
      consultant: consultantForm.consultantId,
      guids: studentIds
    })

    ElMessage.success('修改顾问成功')
    consultantDialogVisible.value = false
    getStudentList() // 刷新列表
  } catch (error) {
    console.error('修改顾问失败:', error)
    ElMessage.error('修改顾问失败')
  }
}











// 页面加载时获取列表
onMounted(() => {
  getStudentList()
  getOrganizationList()
  getGradeList()
  getStaffList()
})
</script>

<style scoped>
.learning-students {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.list-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-header span {
  font-size: 16px;
  font-weight: bold;
}

.search-form {
  margin-bottom: 0;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.button-group {
  display: flex;
  gap: 10px;
}
</style>
