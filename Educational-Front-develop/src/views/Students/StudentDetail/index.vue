<template>
  <div class="student-detail">
    <el-row :gutter="20">
      <!-- 左侧信息栏 -->
      <el-col :span="6">
        <StudentBasicInfo :student-info="studentForm" />
      </el-col>
      
      <!-- 右侧内容区 -->
      <el-col :span="18">
        <!-- 导航按钮 -->
        <div class="nav-buttons">
          <el-button 
            :type="activeTab === 'info' ? 'primary' : 'default'"
            @click="activeTab = 'info'"
          >
            编辑个人信息
          </el-button>
          <el-button 
            :type="activeTab === 'follow' ? 'primary' : 'default'"
            @click="handleSwitchToFollow"
          >
            跟进记录
          </el-button>
        </div>

        <!-- 编辑个人信息表单 -->
        <el-card v-if="activeTab === 'info'" class="detail-card">
          <div class="card-header">
            <span>学员详情</span>
          </div>
          <el-form 
            :model="studentForm" 
            :rules="studentFormRules" 
            ref="studentFormRef" 
            label-width="100px"
            label-position="right"
          >
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="studentForm.phone" placeholder="请输入手机号"></el-input>
            </el-form-item>
            <el-form-item label="所属校区" prop="campusId">
              <el-select v-model="studentForm.campusId" placeholder="请选择" style="width:100%">
                <el-option
                  v-for="item in orgList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="家长姓名" prop="parentName">
              <el-input v-model="studentForm.parentName"></el-input>
            </el-form-item>
            <el-form-item label="亲属关系" prop="relation">
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
            <el-form-item label="入学时间" prop="enrollTime">
              <el-date-picker
                v-model="studentForm.enrollTime"
                type="date"
                style="width:100%"
                value-format="YYYY-MM-DD"
              ></el-date-picker>
            </el-form-item>
            <el-form-item label="年级" prop="gradeId">
              <el-select v-model="studentForm.gradeId" placeholder="请选择" style="width:100%">
                <el-option
                  v-for="item in gradeList"
                  :key="item.id || item.gradeId"
                  :label="item.gradeName || item.name"
                  :value="item.id || item.gradeId"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="出生年月" prop="birthday">
              <el-date-picker
                v-model="studentForm.birthday"
                type="date"
                style="width:100%"
                value-format="YYYY-MM-DD"
              ></el-date-picker>
            </el-form-item>
            <el-form-item label="身份证号" prop="idCard">
              <el-input v-model="studentForm.idCard"></el-input>
            </el-form-item>
            <el-form-item label="来源" prop="source">
              <el-select v-model="studentForm.source" placeholder="请选择" style="width:100%">
                <el-option value="老带新" label="老带新"></el-option>
                <el-option value="自然进店" label="自然进店"></el-option>
                <el-option value="广告投放" label="广告投放"></el-option>
                <el-option value="其他" label="其他"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="备注" prop="remark">
              <el-input
                v-model="studentForm.remark"
                type="textarea"
                rows="3"
              ></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSave">保存</el-button>
              <el-button @click="handleBack">返回</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 跟进记录 -->
        <el-card v-if="activeTab === 'follow'" class="detail-card">
          <div class="card-header">
            <span>跟进记录</span>
            <el-button type="primary" @click="handleAddFollow">添加跟进记录</el-button>
          </div>
          <div class="follow-list">
            <div v-if="followList.length === 0" class="no-data">
              暂无跟进记录
            </div>
            <div v-else class="follow-item" v-for="(item, index) in followList" :key="index">
              <div class="follow-timeline">
                <div class="timeline-dot"></div>
                <div class="timeline-line"></div>
              </div>
              <div class="follow-content">
                <div class="follow-header">
                  <span class="follow-time">{{ formatDateWithSeconds(item.touchTime) }} {{ getFollowStageText(item.followStageEnum) }}</span>
                  <el-button type="danger" link @click="handleDeleteFollow(item)">删除</el-button>
                </div>
                <div class="follow-info">
                  <div class="info-row">
                    <span>联系途径: {{ getContactWayText(item.getInTouchEnum) }}</span>
                    <span>联系方式: {{ item.touchWay }}</span>
                  </div>
                  <div class="info-row">
                    <span>下次联系时间: {{ formatDateWithSeconds(item.nextTouchTime) }}</span>
                  </div>
                </div>
                <div class="follow-desc">{{ item.followDesc }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 添加跟进记录对话框 -->
    <el-dialog
      title="跟进记录"
      v-model="followDialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="followForm" :rules="followFormRules" ref="followFormRef" label-width="100px">
        <el-form-item label="跟进阶段" prop="followStageEnum">
          <el-select v-model="followForm.followStageEnum" placeholder="请选择" style="width: 100%">
            <el-option :value="0" label="丢失阶段" />
            <el-option :value="1" label="目标客户阶段" />
            <el-option :value="2" label="潜在客户阶段" />
            <el-option :value="3" label="意向阶段" />
            <el-option :value="4" label="认可阶段" />
            <el-option :value="5" label="签约阶段" />
            <el-option :value="6" label="售后阶段" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系途径" prop="getInTouchEnum">
          <el-select v-model="followForm.getInTouchEnum" placeholder="请选择" style="width: 100%">
            <el-option :value="0" label="面谈" />
            <el-option :value="1" label="电话联系" />
            <el-option :value="2" label="在线沟通" />
            <el-option :value="3" label="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系时间" prop="touchTime">
          <el-date-picker
            v-model="followForm.touchTime"
            type="datetime"
            placeholder="请选择联系时间"
            style="width: 100%"
            value-format="YYYY-MM-DDTHH:mm:ss.SSSZ"
          />
        </el-form-item>
        <el-form-item label="下次联系时间" prop="nextTouchTime">
          <el-date-picker
            v-model="followForm.nextTouchTime"
            type="datetime"
            placeholder="请选择下次联系时间"
            style="width: 100%"
            value-format="YYYY-MM-DDTHH:mm:ss.SSSZ"
          />
        </el-form-item>
        <el-form-item label="联系方式" prop="touchWay">
          <el-input v-model="followForm.touchWay" placeholder="请输入联系方式" />
        </el-form-item>
        <el-form-item label="跟进记录" prop="followDesc">
          <el-input
            v-model="followForm.followDesc"
            type="textarea"
            rows="3"
            placeholder="请输入跟进内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="followDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitFollow">提交</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import studentApi from '@/api/StudentsManager/Student/Student'
import type { StudentInfo } from '@/api/StudentsManager/Student/types'
import StudentBasicInfo from '@/components/StudentBasicInfo/index.vue'
import followApi from '@/api/StudentsManager/Student/Follow'
import moment from 'moment'

const route = useRoute()
const router = useRouter()

// 存储学员ID
const studentId = ref('')

// 表单数据
const studentFormRef = ref<FormInstance>()
const studentForm = reactive<StudentInfo>({
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
  lessonNums: 0
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
  parentName: [{ required: true, message: '请输入家长姓名', trigger: 'blur' }],
  relation: [{ required: true, message: '请选择亲属关系', trigger: 'change' }],
  gradeId: [{ required: true, message: '请选择年级', trigger: 'change' }],
  source: [{ required: true, message: '请选择来源', trigger: 'change' }]
}

// 机构和年级列表
const orgList = ref<any[]>([])
const gradeList = ref<any[]>([])

// 获取机构列表
const getOrganizationList = async () => {
  try {
    const res = await studentApi.getOrganizationList()
    orgList.value = res
  } catch (error) {
    console.error('获取机构列表失败:', error)
    ElMessage.error('获取机构列表失败')
  }
}

// 获取年级列表
const getGradeList = async () => {
  try {
    const res = await studentApi.getGradeList()
    gradeList.value = res
  } catch (error) {
    console.error('获取年级列表失败:', error)
    ElMessage.error('获取年级列表失败')
  }
}

// 初始化表单数据
const initFormData = () => {
  const studentData = route.query
  if (studentData) {
    // 保存学员ID
    if (studentData.id) {
      studentId.value = studentData.id as string
      console.log('获取到的学员ID:', studentId.value)
    } else {
      console.warn('未获取到学员ID')
    }

    Object.keys(studentForm).forEach(key => {
      if (key in studentData) {
        if (key === 'relation' || key === 'sex') {
          // @ts-ignore
          studentForm[key] = parseInt(studentData[key])
        } else {
          // @ts-ignore
          studentForm[key] = studentData[key]
        }
      }
    })
  }
}

// 返回上一页
const handleBack = () => {
  // 根据来源页面决定返回路径
  const fromPage = route.query.fromPage as string
  if (fromPage === 'think') {
    router.push('/Students/ThinkStudents')
  } else if (fromPage === 'finish') {
    router.push('/Students/FinishStudents')
  } else {
    router.push('/Students/OnlineStudents')
  }
}

// 当前激活的标签
const activeTab = ref('info')

// 跟进记录列表
const followList = ref([])

// 跟进记录表单
const followDialogVisible = ref(false)
const followFormRef = ref()
const followForm = reactive({
  followStageEnum: undefined,
  getInTouchEnum: undefined,
  touchTime: '',
  nextTouchTime: '',
  touchWay: '',
  followDesc: ''
})

// 跟进记录表单验证规则
const followFormRules = {
  followStageEnum: [{ required: true, message: '请选择跟进阶段', trigger: 'change' }],
  getInTouchEnum: [{ required: true, message: '请选择联系途径', trigger: 'change' }],
  touchTime: [{ required: true, message: '请选择联系时间', trigger: 'change' }],
  nextTouchTime: [{ required: true, message: '请选择下次联系时间', trigger: 'change' }],
  followDesc: [{ required: true, message: '请输入跟进记录', trigger: 'blur' }]
}

// 添加跟进记录
const handleAddFollow = () => {
  followDialogVisible.value = true
  // 重置表单
  followForm.followStageEnum = undefined
  followForm.getInTouchEnum = undefined
  followForm.touchTime = ''
  followForm.nextTouchTime = ''
  followForm.touchWay = ''
  followForm.followDesc = ''
}

// 提交跟进记录
const submitFollow = async () => {
  if (!followFormRef.value) return
  
  try {
    await followFormRef.value.validate()
    
    if (!studentId.value) {
      ElMessage.error('学员ID不能为空')
      return
    }

    await followApi.addFollowRecord(studentId.value, followForm)
    ElMessage.success('添加跟进记录成功')
    followDialogVisible.value = false
    
    // 重新获取跟进记录列表
    await getFollowRecords()
  } catch (error) {
    console.error('添加跟进记录失败:', error)
    ElMessage.error('添加跟进记录失败')
  }
}

// 获取跟进阶段文本
const getFollowStageText = (stage: number) => {
  const stageMap: Record<number, string> = {
    0: '丢失阶段',
    1: '目标客户阶段',
    2: '潜在客户阶段',
    3: '意向阶段',
    4: '认可阶段',
    5: '签约阶段',
    6: '售后阶段'
  }
  return stageMap[stage] || '未知阶段'
}

// 获取联系途径文本
const getContactWayText = (way: number) => {
  const wayMap: Record<number, string> = {
    0: '面谈',
    1: '电话联系',
    2: '在线沟通',
    3: '其他'
  }
  return wayMap[way] || '未知方式'
}

// 切换到跟进记录标签
const handleSwitchToFollow = async () => {
  activeTab.value = 'follow'
  // 切换到跟进记录标签时获取数据
  await getFollowRecords()
}

// 获取跟进记录列表
const getFollowRecords = async () => {
  try {
    if (!route.query.id) {
      console.warn('学员ID为空，无法获取跟进记录')
      return
    }
    
    const studentGuid = route.query.id as string
    console.log('获取跟进记录，学员ID:', studentGuid)
    const res = await followApi.getFollowList(studentGuid)
    console.log('获取到的原始响应:', res)

    // 检查响应数据
    if (res && Array.isArray(res)) {
      followList.value = res
    } else {
      followList.value = []
    }
  } catch (error) {
    console.error('获取跟进记录列表失败:', error)
    followList.value = []
  }
}

// 删除跟进记录
const handleDeleteFollow = async (item: any) => {
  try {
    // 获取当前学员ID
    const studentGuid = route.query.id as string
    if (!studentGuid) {
      ElMessage.error('学员ID不能为空')
      return
    }

    // 获取跟进记录ID
    const followGuid = item.id
    if (!followGuid) {
      ElMessage.error('跟进记录ID不能为空')
      return
    }

    console.log('删除的跟进记录ID:', followGuid)
    console.log('删除的学员ID:', studentGuid)

    // 显示确认对话框
    await ElMessageBox.confirm(
      '确定要删除这条跟进记录吗？',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 用户点击确定后，执行删除操作
    await followApi.deleteFollowRecord(followGuid, studentGuid)
    ElMessage.success('删除成功')
    
    // 重新获取跟进记录列表
    await getFollowRecords()
  } catch (error) {
    if (error === 'cancel') {
      // 用户点击取消按钮，不做任何操作
      return
    }
    console.error('删除失败:', error)
    ElMessage.error('删除失败')
  }
}

// 日期格式化函数 - 简单格式 (YYYY-MM-DD)
const formatDateSimple = (dateString: string) => {
  if (!dateString) return ''
  return moment(dateString).format('YYYY-MM-DD')
}

// 日期格式化函数 - 带秒数 (YYYY-MM-DD HH:mm:ss)
const formatDateWithSeconds = (dateString: string) => {
  if (!dateString) return ''
  return moment(dateString).format('YYYY-MM-DD HH:mm:ss')
}

// 保存学员信息
const handleSave = async () => {
  if (!studentFormRef.value) return
  
  try {
    await studentFormRef.value.validate()
    
    if (!studentId.value) {
      console.error('学员ID为空')
      ElMessage.error('学员ID不能为空')
      return
    }

    console.log('准备更新的学员ID:', studentId.value)
    console.log('准备更新的学员数据:', studentForm)

    await studentApi.updateStudent(studentId.value, studentForm)
    ElMessage.success('保存成功')
    
    // 根据来源页面决定返回路径
    const fromPage = route.query.fromPage as string
    if (fromPage === 'think') {
      router.push('/Students/ThinkStudents')
    } else if (fromPage === 'finish') {
      router.push('/Students/FinishStudents')
    } else {
      router.push('/Students/OnlineStudents')
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  }
}

onMounted(() => {
  initFormData()
  getOrganizationList()
  getGradeList()
})
</script>

<style scoped>
.student-detail {
  padding: 20px;
}

.detail-card {
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

.el-row {
  margin-bottom: 20px;
}

.nav-buttons {
  margin-bottom: 20px;
}

.nav-buttons .el-button {
  margin-right: 10px;
}

.follow-list {
  padding: 20px 0;
}

.follow-item {
  display: flex;
  margin-bottom: 30px;
  position: relative;
}

.follow-timeline {
  width: 30px;
  position: relative;
  margin-right: 20px;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  background-color: #409EFF;
  border-radius: 50%;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 8px;
}

.timeline-line {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 20px;
  bottom: -30px;
  width: 2px;
  background-color: #E4E7ED;
}

.follow-item:last-child .timeline-line {
  display: none;
}

.follow-content {
  flex: 1;
  background-color: #F5F7FA;
  border-radius: 4px;
  padding: 15px;
}

.follow-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.follow-time {
  font-size: 14px;
  color: #409EFF;
  font-weight: bold;
}

.follow-info {
  margin-bottom: 10px;
}

.info-row {
  display: flex;
  gap: 20px;
  color: #666;
  margin-bottom: 5px;
}

.follow-desc {
  color: #333;
  line-height: 1.5;
  white-space: pre-wrap;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #909399;
  font-size: 14px;
  background-color: #f5f7fa;
  border-radius: 4px;
}
</style> 