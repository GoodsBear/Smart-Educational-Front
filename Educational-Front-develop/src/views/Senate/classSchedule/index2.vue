<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="filter-container">
      <el-card class="box-card">
        <el-form :inline="true" :model="queryParams" class="demo-form-inline">
          <el-form-item label="班级名称">
            <el-input v-model="queryParams.className" placeholder="请输入班级名称" style="width: 150px" class="filter-item"
              @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="课程名称">
            <el-input v-model="queryParams.courseName" placeholder="请输入课程名称" style="width: 150px" class="filter-item"
              @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="queryParams.status" placeholder="请选择状态" style="width: 150px;" clearable>
              <el-option label="已排课" :value="1" />
              <el-option label="未排课" :value="0" />
              <el-option label="已生成课表" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="handleResetQuery">重置</el-button>
            <!-- 列显示设置按钮 -->
            <el-dropdown trigger="hover" @command="handleColumnCommand">
              <el-button type="info">
                <el-icon>
                  <Setting />
                </el-icon>
                列设置
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="selectAll">全选</el-dropdown-item>
                  <el-dropdown-item command="unselectAll">全不选</el-dropdown-item>
                  <el-dropdown-item divided />
                  <el-dropdown-item v-for="col in allColumns" :key="col.prop" :command="col.prop"
                    :class="{ 'is-checked': checkedProps.includes(col.prop) }">
                    <el-checkbox :model-value="checkedProps.includes(col.prop)"
                      @change="(val) => toggleColumn(col.prop, val)" @click.stop />
                    {{ col.label }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 操作按钮区域 -->
    <div class="action-container">
      <el-button type="primary" @click="handleAdd">新增排课</el-button>
      <el-button type="success" @click="handleBatchSchedule">批量排课</el-button>
      <el-button type="warning" @click="handleGenerateTimetable">生成课表</el-button>
      <el-button type="danger" @click="handleBatchDelete">批量删除</el-button>


    </div>

    <!-- 数据表格 -->
    <el-card class="box-card">
      <el-table ref="tableRef" v-loading="loading" :data="scheduleList" style="width: 100%" border
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <!-- 动态渲染列 -->
        <el-table-column>
          <template v-if="scheduleList.prop === 'status'" #default="{ row }">
            <el-tag v-if="row.isTimetableGenerated" type="success">已生成课表</el-tag>
            <el-tag v-else-if="row.hasSchedulingConflict" type="danger">冲突</el-tag>
            <el-tag v-else type="warning">已排课</el-tag>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="success" link @click="handleViewTimetable(scope.row)">查看课表</el-button>
            <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
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

    <!-- 新增/编辑排课抽屉 -->
    <el-drawer v-model="drawer" :title="title" size="800px" :with-header="true" close-on-press-escape>
      <el-form ref="formRef" :model="scheduleForm" :rules="rules" label-width="120px" style="padding: 20px;">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="组织机构" prop="organizationId">
              <el-select v-model="scheduleForm.organizationId" placeholder="请选择组织机构" style="width: 100%">
                <el-option v-for="item in organizationList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="班级" prop="classId">
              <el-select v-model="scheduleForm.classId" placeholder="请选择班级" style="width: 100%">
                <el-option v-for="item in classList" :key="item.id" :label="item.className" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="课程" prop="courseId">
              <el-select v-model="scheduleForm.courseId" placeholder="请选择课程" style="width: 100%">
                <el-option v-for="item in courseList" :key="item.id" :label="item.courseName" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="主教师" prop="mainTeacher">
              <el-select v-model="scheduleForm.mainTeacher" placeholder="请选择主教师" style="width: 100%">
                <el-option v-for="item in teacherList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="助教" prop="assistantTeacher">
              <el-select v-model="scheduleForm.assistantTeacher" placeholder="请选择助教" style="width: 100%">
                <el-option v-for="item in teacherList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大人数" prop="maxAttendees">
              <el-input-number v-model="scheduleForm.maxAttendees" :min="1" :max="100" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始日期" prop="startDate">
              <el-date-picker v-model="scheduleForm.startDate" type="date" placeholder="选择开始日期" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束日期" prop="endDate">
              <el-date-picker v-model="scheduleForm.endDate" type="date" placeholder="选择结束日期" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="消课基数" prop="consumptionBase">
              <el-input-number v-model="scheduleForm.consumptionBase" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大排课数" prop="maxSchedules">
              <el-input-number v-model="scheduleForm.maxSchedules" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="跳过节假日" prop="skipHolidays">
              <el-switch v-model="scheduleForm.skipHolidays" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排课时间" prop="scheduleTimes">
              <el-select v-model="scheduleForm.scheduleTimes" placeholder="请选择排课时间" style="width: 100%">
                <el-option label="周一 09:00-10:30" value="1_09:00-10:30" />
                <el-option label="周二 14:00-15:30" value="2_14:00-15:30" />
                <el-option label="周三 16:00-17:30" value="3_16:00-17:30" />
                <el-option label="周四 19:00-20:30" value="4_19:00-20:30" />
                <el-option label="周五 15:00-16:30" value="5_15:00-16:30" />
                <el-option label="周六 09:00-10:30" value="6_09:00-10:30" />
                <el-option label="周日 14:00-15:30" value="0_14:00-15:30" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item>
          <el-button type="primary" @click="submitForm">提交</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-drawer>

    <!-- 课表查看对话框 -->
    <el-dialog v-model="timetableDialog" title="课表详情" width="80%" :close-on-click-modal="false">
      <div class="timetable-container">
        <div class="timetable-header">
          <h3>{{ currentSchedule?.className }} - {{ currentSchedule?.courseName }}</h3>
          <p>主教师：{{ currentSchedule?.mainTeacher }} | 助教：{{ currentSchedule?.assistantTeacher }}</p>
        </div>

        <el-table :data="timetableData" border style="width: 100%">
          <el-table-column label="周次" prop="week" width="80" align="center" />
          <el-table-column label="日期" prop="date" width="120" align="center" />
          <el-table-column label="时间" prop="time" width="120" align="center" />
          <el-table-column label="教室" prop="classroom" width="100" align="center" />
          <el-table-column label="状态" prop="status" width="100" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.status === '已完成'" type="success">已完成</el-tag>
              <el-tag v-else-if="scope.row.status === '进行中'" type="warning">进行中</el-tag>
              <el-tag v-else type="info">未开始</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="备注" prop="remark" />
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Setting } from '@element-plus/icons-vue'
import { addClassSchedule } from '@/api/Senate/classSchedule/classSchedule'
import moment from 'moment'

