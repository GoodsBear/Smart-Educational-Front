<template>
  <div class="clbum-detail">
    <el-card>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="班级信息" name="info">
          <div class="base-info">
            <el-descriptions title="基本信息" :column="3" border>
              <el-descriptions-item label="班级名称">{{ classInfo.className }}</el-descriptions-item>
              <el-descriptions-item label="课程名称">{{ classInfo.courseName }}</el-descriptions-item>
              <el-descriptions-item label="科目">{{ classInfo.subjectName }}</el-descriptions-item>
              <el-descriptions-item label="班级代码">
                <el-image :src="classInfo.classQrCode" style="width: 50px;height: 50px;"></el-image>
              </el-descriptions-item>
              <el-descriptions-item label="教室">{{ classInfo.classRoomName }}</el-descriptions-item>
              <el-descriptions-item label="教师">{{ classInfo.staffName }}</el-descriptions-item>
              <el-descriptions-item label="计划招生人数">{{ classInfo.preNum }}</el-descriptions-item>
              <el-descriptions-item label="计划课时数">{{ classInfo.lessonNum }}</el-descriptions-item>
              <el-descriptions-item label="计划开班日期">
                {{ moment(classInfo.planOpenDate).format("YYYY-MM-DD") }}
              </el-descriptions-item>
              <el-descriptions-item label="当前学生数">{{ currentStudentNum }}</el-descriptions-item>
              <el-descriptions-item label="已上课课时">{{ classInfo.lessonFinishedNum }}</el-descriptions-item>
              <el-descriptions-item label="计划结业日期">
                {{ moment(classInfo.planCloseDate).format("YYYY-MM-DD") }}
              </el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ classInfo.creationTime }}</el-descriptions-item>
              <el-descriptions-item label="状态">{{ classInfo.classStatusName }}</el-descriptions-item>
              <el-descriptions-item label="排课备注">{{ classInfo.courseRemark }}</el-descriptions-item>
            </el-descriptions>
          </div>
          <div class="student-list">
            <div class="table-header-bar">
              <div class="table-title">学员列表</div>
              <div class="operation-area">
                <el-button type="primary">添加在学学员</el-button>
                <el-button>转默认课程班学员</el-button>
                <el-button>从班级移除</el-button>
                <el-button>批量调整课程</el-button>
              </div>
            </div>
            <el-table :data="studentList" style="width: 100%">
              <el-table-column prop="studentName" label="学员姓名" />
              <el-table-column prop="phone" label="联系电话" />
              <el-table-column prop="gender" label="性别" />
              <el-table-column prop="age" label="年龄" />
              <el-table-column prop="courseName" label="默认课程" />
              <el-table-column prop="lessonCount" label="剩余课时" />
            </el-table>
            <div class="pagination-container">
              <el-pagination v-model:current-page="studentPage.page" v-model:page-size="studentPage.pageSize"
                :total="studentPage.total" layout="total, prev, pager, next, sizes" @current-change="fetchStudentList"
                @size-change="fetchStudentList" />
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="班级课表" name="schedule">
          <div class="schedule-filter">
            <el-form :inline="true" :model="scheduleQuery">
              <el-form-item label="开始日期">
                <el-date-picker v-model="scheduleQuery.startDate" type="date" placeholder="选择日期" />
              </el-form-item>
              <el-form-item label="结束日期">
                <el-date-picker v-model="scheduleQuery.endDate" type="date" placeholder="选择日期" />
              </el-form-item>
              <el-form-item label="课程名称">
                <el-input v-model="scheduleQuery.courseName" placeholder="请输入课程名称" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="fetchScheduleList">查询</el-button>
                <el-button @click="resetScheduleQuery">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
          <el-table :data="scheduleList" style="width: 100%">
            <el-table-column prop="date" label="上课日期" />
            <el-table-column prop="className" label="班级名称" />
            <el-table-column prop="courseName" label="课程名称" />
            <el-table-column prop="lessonNum" label="课次" />
            <el-table-column prop="teacherName" label="教师" />
            <el-table-column prop="assistant" label="助教" />
            <el-table-column prop="studentCount" label="学生数" />
            <el-table-column prop="lessonCount" label="课时数" />
            <el-table-column prop="attendance" label="到课人数" />
            <el-table-column prop="status" label="状态" />
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button type="text">编辑</el-button>
                <el-button type="text">点名</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-container">
            <el-pagination v-model:current-page="schedulePage.page" v-model:page-size="schedulePage.pageSize"
              :total="schedulePage.total" layout="total, prev, pager, next, sizes" @current-change="fetchScheduleList"
              @size-change="fetchScheduleList" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { FTClassInfo } from '@/api/Senate/clbum.api'
import moment from 'moment'

const route = useRoute()
const id = route.query.id
console.log("id=>", id);

const activeTab = ref('info')

const classInfo = ref({
  id: "",
  className: '',
  campusId: "",
  name: '',
  gradeId: "",
  gradeName: "",
  classTeacherId: "",
  staffName: "",
  preNum: 0,
  preCourseNum: 0,
  defaultCourseId: "",
  courseName: "",
  defaultClassroomId: "",
  subjectName: "",
  lessonNum: "",
  classRoomName: "",
  planOpenDate: "",
  planCloseDate: "",
  classQrCode: "",
  courseRemark: "",
  classStatus: 0,
  classStatusName: "",
  lastModificationTime: "",
  lastModifierId: "",
  creationTime: "",
  creatorId: ""
})
onMounted(() => {
  Ftclbum();
  fetchStudentList()
  fetchScheduleList()
})
const Ftclbum = async () => {
  // 获取班级详情
  const res = await FTClassInfo(id)
  console.log("获取班级详情=>", res);
  classInfo.value = res;
}
const studentList = ref([])
const currentStudentNum = computed(() => studentList.value.length)
const studentPage = reactive({ page: 1, pageSize: 20, total: 0 })
const fetchStudentList = () => {
  // TODO: 调用API获取学员列表
}

const scheduleQuery = reactive({
  startDate: '',
  endDate: '',
  courseName: ''
})
const scheduleList = ref([])
const schedulePage = reactive({ page: 1, pageSize: 20, total: 0 })
const fetchScheduleList = () => {
  // TODO: 调用API获取课表
}
const resetScheduleQuery = () => {
  scheduleQuery.startDate = ''
  scheduleQuery.endDate = ''
  scheduleQuery.courseName = ''
  fetchScheduleList()
}
</script>

<style scoped>
.clbum-detail {
  padding: 24px;
  background: #fafafa;
  min-height: 100vh;
}

.base-info {
  margin-bottom: 24px;
}

.student-list {
  margin-top: 24px;
}

.table-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.table-title {
  font-size: 18px;
  font-weight: bold;
}

.operation-area {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-container {
  margin-top: 16px;
  text-align: left;
}

.schedule-filter {
  margin-bottom: 16px;
}
</style>