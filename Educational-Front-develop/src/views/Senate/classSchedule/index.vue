<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="filter-container">
      <el-card class="box-card">
        <el-form :inline="true" :model="queryParams" class="demo-form-inline">
          <el-form-item label="分校">
            <el-select v-model="queryParams.organizationId" placeholder="请输入分校名称" style="width: 150px">
              <el-option v-for="item in organizationList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="课程名称">
            <el-input v-model="queryParams.CourseName" placeholder="请输入课程名称" style="width: 150px" class="filter-item" />
          </el-form-item>
          <el-form-item label="班级名称">
            <el-select v-model="queryParams.ClassId" placeholder="请输入班级名称" style="width: 150px">
              <el-option v-for="item in classList" :key="item.id" :label="item.className" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="ShowClassSchedule">查询</el-button>
            <el-button @click="reset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 数据表格 -->
    <el-card class="box-card">
      <!-- 操作按钮区域 -->
      <el-button type="primary" @click="AddUpdate">新增计划</el-button>
      <el-button type="success" @click="handleBatchSchedule">批量生成课表</el-button>
      <el-button type="warning" @click="handleGenerateTimetable">冲突检查</el-button>
      <el-button type="danger" :disabled="multiple" @click="handleBatchDelete">生成课表</el-button>
      <el-button type="danger" :disabled="multiple" @click="handleBatchDelete">批量删除已生成课表</el-button>
      <el-table ref="tableRef" v-loading="loading" :data="tableData" style="width: 100%" border
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <!-- 动态渲染列 -->
        <template v-for="col in allColumns" :key="col.prop">
          <el-table-column v-if="checkedProps.includes(col.prop)" :prop="col.prop" :label="col.label">
            <template v-if="col.prop === 'isTimetableGenerated'" #default="{ row }">
              {{ row.isTimetableGenerated === true ? "已生成" : "未生成" }}
            </template>
            <template v-else-if="col.prop === 'hasSchedulingConflict'" #default="{ row }">
              <el-dropdown v-if="row.hasSchedulingConflict === false" trigger="hover">
                <el-tag :type="row.hasSchedulingConflict === false ? 'success' : 'info'">
                  {{ row.hasSchedulingConflict === false ? "无冲突" : "有冲突" }}
                </el-tag>
                <template #dropdown>
                  <el-dropdown-item>
                    有冲突，大大的冲突，一会给你哈--冲突显示表
                  </el-dropdown-item>
                </template>
              </el-dropdown>
            </template>

            <template v-else-if="col.prop === 'startDate'" #default="{ row }">
              {{ row.startDate ? moment(row.startDate).format("YYYY-MM-DD") : "" }}
            </template>
            <template v-else-if="col.prop === 'endDate'" #default="{ row }">
              {{ row.endDate ? moment(row.endDate).format("YYYY-MM-DD") : "" }}
            </template>
            <template v-else-if="col.prop === 'skipHolidays'" #default="{ row }">
              {{ row.skipHolidays === false ? "是" : "否" }}
            </template>
          </el-table-column>
        </template>


        <!-- 操作列 -->
        <el-table-column label="操作" width="60" align="center" fixed="right">
          <template #default="scope">
            <el-button v-if="scope.row.isTimetableGenerated === false" type="primary" link
              @click="AddUpdate(scope.row)">编辑</el-button>
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

    <!-- 新增/编辑排课 -->
    <el-drawer v-model="drawer" :title="title" size="800px" :with-header="true" close-on-press-escape>
      <el-form ref="formRef" :model="scheduleForm" :rules="rules" label-width="120px" style="padding: 20px;">
        <el-row :gutter="20">
          <el-col :span="20">
            <el-form-item label="所属分校" prop="organizationName">
              <el-select v-model="scheduleForm.organizationName" placeholder="请选择组织机构">
                <el-option v-for="item in organizationList" :key="item.id" :label="item.name" :value="item.name" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="20">
            <el-form-item label="班级" prop="className">
              <el-select v-model="scheduleForm.className" placeholder="请选择班级">
                <el-option v-for="item in classList" :key="item.id" :label="item.className" :value="item.className" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="20">
            <el-form-item label="课程" prop="courseName">
              <el-select v-model="scheduleForm.courseName" placeholder="请选择课程" style="width: 100%">
                <el-option v-for="item in courseList" :key="item.id" :label="item.courseName"
                  :value="item.courseName" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="20">
            <el-form-item label="上课教师" prop="mainTeacher">
              <el-select v-model="scheduleForm.mainTeacher" placeholder="请输入讲师名称" style="width: 100%">
                <el-option v-for="item in teacherList" :key="item.id" :label="item.staffName" :value="item.staffName" />
              </el-select>
              <!-- <el-dropdown trigger="click">
                <el-input v-model="queryParams.mainTeacher" placeholder="请输入讲师名称" style="width: 480px" />
                <template #dropdown>
                  <el-dropdown-item>
                    老师表
                  </el-dropdown-item>
                </template>
              </el-dropdown> -->

            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="20">
            <el-form-item label="助教" prop="assistantTeacher">
              <el-select v-model="scheduleForm.assistantTeacher" placeholder="请输入助教名称" style="width: 100%">
                <el-option v-for="item in teacherList" :key="item.id" :label="item.staffName" :value="item.staffName" />
              </el-select>
              <!-- <el-dropdown trigger="click">
                <el-input v-model="queryParams.assistantTeacher" placeholder="请输入助教名称" style="width: 480px" />
                <template #dropdown>
                  <el-dropdown-item>
                    老师表
                  </el-dropdown-item>
                </template>
              </el-dropdown> -->

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
            <el-form-item label="限制上课人数" prop="maxAttendees">
              <el-input-number v-model="scheduleForm.maxAttendees" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 哈哈哈 -->
        <el-row :gutter="20">
          <el-col :span="20">
            <el-form-item label="计划排课次数" prop="maxSchedules">
              <el-input-number v-model="scheduleForm.maxSchedules" :min="1" :max="100" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="跳过节假日" prop="skipHolidays">
              <el-switch v-model="scheduleForm.skipHolidays" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider>上课时间</el-divider>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-button type="primary" style="margin-bottom: 12px;float:right;" @click="addRow">添 加</el-button>
            <br>
            <!-- 动态行列表 -->
            <div class="border border-slate-200 rounded-lg overflow-hidden">
              <!-- 表头 -->
              <div
                class="flex items-center bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 border-b border-slate-200">
                <div class="w-120 ml-2">星期</div>
                <div class="w-120 ml-2">开始时间</div>
                <div class="w-120 ml-2">结束时间</div>
                <div class="w-120 ml-2">教室</div>
                <div class="w-120 ml-2">操作</div>
              </div>
              <!-- 数据行 -->
              <div v-for="(row, index) in rows" :key="index"
                class="flex items-center px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <!-- 星期 -->
                <el-select v-model="row.classHourDuration" placeholder="请选择" class="w-120 ml-2">
                  <el-option :value="0">星期日</el-option>
                  <el-option :value="1">星期一</el-option>
                  <el-option :value="2">星期二</el-option>
                  <el-option :value="3">星期三</el-option>
                  <el-option :value="4">星期四</el-option>
                  <el-option :value="5">星期五</el-option>
                  <el-option :value="6">星期六</el-option>
                </el-select>
                <!-- 开始时间 -->
                <el-input v-model.number="row.classHourFee" class="w-120 ml-2" />

                <!--结束时间 -->
                <el-input v-model.number="row.assistantFee" class="w-120 ml-2" />

                <!-- 教室 -->
                <el-select v-model="scheduleForm.courseName" class="w-120 ml-2">
                  <el-option v-for="item in classroomList" :key="item.id" :label="item.classRoomName"
                    :value="item.id" />
                </el-select>
                <!-- 删除按钮 -->
                <el-button type="danger" class="w-120 ml-2" :disabled="rows.length === 1" @click="deleteRow(index)">删
                  除</el-button>
              </div>
            </div>
            <el-button type="primary" style="float: left;" @click="SubmitButton">提交</el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-col>
        </el-row>

      </el-form>
    </el-drawer>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus";