defineOptions({
  name: 'ClassScheduleManagement'
})

// 响应式数据
const loading = ref(false)
const scheduleList = ref([])
const total = ref(0)
const selectedRows = ref([])

// 查询参数
const queryParams = reactive({
  className: '',
  courseName: '',
  mainTeacher: '',
  status: '',
  PageIndex: 1,
  PageSize: 10
})

// 抽屉相关
const drawer = ref(false)
const title = ref('')
const formRef = ref<FormInstance>()

// 表单数据
interface ScheduleForm {
  id: string
  organizationId: string
  classId: string
  courseId: string
  mainTeacher: string
  assistantTeacher: string
  startDate: Date | null
  endDate: Date | null
  consumptionBase: number
  maxAttendees: number
  maxSchedules: number
  skipHolidays: boolean
  scheduleTimes: string
}

const scheduleForm = reactive<ScheduleForm>({
  id: '',
  organizationId: '',
  classId: '',
  courseId: '',
  mainTeacher: '',
  assistantTeacher: '',
  startDate: null,
  endDate: null,
  consumptionBase: 1,
  maxAttendees: 30,
  maxSchedules: 20,
  skipHolidays: true,
  scheduleTimes: ''
})

// 表单验证规则
const rules: FormRules = {
  organizationId: [{ required: true, message: '请选择组织机构', trigger: 'change' }],
  classId: [{ required: true, message: '请选择班级', trigger: 'change' }],
  courseId: [{ required: true, message: '请选择课程', trigger: 'change' }],
  mainTeacher: [{ required: true, message: '请选择主教师', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
  maxAttendees: [{ required: true, message: '请输入最大人数', trigger: 'blur' }],
  scheduleTimes: [{ required: true, message: '请选择排课时间', trigger: 'change' }]
}

// 下拉数据
const organizationList = ref([])
const classList = ref([])
const courseList = ref([])
const teacherList = ref([])

// 课表相关
const timetableDialog = ref(false)
const currentSchedule = ref(null)
const timetableData = ref([])

// 列配置
interface ColumnConfig {
  prop: string
  label: string
  width?: number
  align?: 'left' | 'center' | 'right'
  showOverflowTooltip?: boolean
}

// 所有可用列
const allColumns: ColumnConfig[] = [
  { prop: 'className', label: '班级名称', width: 120 },
  { prop: 'courseName', label: '课程名称', width: 150 },
  { prop: 'mainTeacher', label: '主教师', width: 100 },
  { prop: 'assistantTeacher', label: '助教', width: 100 },
  { prop: 'startDate', label: '开始日期', width: 120 },
  { prop: 'endDate', label: '结束日期', width: 120 },
  { prop: 'consumptionBase', label: '消课基数', width: 100 },
  { prop: 'maxAttendees', label: '最大人数', width: 100 },
  { prop: 'maxSchedules', label: '最大排课数', width: 120 },
  { prop: 'scheduleTimes', label: '排课时间', width: 150 },
  { prop: 'skipHolidays', label: '跳过节假日', width: 120 },
  { prop: 'generatedSessionCount', label: '已生成课时', width: 150 },
  { prop: 'status', label: '状态', width: 100 }
]

// 默认显示的列
const defaultCheckedProps = [
  'className', 'courseName', 'mainTeacher', 'startDate', 'endDate',
  'consumptionBase', 'maxAttendees', 'status'
]

// 当前选中的列
const checkedProps = ref<string[]>(defaultCheckedProps)

// 列操作相关方法
const handleColumnCommand = (command: string) => {
  switch (command) {
    case 'selectAll':
      checkedProps.value = allColumns.map(col => col.prop)
      break
    case 'unselectAll':
      checkedProps.value = []
      break
    default:
      // 单个列的切换在 toggleColumn 中处理
      break
  }
}

const toggleColumn = (prop: string, checked: boolean) => {
  if (checked) {
    if (!checkedProps.value.includes(prop)) {
      checkedProps.value.push(prop)
    }
  } else {
    const index = checkedProps.value.indexOf(prop)
    if (index > -1) {
      checkedProps.value.splice(index, 1)
    }
  }
}

// 方法定义
const handleQuery = async () => {
  loading.value = true
  try {
    // TODO: 调用API获取排课列表
    // const response = await getClassScheduleList(queryParams)
    // scheduleList.value = response.data
    // total.value = response.total

    // 模拟数据
    scheduleList.value = [
      {
        id: '1',
        className: '高一(1)班',
        courseName: '数学基础',
        mainTeacher: '张老师',
        assistantTeacher: '李老师',
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        consumptionBase: 2,
        maxAttendees: 30,
        maxSchedules: 20,
        scheduleTimes: '1_09:00-10:30',
        skipHolidays: true,
        generatedSessionCount: 15,
        isTimetableGenerated: true,
        hasSchedulingConflict: false
      },
      {
        id: '2',
        className: '高一(2)班',
        courseName: '英语口语',
        mainTeacher: '王老师',
        assistantTeacher: '赵老师',
        startDate: '2024-01-15',
        endDate: '2024-07-15',
        consumptionBase: 1,
        maxAttendees: 25,
        maxSchedules: 18,
        scheduleTimes: '2_14:00-15:30',
        skipHolidays: false,
        generatedSessionCount: 8,
        isTimetableGenerated: false,
        hasSchedulingConflict: true
      }
    ]
    total.value = 2
  } catch (error) {
    console.error('查询失败:', error)
    ElMessage.error('查询失败')
  } finally {
    loading.value = false
  }
}

const handleResetQuery = () => {
  queryParams.className = ''
  queryParams.courseName = ''
  queryParams.mainTeacher = ''
  queryParams.status = ''
  handleQuery()
}

const handleAdd = () => {
  drawer.value = true
  title.value = '新增排课'
  resetForm()
}

const handleEdit = (row: any) => {
  drawer.value = true
  title.value = '编辑排课'
  Object.assign(scheduleForm, row)
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这条排课记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // TODO: 调用删除API
    ElMessage.success('删除成功')
    handleQuery()
  } catch (error) {
    console.error('删除失败:', error)
  }
}

const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的记录')
    return
  }

  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 条记录吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // TODO: 调用批量删除API
    ElMessage.success('批量删除成功')
    handleQuery()
  } catch (error) {
    console.error('批量删除失败:', error)
  }
}

