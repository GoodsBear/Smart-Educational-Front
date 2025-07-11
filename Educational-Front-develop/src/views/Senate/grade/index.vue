<template>
  <div class="grade-management">
    <!-- 搜索栏 -->
    <el-card>
      <div class="search-bar">
        <el-form :inline="true" :model="queryParams">
          <el-form-item label="年级名称：">
            <el-input v-model="queryParams.gradeName" placeholder="请输入年级名称" clearable />
          </el-form-item>
          <el-form-item label="入学年份：">
            <el-date-picker v-model="queryParams.enrollYear" type="year" placeholder="请选择" value-format="YYYY"
              clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchGradeList">查询</el-button>
            <el-button @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card style="margin-top: 10px">
      <!-- 表格标题和操作按钮区 -->
      <div class="table-header-bar">
        <div class="table-title">年级列表</div>
        <div class="operation-area">
          <el-button type="primary" @click="showAddDialog">新增</el-button>
          <el-button @click="handleDelete" type="danger">删除</el-button>
          <el-button @click="fetchGradeList" type="success">刷新</el-button>
          <el-button @click="showColumnDialog = true" type="primary">自定义显示列</el-button>
        </div>
      </div>
      <!-- 年级列表表格 -->
      <el-table ref="tableRef" :data="gradeList" style="width: 100%" @selection-change="selectAll">
        <el-table-column type="selection" width="50" />
        <el-table-column v-for="col in showColumns" :key="col.prop" :prop="col.prop" :label="col.label">
          <template v-if="col.prop === 'enrollYear'" #default="{ row }">
            {{ moment(row.enrollYear).format("YYYY") }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button type="text" @click="showEditDialog(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="pagination-container">
        <pagination v-model:total="pageParams.TotalCount" v-model:page="pageParams.PageIndex"
          v-model:limit="pageParams.PageSize" @pagination="handlePagination" />
      </div>
    </el-card>
    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="30%" @closed="resetForm">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="年级名称" prop="gradeName">
          <el-input v-model="formData.gradeName" placeholder="请输入年级名称" />
        </el-form-item>
        <el-form-item label="入学年份" prop="entryYear">
          <el-date-picker v-model="formData.enrollYear" placeholder="请选择" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="排序值" prop="sort">
          <el-input v-model="formData.sort" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="formData.remark" placeholder="请输入备注" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确认</el-button>
        </span>
      </template>
    </el-dialog>
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
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus";
import { getGradeList, createGrade, updateGrade, batchDeleteGrade } from '@/api/Senate/grade.api';
import moment from "moment";
// 查询参数
const queryParams = reactive({
  gradeName: "",
  enrollYear: ""
});
const pageParams = reactive({
  PageIndex: 1,
  PageSize: 10,
  TotalCount: 0,
  TotalPage: 0
});

// 数据状态
const gradeList = ref<any[]>([]);
const dialogVisible = ref(false);
const dialogTitle = ref("新增年级");
const formRef = ref<FormInstance>();
const isAdd = ref(true);
// 表单数据
const formData = reactive({
  id: "",
  gradeName: "",
  enrollYear: "",
  sort: 0,
  remark: ""
});
//数据验证
const rules: FormRules = {
  gradeName: [{ required: true, message: "请输入年级名称", trigger: "blur" }],
  enrollYear: [{ required: true, message: "请选择入学年份", trigger: "change" }],
};
// 自定义显示列相关
const showColumnDialog = ref(false);
const allColumns = ref([
  { label: "年级名称", prop: "gradeName" },
  { label: "入学年份", prop: "enrollYear" },
  { label: "排序值", prop: "sort" },
  { label: "备注", prop: "remark" },
]);
const checkedProps = ref(allColumns.value.map(col => col.prop));
const resetColumns = () => {
  checkedProps.value = allColumns.value.map(col => col.prop);
};
const showColumns = computed(() =>
  allColumns.value.filter(col => checkedProps.value.includes(col.prop))
);
// 新增弹出框
function showAddDialog() {
  isAdd.value = true;
  dialogTitle.value = "新增年级";
  resetForm();
  dialogVisible.value = true;
}
// 编辑弹出框
function showEditDialog(row: any) {
  isAdd.value = false;
  formData.id = row.id;
  dialogTitle.value = "编辑年级";
  Object.assign(formData, row);
  dialogVisible.value = true;
}
//全选 全部选
const Ids = ref<any[]>([]);
const selectAll = (rows: any[]) => {
  Ids.value = rows.map((item: any) => item.id);
}
// 批量删除
const handleDelete = () => {
  if (!Ids.value.length) {
    ElMessage.warning("请先选择要删除的年级！");
    return;
  }
  ElMessageBox.confirm(
    '确认删除吗?',
    'Warning',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      batchDeleteGrade({ ids: Ids.value }).then(() => {
        ElMessage.success("删除成功");
        fetchGradeList();
      });
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '删除已取消',
      })
    })
}
// 重置表单
const resetForm = () => {
  formData.id = "";
  formData.gradeName = "";
  formData.enrollYear = "";
  formData.sort = 0;
  formData.remark = "";
}
//添加修改
const submitForm = () => {
  (formRef.value as FormInstance).validate((valid) => {
    if (valid) {
      if (isAdd.value) {
        createGrade(formData).then(() => {
          ElMessage.success("添加成功");
          dialogVisible.value = false;
          fetchGradeList();
        });
      } else {
        updateGrade(formData.id, formData).then(() => {
          ElMessage.success("修改成功");
          dialogVisible.value = false;
          fetchGradeList();
        });
      }
    }
  });
}
//列表
const fetchGradeList = () => {
  const params = {
    PageIndex: pageParams.PageIndex,
    PageSize: pageParams.PageSize,
    gradeName: queryParams.gradeName,
    enrollYear: queryParams.enrollYear
  };
  getGradeList(params).then((res) => {
    gradeList.value = res.data || [];
    pageParams.TotalCount = res.totleCount || 0;
    pageParams.TotalPage = res.totlePage || 1;
  });
}
// 分页
const handlePagination = ({ page, limit }: { page: number; limit: number }) => {
  pageParams.PageIndex = page;
  pageParams.PageSize = limit;
  fetchGradeList();
};
// 重置查询条件
const resetQuery = () => {
  queryParams.gradeName = "";
  queryParams.enrollYear = "";
  fetchGradeList();
};
onMounted(() => {
  fetchGradeList();
});
</script>

<style scoped>
.grade-management {
  padding: 24px;
  background: #fafafa;
  min-height: 100vh;
}

.search-bar {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
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
