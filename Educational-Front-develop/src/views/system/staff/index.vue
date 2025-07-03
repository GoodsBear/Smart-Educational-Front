<template>
  <div class="staff-management">
    <!-- 搜索和操作区域 -->
    <div class="operation-area">
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="姓名">
          <el-input v-model="queryParams.StaffName" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="queryParams.Status"
            placeholder="请选择状态"
            clearable
            class="status-select"
          >
            <el-option label="在职" :value="1" />
            <el-option label="离职" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-button type="primary" @click="showAddDialog">添加员工</el-button>
      <el-button>设置角色</el-button>
      <el-button @click="handleDelete">删除</el-button>
      <el-button>转机构</el-button>
      <el-button @click="openStatusDialog('离职')">转为离职</el-button>
      <el-button @click="openStatusDialog('在职')">转为在职</el-button>
      <el-button>转学员</el-button>
      <el-button>导出</el-button>
      <el-button @click="showColumnDialog = true">自定义显示列</el-button>
    </div>

    <!-- 员工列表 -->
    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="staffList"
      style="width: 100%"
      @selection-change="ToAll"
    >
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
      <el-pagination
        v-model:current-page="queryParams.PageIndex"
        v-model:page-size="queryParams.PageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="fetchStaffList"
        @current-change="fetchStaffList"
      />
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="60%" @closed="resetForm">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="110px">
        <el-form-item label="姓名" prop="staffName" required>
          <el-input v-model="formData.staffName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="电话" prop="staffPhone" required>
          <el-input v-model="formData.staffPhone" placeholder="请输入电话" />
        </el-form-item>
        <el-form-item label="登录账号" prop="staffAccount" required>
          <el-input v-model="formData.staffAccount" placeholder="请输入登录账号" />
        </el-form-item>
        <el-form-item label="登录密码" prop="staffPassword" required>
          <el-input v-model="formData.staffPassword" placeholder="请输入登录密码" />
        </el-form-item>
        <el-form-item label="所属机构" prop="organization">
          <el-tree
            ref="treeRef"
            :data="data"
            show-checkbox
            node-key="id"
            @check-change="handleCheck"
          />
        </el-form-item>
        <el-form-item label="所属职位" prop="positionId" required>
          <el-select v-model="formData.positionId" placeholder="请选择职位">
            <el-option label="管理" value="3a1aa8f8-4191-62eb-cae1-631ba2b08e4c" />
            <el-option label="老师" value="3a1aa8f8-5dfe-01db-8f07-9b94ab6e95ca" />
          </el-select>
        </el-form-item>
        <el-form-item label="权限角色" prop="roleId" required>
          <el-select v-model="formData.roleId" placeholder="请选择角色">
            <el-option label="超级管理员" value="3a1aa9dd-dfb0-c706-496a-965d53a78a02" />
            <el-option label="教务管理员" value="3a1aaa2d-f541-7089-952e-c95f022ca779" />
            <el-option label="校长" value="3a1ab850-6f82-cc55-e16d-67689e63e75d" />
            <el-option label="班主任" value="3a1abbf2-fb1e-b103-6bb2-e446c8e5f870" />
          </el-select>
        </el-form-item>
        <el-form-item label="人员类型" prop="staffTypeId" required>
          <el-select v-model="formData.staffTypeId" placeholder="人员类型">
            <el-option label="内部" value="3a1aa9dd-dfb0-c706-496a-965d53a73a02" />
          </el-select>
        </el-form-item>
        <el-form-item label="性别" prop="staffGender" required>
          <el-select v-model="formData.staffGender" placeholder="请选择性别">
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
            <el-option label="未知" value="未知" />
          </el-select>
        </el-form-item>
        <el-form-item label="学历" prop="education">
          <el-select v-model="formData.education" placeholder="请选择学历">
            <el-option label="未知" value="未知" />
            <el-option label="大专" value="大专" />
            <el-option label="本科" value="本科" />
            <el-option label="硕士" value="硕士" />
            <el-option label="博士" value="博士" />
          </el-select>
        </el-form-item>
        <el-form-item label="生日" prop="birthday">
          <el-date-picker
            v-model="formData.birthday"
            type="date"
            placeholder="请选择生日"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="毕业学校" prop="graduationSchool">
          <el-input v-model="formData.graduationSchool" placeholder="请输入毕业学校" />
        </el-form-item>
        <el-form-item label="入职日期" prop="entryDate">
          <el-date-picker
            v-model="formData.entryDate"
            type="date"
            placeholder="请选择入职日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="简介" prop="introduction">
          <el-input
            v-model="formData.introduction"
            type="textarea"
            :rows="2"
            placeholder="请输入简介"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="formData.status"
            :active-value="1"
            :inactive-value="0"
            active-text="在职"
            inactive-text="离职"
          />
        </el-form-item>
        <el-form-item label="照片" prop="photoUrl">
          <el-upload
            class="avatar-uploader"
            action="https://localhost:44375/api/upload/image"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="imageUrl" :src="imageUrl" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
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

    <!-- 状态对话框 -->
    <el-dialog v-model="statusDialogVisible" :title="statusDialogTitle">
      <el-form :model="statusForm">
        <el-form-item label="状态">
          <el-select v-model="statusForm.status" placeholder="请选择状态">
            <el-option label="在职" :value="1" />
            <el-option label="离职" :value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitStatus">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, nextTick } from "vue";
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus";
import StaffAPI from "@/api/staff/staff.api"; // 导入您封装的API方法
import { getOrganizationTree } from "@/api/organization/organization.api";
import moment from "moment";
import { Plus } from "@element-plus/icons-vue";
import type { UploadProps } from "element-plus";
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
  staffTypeId: string;
  entryDate: string;
  education: string;
  birthday: string;
  graduationSchool: string;
  introduction: string;
  photoUrl: string;
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
const statusDialogVisible = ref(false);
const statusDialogTitle = ref();
const statusForm = reactive({
  status: "1", // 默认在职
});

