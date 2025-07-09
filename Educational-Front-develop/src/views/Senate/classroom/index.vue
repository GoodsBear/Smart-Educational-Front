<template>
  <div class="classroom-management">
    <!-- 搜索栏 -->
    <el-card>
      <div class="search-bar">
        <el-form :inline="true" :model="queryParams">
          <el-form-item label="教室名称：">
            <el-input v-model="queryParams.classroomName" placeholder="请输入教室名称" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchClassroomList">查询</el-button>
            <el-button @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card style="margin-top: 10px">
      <!-- 表格标题和操作按钮区 -->
      <div class="table-header-bar">
        <div class="table-title">教室列表</div>
        <div class="operation-area">
          <el-button type="primary" @click="showAddDialog">新增</el-button>
          <el-button @click="handleDelete" type="danger">删除</el-button>
          <el-button @click="fetchClassroomList" type="success">刷新</el-button>
          <el-button @click="showColumnDialog = true" type="primary">自定义显示列</el-button>
        </div>
      </div>
      <!-- 教室列表表格 -->
      <el-table ref="tableRef" :data="classroomList" style="width: 100%" @selection-change="selectAll">
        <el-table-column v-for="col in showColumns" :key="col.prop" :prop="col.prop" :label="col.label" />
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
        <el-form-item label="教室名称" prop="classroomName">
          <el-input v-model="formData.classroomName" placeholder="请输入教室名称" />
        </el-form-item>
        <el-form-item label="分校" prop="organizationModelId">
          <el-select v-model="formData.organizationModelId" placeholder="请选择">
            <el-option v-for="item in organizationname" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="地点" prop="classRoomAddress">
          <el-input v-model="formData.classRoomAddress" placeholder="请输入地点" />
        </el-form-item>
        <el-form-item label="面积(平米)" prop="classRoomArea">
          <el-input v-model="formData.classRoomArea" placeholder="请输入面积" />
        </el-form-item>
        <el-form-item label="备注" prop="classRoomDescription">
          <el-input v-model="formData.classRoomDescription" placeholder="请输入备注" type="textarea" />
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
import { getClassRoomList, createClassRoom, updateClassRoom, batchDeleteClassRoom } from '@/api/Senate/classroom.api';
import { getOrganizationDropdown } from '@/api/Organization/organization.api'
// 查询参数
const queryParams = reactive({
  classroomName: ""
});
const pageParams = reactive({
  PageIndex: 1,
  PageSize: 10,
  TotalCount: 0,
  TotalPage: 0
});

// 数据状态
const classroomList = ref<any[]>([]);
const dialogVisible = ref(false);
const dialogTitle = ref("新增教室");
const formRef = ref<FormInstance>();
const isAdd = ref(true);
// 表单数据
const formData = reactive({
  id: "",
  classroomName: "",
  organizationModelId: "",
  classRoomAddress: "",
  classRoomArea: "",
  classRoomDescription: ""
});
//数据验证
const rules: FormRules = {
  classroomName: [{ required: true, message: "请输入教室名称", trigger: "blur" }],
  organizationModelId: [{ required: true, message: "请输入分校", trigger: "blur" }],
  classRoomAddress: [{ required: true, message: "请输入地点", trigger: "blur" }],
  classRoomArea: [{ required: true, message: "请输入面积", trigger: "blur" }],
};
// 新增弹出框
function showAddDialog() {
  isAdd.value = true;
  dialogTitle.value = "新增教室";
  resetForm();
  dialogVisible.value = true;
}
// 编辑弹出框
function showEditDialog(row: any) {
  isAdd.value = false;
  console.log("row=>", row);

  formData.id = row.id;
  dialogTitle.value = "编辑教室";
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
    ElMessage.warning("请先选择要删除的教室！");
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
      batchDeleteClassRoom({ ids: Ids.value }).then(() => {
        ElMessage.success("删除成功");
        fetchClassroomList();
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
  formData.classroomName = "";
  formData.organizationModelId = "";
  formData.classRoomAddress = "";
  formData.classRoomArea = "";
  formData.classRoomDescription = "";
}
//添加修改
const submitForm = () => {
  (formRef.value as FormInstance).validate((valid) => {
    if (valid) {
      if (isAdd.value) {
        createClassRoom(formData).then(() => {
          ElMessage.success("添加成功");
          dialogVisible.value = false;
          fetchClassroomList();
        });
      } else {
        updateClassRoom(formData.id, formData).then(() => {
          ElMessage.success("修改成功");
          dialogVisible.value = false;
          fetchClassroomList();
        });
      }
    }
  });
}

//列表
const fetchClassroomList = () => {
  const params = {
    PageIndex: pageParams.PageIndex,
    PageSize: pageParams.PageSize,
    classroomName: queryParams.classroomName
  };
  getClassRoomList(params).then((res) => {
    classroomList.value = res.data || [];
    pageParams.TotalCount = res.totleCount || 0;
    pageParams.TotalPage = res.totlePage || 1;
  });
}
// 分页
const handlePagination = ({ page, limit }: { page: number; limit: number }) => {
  pageParams.PageIndex = page;
  pageParams.PageSize = limit;
  fetchClassroomList();
};
//学校下拉
let organizationname = ref([{
  id: "",
  name: ""
}])
const Selectorganization = () => {
  getOrganizationDropdown().then((res) => {
    console.log("组织下拉=>", res);
    organizationname.value = res;
  })
}
// 自定义显示列相关
const showColumnDialog = ref(false);
const allColumns = ref([
  { label: "教室名称", prop: "classroomName" },
  { label: "分校", prop: "organizatioName" },
  { label: "地点", prop: "classRoomAddress" },
  { label: "面积(平米)", prop: "classRoomArea" },
  { label: "备注", prop: "classRoomDescription" },
]);
const checkedProps = ref(allColumns.value.map(col => col.prop));
const resetColumns = () => {
  checkedProps.value = allColumns.value.map(col => col.prop);
};
const showColumns = computed(() =>
  allColumns.value.filter(col => checkedProps.value.includes(col.prop))
);
// 重置查询条件
const resetQuery = () => {
  queryParams.classroomName = "";
  fetchClassroomList();
};
onMounted(() => {
  fetchClassroomList();
  Selectorganization()
});
</script>

<style scoped>
.classroom-management {
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