const handleBatchSchedule = () => {
  ElMessage.info('批量排课功能开发中...')
}

const handleGenerateTimetable = () => {
  ElMessage.info('生成课表功能开发中...')
}

const handleViewTimetable = (row: any) => {
  currentSchedule.value = row
  timetableDialog.value = true

  // 模拟课表数据
  timetableData.value = [
    {
      week: 1,
      date: '2024-01-01',
      time: '09:00-10:30',
      classroom: 'A101',
      status: '已完成',
      remark: '正常上课'
    },
    {
      week: 2,
      date: '2024-01-08',
      time: '09:00-10:30',
      classroom: 'A101',
      status: '进行中',
      remark: '正常上课'
    }
  ]
}

const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
}

const handleSizeChange = (val: number) => {
  queryParams.PageSize = val
  handleQuery()
}

const handleCurrentChange = (val: number) => {
  queryParams.PageIndex = val
  handleQuery()
}

const submitForm = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid, fields) => {
    if (valid) {
      try {
        // TODO: 调用API保存数据
        // const response = await addClassSchedule(scheduleForm)
        ElMessage.success('保存成功')
        drawer.value = false
        handleQuery()
      } catch (error) {
        console.error('保存失败:', error)
        ElMessage.error('保存失败')
      }
    } else {
      console.log('表单验证失败:', fields)
    }
  })
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.assign(scheduleForm, {
    id: '',
    organizationId: '',
    classId: '',
    courseId: '',
    mainTeacher: '',
    assistantTeacher: '',
    startDate: null,
    endDate: null,
    consumptionBase: 1,
    maxAttendees: 30,
    maxSchedules: 20,
    skipHolidays: true,
    scheduleTimes: ''
  })
}