const data = ref([]);

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
  PageSize: 20,
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
    staffTypeId: "",
    entryDate: "",
    education: "",
    birthday: "",
    graduationSchool: "",
    introduction: "",
    photoUrl: "",
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
  staffTypeId: "",
  entryDate: "",
  education: "",
  birthday: "",
  graduationSchool: "",
  introduction: "",
  photoUrl: "",
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
  positionId: [{ required: true, message: "请选择职位", trigger: "change" }],
  staffGender: [{ required: true, message: "请选择性别", trigger: "change" }],
  education: [{ required: true, message: "请选择学历", trigger: "change" }],
  birthday: [{ required: true, message: "请选择生日", trigger: "change" }],
  graduationSchool: [{ required: true, message: "请输入毕业学校", trigger: "blur" }],
  entryDate: [{ required: true, message: "请选择入职日期", trigger: "change" }],
  introduction: [
    { required: true, message: "请输入简介", trigger: "blur" },
    { min: 2, max: 200, message: "简介长度在 2 到 200 个字符", trigger: "blur" },
  ],
  photoUrl: [{ required: true, message: "请上传照片", trigger: "change" }],
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
  resetFormData();
  formRef.value?.resetFields();
};

// 显示编辑对话框
const showEditDialog = async (row: any) => {
  isAdd.value = false;
  dialogTitle.value = "编辑员工";

  resetFormData();
  formRef.value?.resetFields();

  Object.assign(formData, row);

  // 处理 organization 字段
  let orgNames = [];
  if (typeof row.organization === "string") {
    orgNames = row.organization.split(",");
  } else if (Array.isArray(row.organization)) {
    orgNames = row.organization;
  }

  formData.organization = orgNames;

  formData.staffPassword = "123456";
  imageUrl.value = row.photoUrl;

  dialogVisible.value = true;

  // 等待弹窗和树渲染后设置选中
  await nextTick();
  if (treeRef.value && data.value.length) {
    const checkedIds = findIdsByNames(data.value, orgNames);
    treeRef.value.setCheckedKeys(checkedIds);
  }
};

