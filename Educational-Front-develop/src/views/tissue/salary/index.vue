<template>
  <div class="flex h-full">
    <!-- 左侧组织树卡片 - 占30%宽度 -->
    <el-card class="org-tree-card w-[30%] flex-shrink-0 h-full">
      <span>组织机构树形</span>
      <el-tree ref="treeRef" :data="data" show-checkbox node-key="id" @check-change="handleCheck" />
      <!-- @check-change="handleCheck" -->

    </el-card>
    <!-- 右侧薪资列表 - 占70%宽度 -->
    <div class="salary-list bg-aquamarine w-[70%] h-full p-4 overflow-auto">
      <h3 class="font-bold mb-3">薪资列表</h3>
      <el-table ref="tableRef" v-loading="loading" :data="salaryList" style="width: 100%" @selection-change="ToAll">
        <el-table-column type="index" label="序号" width="80" />
        <template v-for="col in allColumns" :key="col.prop">
          <el-table-column v-if="checkedProps.includes(col.prop)" :prop="col.prop" :label="col.label">
            <template v-if="col.prop === 'basicSalaryType'" #default="{ row }">
              <el-tag :type="row.basicSalaryType === 0 ? 'success' : 'warning'">
                {{ row.basicSalaryType === 0 ? "非底薪模式" : "底薪模式" }}
              </el-tag>
            </template>
            <template v-else-if="col.prop === 'classHourDuration'" #default="{ row }">
              <span v-if="row.classHourDuration != 0">{{ row.classHourDuration }}分钟</span>
              <span v-else-if="row.classHourDuration === 0"> </span>
            </template>
            <template v-else-if="col.prop === 'classHourFee'" #default="{ row }">
              <span v-if="row.classHourFee != 0">{{ row.classHourDuration }}元</span>
              <span v-else-if="row.classHourFee === 0"> </span>
            </template>
            <template v-else-if="col.prop === 'assistantFee'" #default="{ row }">
              <span v-if="row.assistantFee != 0">{{ row.classHourDuration }}元</span>
              <span v-else-if="row.assistantFee === 0"> </span>
            </template>
          </el-table-column>
        </template>
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button size="small" @click="showEditDialog(row)">修改</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { getSalaryList } from "@/api/SalaryManager/Salary";
import { getOrganizationTree } from "@/api/organization/organization.api";
import { ref, reactive, onMounted, nextTick } from "vue";
import moment from "moment";
const loading = ref(false);
const total = ref(0);
const salaryList = ref([]);
const queryParams = reactive({
  OrganizationId: "",
  PageIndex: 1,
  PageSize: 10,
})
const allColumns = [
  { label: "主键", prop: "id", show: false },
  { label: "姓名主键", prop: "staffId", show: false },
  { label: "姓名或电话", prop: "staffName", show: true },
  { label: "薪资模式", prop: "basicSalaryType", show: true },
  { label: "底薪", prop: "basicSalary", show: true },
  { label: "达标课时数", prop: "qualifiedClassHours", show: true },
  { label: "课时时长", prop: "classHourDuration", show: true },
  { label: "课时费", prop: "classHourFee", show: true },
  { label: "助教费", prop: "assistantFee", show: true },
];
const checkedProps = ref(allColumns.filter((c) => c.show).map((c) => c.prop));
onMounted(async () => {
  getSalary();//薪资
  // getOrganizationTreelist();//组织树形
  //data.value = response; console.log("获取机构信息", data.value);
  // console.log("组件已挂载，treeRef 状态：", treeRef.value ? "正常" : "异常");
})
// 获取选中节点

const handleCheck = () => {
  const keys = treeRef.value;
  console.log("选中变化时获取：", keys || "ref 未绑定");
};
//组织机构树形
const treeRef = ref(null);
const data = ref([]);
//组织机构树形
const getOrganizationTreelist = () => {
  loading.value = true;
  try {
    const response = getOrganizationTree({ parentId: "00000000-0000-0000-0000-000000000000" });
    if (response.value) {
      debugger;
      data.value = response.data || []
      console.log('获取组织机构树形成功:', response)
    } else {
      loading.value = false
      console.error('获取组织机构树形失败:', error)
    }
  } catch (error) {
    console.error(error);
  }

}
// // 等待弹窗和树渲染后设置选中
// await nextTick();
// if (treeRef.value && data.value.length) {
//   const checkedIds = findIdsByNames(data.value, orgNames);
//   treeRef.value.setCheckedKeys(checkedIds);
// }
// 
//获取薪资列表
const getSalary = async () => {
  try {
    loading.value = true;
    const params = {
      OrganizationId: queryParams.OrganizationId,
      PageIndex: queryParams.PageIndex,
      PageSize: queryParams.PageSize,
    };
    const response = await getSalaryList(params);
    console.log("接口返回", response);
    salaryList.value = response.data;
    total.value = response.totleCount;
  } catch (error) {
    ElMessage.error("获取薪资列表失败");
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.flex {
  display: flex;
}

.h-full {
  height: 100%;
}

.w-\[30\%\] {
  width: 20%;
}

.w-\[70\%\] {
  width: 80%;
}

.flex-shrink-0 {
  flex-shrink: 0;
}

.p-4 {
  padding: 1rem;
}

.font-bold {
  font-weight: bold;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.overflow-auto {
  overflow: auto;
}

.overflow-y-auto {
  overflow-y: auto;
}

.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.org-tree-card {
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
  font-weight: bold;
}

.tree-content {
  padding: 16px;
}

.text-item {
  margin-bottom: 8px;
  padding: 8px;
  border-radius: 4px;
  background-color: #f5f7fa;
  transition: background-color 0.3s;
}

.text-item:hover {
  background-color: #e4e7ed;
}

.card-footer {
  padding: 16px;
  border-top: 1px solid #ebeef5;
  text-align: center;
  color: #909399;
  font-size: 14px;
}
</style>