import { getClassSchedule, addClassSchedule } from '@/api/Senate/classSchedule/classSchedule';
import { getOrganizationDropdown } from '@/api/Organization/organization.api';
import { getCourseDropdown } from '@/api/Lession/CourseManager/Course';
import { selectClassRoom } from '@/api/Senate/classroom.api';
import { getstaffList } from '@/api/Lession/TopicManager/TopicManager';
import { selectClassInfo } from '@/api/Senate/clbum.api';
import moment from 'moment';
// 动态行数据（响应式）
const rows = ref([
  {
    classHourDuration: '',     // 课时时长（关联下拉框）
    classHourFee: 0,      // 课时费（数字类型）
    assistantFee: 0,  // 助教费（数字类型）
  }
])
const durationOptions = ref({

})
onMounted(() => {
  getorganizationList();
  getteacherList();
  getcourseList();
  getclassList();
  getclassroomList();
  ShowClassSchedule();
})
const loading = ref(false);
//查询课程data表单
const tableData = ref();
const total = ref();
const allColumns = [
  { label: "课表生成", prop: "isTimetableGenerated", show: true },
  { label: "冲突", prop: "hasSchedulingConflict", show: true },
  { label: "分校", prop: "organizationName", show: true },
  { label: "班级名称", prop: "className", show: true },
  { label: "所属课程", prop: "courseName", show: true },
  { label: "上课老师", prop: "mainTeacher", show: true },
  { label: "助教", prop: "assistantTeacher", show: true },
  { label: "开始日期", prop: "startDate", show: true },
  { label: "结束日期", prop: "endDate", show: true },
  { label: "上课时间", prop: "scheduleTimes", show: true },
  { label: "计划课次", prop: "maxSchedules", show: true },
  { label: "已生成课次", prop: "generatedSessionCount", show: true },
  { label: "限制人数", prop: "maxAttendees", show: true },
  { label: "消渴基数", prop: "consumptionBase", show: true },
  { label: "不含节日", prop: "skipHolidays", show: true },
];
const checkedProps = ref(allColumns.filter((c) => c.show).map((c) => c.prop));

