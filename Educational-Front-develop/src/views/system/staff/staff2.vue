<template>
  <div class="staff-management">
    <!-- 搜索栏 Card -->
    <el-card class="table-card" shadow="never" style="width: 500px;">
      <div class="search-fields" style="width: 500px;">
        <el-form :inline="true" :model="queryParams" class="search-form">
          <el-form-item label="姓名">
            <el-input v-model="queryParams.StaffName" placeholder="请输入" clearable />
          </el-form-item>
        </el-form>
        <div class="search-btns">
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </div>
      </div>
      <!-- 信息列表 Card -->
      <!-- 员工列表 -->
      <el-table ref="tableRef" v-loading="loading" :data="staffList" style="width: 500px" @selection-change="ToAll">
        <template v-for="col in allColumns" :key="col.prop">
          <el-table-column v-if="checkedProps.includes(col.prop)" :prop="col.prop" :label="col.label">
          </el-table-column>
        </template>
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button size="small" @click="getStaffName(row.staffName)">选择</el-button>{{}}
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination v-model:current-page="queryParams.PageIndex" v-model:page-size="queryParams.PageSize"
          :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" :total="total"
          @size-change="fetchStaffList" @current-change="fetchStaffList" />
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import StaffAPI from "@/api/staff/staff.api"; // 导入您封装的API方法
import { getOrganizationTree } from "@/api/organization/organization.api";

// 类型定义
interface StaffQuery {
  StaffName?: string;
  Status?: number;
  PageIndex: number;
  PageSize: number;
}


// 数据状态
const loading = ref(false);
const staffList = ref<any[]>([]);
const total = ref(0);
const tableRef = ref<any>(null);

const data = ref([]);

const allColumns = [
  { label: "姓名", prop: "staffName", show: true },
  { label: "所属机构", prop: "organization", show: true },
];

const checkedProps = ref(allColumns.filter((c) => c.show).map((c) => c.prop));

// 查询参数
const queryParams = reactive<StaffQuery>({
  PageIndex: 1,
  PageSize: 10,
});





// 获取员工列表
const fetchStaffList = async () => {
  try {
    loading.value = true;
    const params = {
      StaffName: queryParams.StaffName,
      Status: queryParams.Status,
      PageIndex: queryParams.PageIndex,
      PageSize: queryParams.PageSize,
    };
    const response = await StaffAPI.getList(params);
    console.log("接口返回", response);

    staffList.value = response.data;
    total.value = response.totleCount;
  } catch (error) {
    ElMessage.error("获取员工列表失败");
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  queryParams.PageIndex = 1;
  fetchStaffList();
};

// 重置搜索
const resetSearch = () => {
  queryParams.StaffName = "";
  queryParams.Status = undefined;
  handleSearch();
};






const Delarr = ref([]);

const ToAll = (selection: any) => {
  console.log(selection);
  Delarr.value = selection.map((item: any) => item.id);
  console.log(Delarr.value);
};



const titleStaffName = defineModel('titleStaffName', {
  type: String,       // 类型验证
  default: '默认名称'  // 默认值  
});
// 获取titleStaffName
const getStaffName = (row: any) => {
  titleStaffName.value = row;
};

// 生命周期钩子
onMounted(async () => {
  fetchStaffList();
  const response = await getOrganizationTree("00000000-0000-0000-0000-000000000000");
  data.value = response;
  console.log("获取机构信息", data.value);
});
</script>

<style scoped>
.staff-management {
  padding: 20px;
}

.search-card {
  margin-bottom: 18px;
  border-radius: 8px;
  box-shadow: 0 2px 8px #f0f1f2;
}

.table-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px #f0f1f2;
}

.search-bar {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-fields {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.search-btns {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 16px;
}

.action-btns {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.status-select {
  width: 120px;
}

.avatar-uploader .avatar {
  width: 100px;
  height: 100px;
  display: block;
}
</style>