// 提交表单
const submitForm = async () => {
  console.log("新增员工", formData);
  if (!treeRef.value) {
    console.error("无法获取实例，请检查 ref 绑定！");
    return;
  }
  const checked = treeRef.value.getCheckedNodes();
  const halfChecked = treeRef.value.getHalfCheckedNodes();
  console.log("完全选中：", checked);
  console.log("半选中：", halfChecked);
  const shanji = ref([]);
  for (let i = 0; i < checked.length; i++) {
    shanji.value.push(checked[i].id);
  }
  formData.organization = shanji.value.toString();
  console.log("组织ID：", formData.organization);
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

const Delarr = ref([]);

const ToAll = (selection: any) => {
  console.log(selection);
  Delarr.value = selection.map((item: any) => item.id);
  console.log(Delarr.value);
};

// 删除员工
const handleDelete = async () => {
  const selection = tableRef.value.getSelectionRows() as StaffFormData[]; // 明确类型
  if (selection.length === 0) {
    ElMessage.warning("请先选择要删除的员工");
    return;
  }
  const params = {
    ids: Delarr.value,
  };
  ElMessageBox.confirm("确定要删除选中的员工吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    await StaffAPI.deleteStaff(params);
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

// 图片上传相关
const imageUrl = ref("");

const handleAvatarSuccess: UploadProps["onSuccess"] = (response, uploadFile) => {
  imageUrl.value = URL.createObjectURL(uploadFile.raw!);
  formData.photoUrl = response;
};

const beforeAvatarUpload: UploadProps["beforeUpload"] = (rawFile) => {
  /*
  if (rawFile.type !== "image/jpeg/gif/png") {
    ElMessage.error("Avatar picture must be JPG format!");
    return false;
  } else
   */ if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error("Avatar picture size can not exceed 2MB!");
    return false;
  }
  return true;
};

// 生命周期钩子
onMounted(async () => {
  fetchStaffList();
  const response = await getOrganizationTree("00000000-0000-0000-0000-000000000000");
  data.value = response;
  console.log("获取机构信息", data.value);
  console.log("组件已挂载，treeRef 状态：", treeRef.value ? "正常" : "异常");
});
const treeRef = ref(null);

// 获取选中节点
const handleCheck = () => {
  const keys = treeRef.value;
  console.log("选中变化时获取：", keys || "ref 未绑定");
};

const getSelected = () => {};

// 打开弹窗并设置状态
const openStatusDialog = (type: any) => {
  statusDialogVisible.value = true;
  if (type === "离职") {
    statusDialogTitle.value = "转为离职";
    statusForm.status = 0;
  } else {
    statusDialogTitle.value = "转为在职";
    statusForm.status = 1;
  }
};

// 提交方法
const submitStatus = () => {
  // 这里提交 statusForm.status
  ElMessageBox.confirm("确定要修改员工的状态吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    await StaffAPI.updateStaffStatus(Delarr.value, statusForm.status);
    ElMessage.success("修改成功");
    fetchStaffList();
  });

  statusDialogVisible.value = false;
};

// 递归查找所有匹配名称的节点id
function findIdsByNames(treeData, names) {
  const ids = [];
  function traverse(nodes) {
    nodes.forEach((node) => {
      if (names.includes(node.label)) {
        ids.push(node.id);
      }
      if (node.children && node.children.length) {
        traverse(node.children);
      }
    });
  }
  traverse(treeData);
  return ids;
}
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

.avatar-uploader .avatar {
  width: 100px;
  height: 100px;
  display: block;
}
</style>