const formatDate = (date: string) => {
  return moment(date).format('YYYY-MM-DD')
}

const formatScheduleTime = (timeStr: string) => {
  if (!timeStr) return ''
  const [day, time] = timeStr.split('_')
  const dayMap: Record<string, string> = {
    '0': '周日',
    '1': '周一',
    '2': '周二',
    '3': '周三',
    '4': '周四',
    '5': '周五',
    '6': '周六'
  }
  return `${dayMap[day] || ''} ${time || ''}`
}

const getSessionPercentage = (row: any) => {
  if (!row.maxSchedules) return 0
  return Math.round((row.generatedSessionCount / row.maxSchedules) * 100)
}

const getSessionStatus = (row: any) => {
  const percentage = getSessionPercentage(row)
  if (percentage >= 80) return 'success'
  if (percentage >= 50) return 'warning'
  return 'exception'
}

// 加载下拉数据
const loadDropdownData = async () => {
  try {
    // TODO: 加载各种下拉数据
    organizationList.value = [
      { id: '1', name: '总校' },
      { id: '2', name: '分校A' }
    ]

    classList.value = [
      { id: '1', className: '高一(1)班' },
      { id: '2', className: '高一(2)班' }
    ]

    courseList.value = [
      { id: '1', courseName: '数学基础' },
      { id: '2', courseName: '英语口语' }
    ]

    teacherList.value = [
      { id: '1', name: '张老师' },
      { id: '2', name: '李老师' }
    ]
  } catch (error) {
    console.error('加载下拉数据失败:', error)
  }
}

// 生命周期
onMounted(() => {
  handleQuery()
  loadDropdownData()
})
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.filter-container {
  margin-bottom: 20px;
}

.filter-item {
  display: inline-block;
  margin-right: 10px;
}

.action-container {
  margin-bottom: 20px;
}

.action-container .el-button {
  margin-right: 10px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.timetable-container {
  padding: 20px;
}

.timetable-header {
  margin-bottom: 20px;
  text-align: center;
}

.timetable-header h3 {
  margin: 0 0 10px 0;
  color: #303133;
}

.timetable-header p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.attendees-count {
  color: #409eff;
  font-weight: bold;
}

.text-gray {
  color: #909399;
}

/* 下拉菜单样式 */
:deep(.el-dropdown-menu__item.is-checked) {
  background-color: #f0f9ff;
  color: #409eff;
}

:deep(.el-dropdown-menu__item .el-checkbox) {
  margin-right: 8px;
}
</style>
