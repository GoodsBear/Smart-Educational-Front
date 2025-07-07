<template>
  <div class="material-log-management">
    <!-- 搜索栏 -->
    <el-card style="max-width: 10000px">
      <div class="search-bar">
        <el-form :inline="true" :model="queryParams">
          <el-form-item label="选择物料：">
            <el-select v-model="queryParams.MaterialId" placeholder="请选择" style="width: 200px;">
              <el-option v-for="item in materialname" :key="item.id" :label="item.materialName" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="涉及学生：">
            <el-select v-model="queryParams.StudentId" placeholder="请选择" style="width: 200px;">
              <el-option v-for="item in studentname" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="申请员工：">
            <el-select v-model="queryParams.StaffId" placeholder="请选择" style="width: 200px;">
              <el-option v-for="item in staffname" :key="item.id" :label="item.staffName" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="变动类型：">
            <el-select v-model="queryParams.ChangeType" placeholder="请选择" style="width: 200px;">
              <el-option label="入库" :value="0" />
              <el-option label="出库" :value="1" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <span>开始时间：</span>
            <el-date-picker v-model="queryParams.startTime" type="date" placeholder="开始日期" clearable />
            &nbsp;- &nbsp;
            <span>结束时间：</span>
            <el-date-picker v-model="queryParams.endTime" type="date" placeholder="结束日期" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchMaterialLogList">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card style="max-width: 10000px;margin-top: 10px">
      <!-- 表格标题和操作按钮区 -->
      <div class="table-header-bar">
        <div class="table-title">物料变动日志</div>
        <div class="operation-area">
          <el-button type="success" @click="fetchMaterialLogList">刷新</el-button>
        </div>
      </div>
      <!-- 物料变动日志表格 -->
      <el-table :data="materialLogList" style="width: 100%">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column label="物料名" prop="materialName" min-width="120" />
        <el-table-column label="变动数量" prop="changeSum" min-width="100" />
        <el-table-column label="申请员工：" prop="staffName" min-width="100" />
        <el-table-column label="涉及学生" prop="studentName" min-width="100" />
        <el-table-column label="变动类型" prop="changeTypeName" min-width="100" />
        <el-table-column label="原因" prop="reason" min-width="150" />
        <el-table-column label="变动时间" prop="changeDate" min-width="180">
          <template #default="{ row }">
            {{ moment(row.changeDate).format("YYYY-MM-DD HH:mm:ss") }}
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="pagination-container">
        <Pagination v-model:total="pageParams.TotalCount" v-model:page="pageParams.PageIndex"
          v-model:limit="pageParams.PageSize" @pagination="handlePagination" />
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import Pagination from '@/components/Pagination/index.vue';
import moment from "moment";
import { getMaterialRetordList, materialRetordIn, materialRetordOut } from '@/api/Materials/storerooms.api';
import { selectMaterial } from "@/api/Materials/material.api";
import studentApi from '@/api/StudentsManager/Student/Student'
import staffAPI from '@/api/StudentsManager/Staff/Staff'
// 数据列表
const materialLogList = ref<any[]>([]);
// 查询参数
const queryParams = reactive({
  MaterialId: "",
  StudentId: "",
  StaffId: "",
  ChangeType: "",
  startTime: "",
  endTime: ""
});
const pageParams = reactive({
  PageIndex: 1,
  PageSize: 10,
  TotalCount: 0,
  TotalPage: 0
});
// 查询
const handleQuery = () => {
  pageParams.PageIndex = 1;
  fetchMaterialLogList();
};
//重置查询
const handleReset = () => {
  queryParams.MaterialId = "";
  queryParams.StudentId = "";
  queryParams.StaffId = "";
  queryParams.ChangeType = "";
  queryParams.startTime = "";
  queryParams.endTime = "";
  pageParams.PageIndex = 1;
  fetchMaterialLogList();
};
// 获取列表
const fetchMaterialLogList = () => {
  const params: any = {
    pageIndex: pageParams.PageIndex,
    pageSize: pageParams.PageSize,
    MaterialId: queryParams.MaterialId,
    StudentId: queryParams.StudentId,
    StaffId: queryParams.StaffId,
    ChangeType: queryParams.ChangeType,
    startTime: queryParams.startTime,
    endTime: queryParams.endTime,
  };
  getMaterialRetordList(params).then((res) => {
    console.log("物料变动日志列表=>", res);
    materialLogList.value = res.data;
    pageParams.TotalCount = res.totleCount;
    pageParams.TotalPage = res.totlePage;
  });
};
// 分页
const handlePagination = ({ page, limit }: { page: number; limit: number }) => {
  pageParams.PageIndex = page;
  pageParams.PageSize = limit;
  fetchMaterialLogList();
};

//物料下拉
let materialname = ref([{
  id: "",
  materialName: ""
}])
const materialSelect = () => {
  selectMaterial().then((res) => {
    console.log("物料下拉=>", res);
    materialname.value = res;
  })
}
//学员下拉
let studentname = ref([{
  id: "",
  name: ""
}])
const studentSelect = () => {
  studentApi.SelectStudent().then((res) => {
    console.log("学员下拉=>", res);
    studentname.value = res;
  })
}
//成员下拉
let staffname = ref([{
  id: "",
  staffName: ""
}])
const staffSelect = () => {
  staffAPI.getStaffList().then((res) => {
    console.log("学员下拉=>", res);
    staffname.value = res;
  })
}

onMounted(() => {
  fetchMaterialLogList();
  materialSelect();
  studentSelect();
  staffSelect();
});
</script>

<style scoped>
.material-log-management {
  padding: 24px;
  background: #fff;
  min-height: 100vh;
}

.search-bar {
  margin-bottom: 8px;
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
</style>
