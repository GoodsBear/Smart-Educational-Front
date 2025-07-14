<template>
  <div class="enrollment-management">
    <!-- 搜索栏 -->
    <el-card>
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="学员姓名：">
          <el-input v-model="queryParams.Name" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="开始日期：">
          <el-date-picker v-model="queryParams.StartTime" type="date" placeholder="请选择" clearable />
        </el-form-item>
        <el-form-item label="有效期：">
          <el-date-picker v-model="queryParams.EndTime" type="date" placeholder="请选择" clearable />
        </el-form-item>
        <el-form-item label="课程：">
          <el-select v-model="queryParams.CourseId" placeholder="请选择" style="width: 200px;">
            <el-option v-for="item in coursename" :key="item.id" :label="item.courseName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="经办人：">
          <el-select v-model="queryParams.Consultant" placeholder="请选择" style="width: 200px;">
            <el-option v-for="item in staffname" :key="item.id" :label="item.staffName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <!-- 操作栏和表格 -->
    <el-card style="margin-top: 10px">
      <div class="table-header-bar">
        <div class="table-title">报名记录列表</div>
        <div class="operation-area">
          <el-button type="success" @click="fetchEnrollmentList">刷新</el-button>
        </div>
      </div>
      <el-table ref="tableRef" :data="enrollmentList" border style="width: 100%"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="enrollmentDate" label="报名时间" width="150">
          <template #default="{ row }">
            {{ moment(row.enrollmentDate).format("YYYY-MM-DD") }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="学生" width="100" />
        <el-table-column prop="courseName" label="课程" width="120" />
        <el-table-column prop="subjectName" label="科目" width="100" />
        <el-table-column prop="staffName" label="经办人" width="100" />
        <el-table-column prop="bugLessons" label="购买课时" width="100" />
        <!-- <el-table-column prop="unitPrice" label="单价" width="80" /> -->
        <el-table-column prop="lessonPrice" label="合计金额" width="100" />
        <el-table-column prop="factGetPrice" label="实付金额" width="100" />
        <!-- <el-table-column prop="arrears" label="欠费" width="80" /> -->
        <el-table-column prop="startTime" label="开始日期" width="120">
          <template #default="{ row }">
            {{ moment(row.startTime).format("YYYY-MM-DD") }}
          </template>
        </el-table-column>
        <el-table-column prop="validTime" label="有效期至" width="120">
          <template #default="{ row }">
            {{ moment(row.validTime).format("YYYY-MM-DD") }}
          </template>
        </el-table-column>
        <!-- <el-table-column prop="recordTypeName" label="审核状态" width="100" /> -->
        <el-table-column prop="refundMoney" label="退费金额" width="100" />
        <el-table-column prop="refundNumber" label="退费应收款" width="100" />
        <el-table-column prop="refundDesc" label="退费说明" width="120" />
      </el-table>
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination v-model:current-page="pageParams.pageIndex" v-model:page-size="pageParams.pageSize"
          :total="pageParams.totalCount" :page-sizes="[10, 20, 30, 50]" layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getEnrollmentRecordList } from '@/api/StudentsManager/Student/enrollment';
import moment from 'moment';
import api from '@/api/StudentsManager/Staff/Staff'
import { getCourseDropdown } from '@/api/Lession/CourseManager/Course'
//经办人下拉
let staffname = ref([{
  id: "",
  staffName: ""
}])
const Selectstaff = () => {
  api.getStaffList().then((res) => {
    console.log("班主任下拉=>", res);
    staffname.value = res;
  })
}
//课程下拉
let coursename = ref([{
  id: "",
  courseName: ""
}])
const Selectcourse = () => {
  getCourseDropdown().then((res) => {
    console.log("课程下拉=>", res);
    coursename.value = res;
  })
}
const queryParams = reactive({
  Name: '',
  StartTime: '',
  EndTime: '',
  CourseId: '',
  Consultant: '',
});
const handleReset = () => {
  queryParams.Name = '';
  queryParams.StartTime = '';
  queryParams.EndTime = '';
  queryParams.CourseId = '';
  queryParams.Consultant = '';
  pageParams.pageIndex = 1;
  fetchEnrollmentList();
};
const pageParams = reactive({
  pageIndex: 1,
  pageSize: 20,
  totalCount: 0,
});
const enrollmentList = ref<any[]>([]);
const selectedIds = ref<string[]>([]);

// 查询
const handleQuery = () => {
  pageParams.pageIndex = 1;
  fetchEnrollmentList();
};

const fetchEnrollmentList = async () => {
  const params = {
    PageIndex: pageParams.pageIndex,
    PageSize: pageParams.pageSize,
    Name: queryParams.Name,
    StartTime: queryParams.StartTime,
    EndTime: queryParams.EndTime,
    CourseId: queryParams.CourseId,
    Consultant: queryParams.Consultant
  };
  const res = await getEnrollmentRecordList(params);
  enrollmentList.value = res.data;
  console.log("报名记录=>", res);
};
const handleSizeChange = (val: number) => {
  pageParams.pageSize = val;
  fetchEnrollmentList();
};
const handleCurrentChange = (val: number) => {
  pageParams.pageIndex = val;
  fetchEnrollmentList();
};
const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map(item => item.id);
};
const handleBatchEnroll = () => {
  ElMessage.info('批量报名功能待实现');
};
const handleBatchDelete = () => {
  if (!selectedIds.value.length) {
    ElMessage.warning('请先选择要删除的记录！');
    return;
  }
  ElMessageBox.confirm('确认删除选中的报名记录吗?', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    // 调用批量删除API
    ElMessage.success('删除成功');
    fetchEnrollmentList();
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
};



onMounted(() => {
  fetchEnrollmentList();
  Selectstaff();
  Selectcourse();
});
</script>

<style scoped>
.enrollment-management {
  padding: 24px;
  background: #fafafa;
  min-height: 100vh;
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
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-container {
  margin-top: 16px;
  text-align: left;
}
</style>