//重置方法  
const getInitialState = () => ({
  organizationId: "",
  ClassId: "",
  CourseName: "",
  PageIndex: 1,
  PageSize: 10
});

const queryParams = ref(getInitialState());
const reset = () => {
  queryParams.value = getInitialState(); // 每次生成全新对象
  ShowClassSchedule();
};

//查询方法
const ShowClassSchedule = () => {
  loading.value = true
  getClassSchedule({
    organizationId: queryParams.value.organizationId,
    ClassId: queryParams.value.ClassId,
    CourseName: queryParams.value.CourseName,
    PageIndex: queryParams.value.PageIndex,
    PageSize: queryParams.value.PageSize
  }).then(response => {
    tableData.value = response.data || []
    total.value = response.totleCount
    loading.value = false
    console.log("获取排课列表成功", response);
  }).catch(error => {
    console.error('获取排课列表失败:', error)
    loading.value = false
  })
}
const organizationList = ref({})
const teacherList = ref({})
const courseList = ref({})
const classList = ref({})
const classroomList = ref({})
//组织下拉
const getorganizationList = () => {
  getOrganizationDropdown().then(response => {
    organizationList.value = response || [];
    console.log("shdofjo", response);
    debugger;
  })
}
//老师下拉
const getteacherList = () => {
  getstaffList().then(response => {
    teacherList.value = response || [];
  })
}
//课程下拉
const getcourseList = () => {
  //courseName
  //id
  //  /GetCourseAsync
  getCourseDropdown().then(response => {
    courseList.value = response || [];
  })
}
//班级下拉
const getclassList = () => {
  //  /api/app/class-info/class
  //className
  //id
  selectClassInfo().then(response => {
    classList.value = response || [];
  })
}
//教室下拉
const getclassroomList = () => {
  //classRoomName
  //id
  //  /api/app/class-room/class-room
  selectClassRoom().then(response => {
    classroomList.value = response || [];
  })
}

const selectedIdList = ref<string[]>([])
const multiple = ref(true);
// 多选框选中数据
const handleSelectionChange = (selection: any[]) => {
  selectedIdList.value = selection.map(item => item.id)
  multiple.value = !selection.length
}
//批量删除失败


const title = ref("");
const drawer = ref(false);
const scheduleForm = reactive({
  id: "",
  organizationName: "",
  className: "",
  courseName: "",
  mainTeacher: [],
  assistantTeacher: [],
  startDate: "",
  endDate: "",
  consumptionBase: 1,
  maxAttendees: 0,
  maxSchedules: 0,
  skipHolidays: 0,
  isTimetableGenerated: false,
  hasSchedulingConflict: false,
  generatedSessionCount: false,
  scheduleTimes: []
});

//添加按钮/修改按钮操作
const AddUpdate = (row: any) => {
  console.log("anniu", row);
  if (row == null) {
    //添加按钮操作
    title.value = "添加排课计划";
  }
  else {
    //修改按钮操作
    title.value = "修改排课计划";
    Object.assign(scheduleForm, row);//浅层copy
    //查询排课计划表的上课时间表==》方法（scheduleForm.id）；
    //scheduleForm.scheduleTimes=方法的反填
  }
  drawer.value = true;
}
// 添加一行
const addRow = () => {
  rows.value.push({
    classHourDuration: '',
    classHourFee: 0,
    assistantFee: 0,
  })
}
// 删除一行（保留至少一行）
const deleteRow = (index: number) => {
  if (rows.value.length === 1) return // 禁止删除最后一行
  rows.value.splice(index, 1)
}
//添加删除提交按钮
const SubmitButton = () => {

}
</script>

<style scoped>
.flex items-center px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors {
  width: 800px;

}

.w-120 {
  width: 200px;
}
</style>
