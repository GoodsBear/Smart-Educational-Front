<template>
  <div class="staff-management">
    <!-- 搜索和操作区域 -->
    <div class="operation-area">
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="姓名">
          <el-input v-model="queryParams.StaffName" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.Status" placeholder="请选择状态" clearable class="status-select">
            <el-option label="在职" :value="1" />
            <el-option label="离职" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>


    </div>
    <div>
      <el-button type="primary" @click="showAddDialog">添加员工</el-button>
      <el-button>设置角色</el-button>
      <el-button @click="handleDelete">删除</el-button>
      <el-button>转机构</el-button>
      <el-button>转为离职</el-button>
      <el-button>转为在职</el-button>
      <el-button>转学员</el-button>
      <el-button>导出</el-button>
      <el-button @click="showColumnDialog = true">自定义显示列</el-button>
    </div>
    <div style="margin-top:10px ;">
      <!-- 员工列表 -->
      <el-table ref="tableRef" v-loading="loading" :data="staffList" style="width: 100%">
        <el-table-column type="selection" width="50" />
        <template v-for="col in allColumns" :key="col.prop">
          <el-table-column v-if="checkedProps.includes(col.prop)" :prop="col.prop" :label="col.label">
            <template v-if="col.prop === 'staffName'" #default="{ row }">
              <el-link @click="goToDetail(row)">{{ row.staffName }}</el-link>
            </template>
            <template v-else-if="col.prop === 'entryDate'" #default="{ row }">
              {{ row.entryDate ? moment(row.entryDate).format("YYYY-MM-DD") : "" }}
            </template>
            <template v-else-if="col.prop === 'status'" #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'info'">
                {{ row.status === 1 ? "在职" : "离职" }}
              </el-tag>
            </template>
          </el-table-column>
        </template>
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button size="small" @click="showEditDialog(row)">编辑</el-button>
            <el-button size="small" @click="changePassword(row)">改密</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination v-model:current-page="queryParams.PageIndex" v-model:page-size="queryParams.PageSize"
          :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" :total="total"
          @size-change="fetchStaffList" @current-change="fetchStaffList" />
      </div>

      <!-- 新增/编辑对话框 -->
      <el-dialog v-model="dialogVisible" :title="dialogTitle" width="50%" @closed="resetForm">
        <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
          <el-form-item label="员工姓名" prop="staffName">
            <el-input v-model="formData.staffName" placeholder="请输入员工姓名" />
          </el-form-item>
          <el-form-item label="账号" prop="staffAccount">
            <el-input v-model="formData.staffAccount" placeholder="请输入账号" />
          </el-form-item>
          <el-form-item v-if="isAdd" label="密码" prop="staffPassword">
            <el-input v-model="formData.staffPassword" placeholder="请输入密码" show-password />
          </el-form-item>
          <el-form-item label="手机号" prop="staffPhone">
            <el-input v-model="formData.staffPhone" placeholder="请输入手机号" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="formData.status">
              <el-radio :label="1">启用</el-radio>
              <el-radio :label="0">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
          <!-- 其他表单字段... -->
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitForm">确认</el-button>
          </span>
        </template>
      </el-dialog>

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

  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus";
import StaffAPI from "@/api/Organization/staff.api"; // 导入您封装的API方法
import moment from "moment";

// 类型定义
interface StaffQuery {
  StaffName?: string;
  Status?: number;
  PageIndex: number;
  PageSize: number;
}

interface StaffFormData {
  staffName: string;
  staffAccount: string;
  staffPassword?: string;
  staffPhone: string;
  status: number;
  organization: string;
  staffGender: string;
  positionId: string;
  roleId: string;
  staffTypedId: string;
  entryDate: string;
  education: string;
  birthday: string;
  graduationschool: string;
  introduction: string;
  photour1: string;
  [key: string]: any;
}

// 数据状态
const loading = ref(false);
const staffList = ref<any[]>([]);
const total = ref(0);
const dialogVisible = ref(false);
const isAdd = ref(true);
const dialogTitle = ref("新增员工");
const formRef = ref<FormInstance>();
const tableRef = ref<any>(null);
const showColumnDialog = ref(false);

