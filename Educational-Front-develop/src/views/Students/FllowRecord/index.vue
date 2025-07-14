<template>
  <div class="follow-record-management">
    <!-- 搜索栏 -->
    <el-card>
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="学员姓名：">
          <el-input v-model="queryParams.Name" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="跟进阶段：">
          <el-select v-model="queryParams.FollowStageEnum" placeholder="请选择" clearable style="width: 140px">
            <el-option v-for="(label, value) in followStageOptions" :key="value" :label="label" :value="Number(value)" />
          </el-select>
        </el-form-item>
        <el-form-item label="跟进人：">
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
    <!-- 表格 -->
    <el-card style="margin-top: 10px">
      <!-- 表格标题和操作按钮区 -->
      <div class="table-header-bar">
        <div class="table-title">跟进记录列表</div>
        <div class="operation-area">
          <el-button @click="fetchFollowList" type="success">刷新</el-button>
          <el-button @click="showColumnDialog = true" type="primary">自定义显示列</el-button>
        </div>
      </div>
      <el-table :data="followList" border style="width: 100%">
        <el-table-column v-for="col in showColumns" :key="col.prop" :prop="col.prop" :label="col.label" :min-width="col.minWidth" :width="col.width">
          <template v-if="col.slot" #default="{ row }">
            <span v-if="col.prop === 'followStageEnum'">{{ followStageOptions[String(row.followStageEnum)] || '未知' }}</span>
            <span v-else-if="col.prop === 'getInTouchEnum'">{{ getInTouchOptions[String(row.getInTouchEnum)] || '未知' }}</span>
            <span v-else-if="col.prop === 'touchTIme'">{{ formatDate(row.touchTIme) }}</span>
            <span v-else-if="col.prop === 'nextTouchTime'">{{ formatDate(row.nextTouchTime) }}</span>
            <span v-else-if="col.prop === 'recordDate'">{{ formatDate(row.recordDate) }}</span>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pageParams.pageIndex"
          v-model:page-size="pageParams.pageSize"
          :total="pageParams.totalCount"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    <!-- 自定义显示列弹窗 -->
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

<script lang="ts" setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { getFollowrecordList } from '@/api/StudentsManager/Student/Follow';
import { formatDate } from '@/utils/date';
import api from '@/api/StudentsManager/Staff/Staff'
// 跟进阶段选项
const followStageOptions: Record<string, string> = {
  0: '丢失阶段',
  1: '目标客户阶段',
  2: '潜在客户阶段',
  3: '意向阶段',
  4: '认可阶段',
  5: '签约阶段',
  6: '售后阶段',
};
// 跟进方式选项
const getInTouchOptions: Record<string, string> = {
  0: '面谈',
  1: '电话联系',
  2: '在线沟通',
  3: '其他',
};
//跟进人下拉
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
// 查询参数
const queryParams = reactive({
  Name: '',
  FollowStageEnum: undefined,
  Consultant: '',
});
const pageParams = reactive({
  pageIndex: 1,
  pageSize: 20,
  totalCount: 0,
});
const followList = ref<any[]>([]);

// 查询
const handleQuery = () => {
  pageParams.pageIndex = 1;
  fetchFollowList();
};
const handleReset = () => {
  queryParams.Name = '';
  queryParams.FollowStageEnum = undefined;
  queryParams.Consultant = '';
  pageParams.pageIndex = 1;
  fetchFollowList();
};
const handleSizeChange = (val: number) => {
  pageParams.pageSize = val;
  fetchFollowList();
};
const handleCurrentChange = (val: number) => {
  pageParams.pageIndex = val;
  fetchFollowList();
};

// 获取跟进记录列表
const fetchFollowList = async () => {
  try {
    const params = {
      PageIndex: pageParams.pageIndex,
      PageSize: pageParams.pageSize,
      Name: queryParams.Name,
      FollowStageEnum: queryParams.FollowStageEnum,
      Consultant: queryParams.Consultant,
    };
    const res = await getFollowrecordList(params);
    followList.value = res.data || [];
    pageParams.totalCount = res.totleCount || 0;
  } catch (error) {
    ElMessage.error('获取跟进记录失败');
    followList.value = [];
    pageParams.totalCount = 0;
  }
};

onMounted(() => {
  fetchFollowList();
  Selectstaff();
});

// 自定义显示列相关
const showColumnDialog = ref(false);
const allColumns = ref([
  { label: '跟进时间', prop: 'touchTIme', width: '160', slot: true },
  { label: '跟进人', prop: 'consultantName', width: '100' },
  { label: '客户', prop: 'studentName', width: '100' },
  { label: '阶段', prop: 'followStageEnum', width: '120', slot: true },
  { label: '跟进方式', prop: 'getInTouchEnum', width: '120', slot: true },
  { label: '下次跟进', prop: 'nextTouchTime', width: '160', slot: true },
  { label: '记录时间', prop: 'recordDate', width: '160', slot: true },
  { label: '跟进内容', prop: 'followDesc', minWidth: '200' },
]);
const checkedProps = ref(allColumns.value.map(col => col.prop));
const resetColumns = () => {
  checkedProps.value = allColumns.value.map(col => col.prop);
};
const showColumns = computed(() =>
  allColumns.value.filter(col => checkedProps.value.includes(col.prop))
);
</script>

<style scoped>
.follow-record-management {
  padding: 24px;
  background: #fafafa;
  min-height: 100vh;
}
.search-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.table-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.pagination-container {
  margin-top: 16px;
  text-align: left;
}
</style>