const allColumns = [
  { label: "姓名", prop: "staffName", show: true },
  { label: "电话/登录账号", prop: "staffAccount", show: true },
  { label: "所属机构", prop: "organization", show: true },
  { label: "性别", prop: "staffGender", show: true },
  { label: "职位", prop: "position", show: true },
  { label: "权限角色", prop: "role", show: true },
  { label: "人员类型", prop: "staffType", show: true },
  { label: "入职日期", prop: "entryDate", show: true },
  { label: "状态", prop: "status", show: true },
];

const checkedProps = ref(allColumns.filter((c) => c.show).map((c) => c.prop));

// 查询参数
const queryParams = reactive<StaffQuery>({
  PageIndex: 1,
  PageSize: 10,
});

// 表单数据
const resetFormData = () => {
  Object.assign(formData, {
    staffName: "",
    staffAccount: "",
    staffPassword: "",
    staffPhone: "",
    status: 1,
    organization: "",
    staffGender: "",
    positionId: "",
    roleId: "",
    staffTypedId: "",
    entryDate: "",
    education: "",
    birthday: "",
    graduationschool: "",
    introduction: "",
    photour1: "",
  });
};

const formData = reactive<StaffFormData>({
  staffName: "",
  staffAccount: "",
  staffPassword: "",
  staffPhone: "",
  status: 1,
  organization: "",
  staffGender: "",
  positionId: "",
  roleId: "",
  staffTypedId: "",
  entryDate: "",
  education: "",
  birthday: "",
  graduationschool: "",
  introduction: "",
  photour1: "",
});

// 表单验证规则
const rules = reactive<FormRules<StaffFormData>>({
  staffName: [
    { required: true, message: "请输入员工姓名", trigger: "blur" },
    { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" },
  ],
  staffAccount: [
    { required: true, message: "请输入账号", trigger: "blur" },
    { min: 4, max: 20, message: "长度在 4 到 20 个字符", trigger: "blur" },
  ],
  staffPassword: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码长度不能少于6位", trigger: "blur" },
  ],
  staffPhone: [
    { required: true, message: "请输入手机号", trigger: "blur" },
    { pattern: /^1[3-9]\d{9}$/, message: "手机号格式不正确", trigger: "blur" },
  ],
});

// 生命周期钩子
onMounted(() => {
  fetchStaffList();
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
    total.value = response.total;
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

// 显示新增对话框
const showAddDialog = () => {
  isAdd.value = true;
  dialogTitle.value = "新增员工";
  dialogVisible.value = true;
};

// 显示编辑对话框
const showEditDialog = (row: any) => {
  isAdd.value = false;
  dialogTitle.value = "编辑员工";
  Object.assign(formData, row);
  dialogVisible.value = true;
};

// 提交表单
const submitForm = async () => {
  try {
    await formRef.value?.validate();

    if (isAdd.value) {
      await StaffAPI.createStaff(formData);
      ElMessage.success("新增成功");
    } else {
      await StaffAPI.updateStaff(formData.id, formData);
      ElMessage.success("更新成功");
    }

    dialogVisible.value = false;
    fetchStaffList();
  } catch (error) {
    console.error(error);
  }
};

// 删除员工
const handleDelete = async () => {
  const selection = tableRef.value.getSelectionRows() as StaffFormData[]; // 明确类型
  if (selection.length === 0) {
    ElMessage.warning("请先选择要删除的员工");
    return;
  }
  const ids = selection.map((item: StaffFormData) => item.id).join(",");
  ElMessageBox.confirm("确定要删除选中的员工吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    await StaffAPI.deleteStaff(ids);
    ElMessage.success("删除成功");
    fetchStaffList();
  });
};

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields();
  resetFormData();
};

// 跳转到详情页
const goToDetail = (row: any) => {
  // 实现跳转到详情页的逻辑
  console.log("跳转到详情页", row);
};

// 修改密码
const changePassword = (row: any) => {
  // 实现修改密码的逻辑
  console.log("修改密码", row);
};

// 恢复默认
const resetColumns = () => {
  checkedProps.value = allColumns.map((c) => c.prop);
};
</script>

<style scoped>
.staff-management {
  padding: 20px;
}

.operation-area {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
}

.search-form {
  display: flex;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.status-select {
  width: 120px;
}
</style>
