<template>
  <div class="staff-page">
    <div class="left-tree">
      <!-- 机构树形结构 -->
      <el-tree :data="orgTreeData" node-key="id" :props="{ label: 'label', children: 'children' }" default-expand-all
        @node-click="handleOrgNodeClick" />
    </div>
    <div class="right-content">
      <!-- 查询条件 -->
      <el-card class="search-card" shadow="never">
        <div class="search-bar">
          <div class="search-fields">
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
            </el-form>
            <div class="search-btns">
              <el-button type="primary" @click="handleSearch">搜索</el-button>
              <el-button @click="resetSearch">重置</el-button>
            </div>
          </div>
          <div class="action-btns">
            <el-button type="primary" @click="showAddDialog">添加员工</el-button>
            <el-button>设置角色</el-button>
            <el-button @click="handleDelete">删除</el-button>
            <el-button @click="showTransferDialog">转机构</el-button>
            <el-button @click="handleChangeStatus('离职')">转为离职</el-button>
            <el-button @click="handleChangeStatus('在职')">转为在职</el-button>
            <el-button>转学员</el-button>
            <el-button>导出</el-button>
            <el-button @click="showColumnDialog = true">自定义显示列</el-button>
          </div>
        </div>
      </el-card>
      <!-- 信息列表 -->
      <el-card class="table-card" shadow="never">
        <!-- 员工列表 -->
        <el-table ref="tableRef" v-loading="loading" :data="staffList" style="width: 100%" @selection-change="ToAll">
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
      </el-card>

      <!-- 新增/编辑对话框 -->
      <el-dialog v-model="addDialogVisible" title="新增员工" width="60%" @closed="resetAddForm">
        <el-form ref="addFormRef" :model="addFormData" :rules="addRules" label-width="110px">
          <el-form-item label="姓名" prop="staffName" required>
            <el-input v-model="addFormData.staffName" placeholder="请输入姓名" />
          </el-form-item>
          <el-form-item label="电话" prop="staffPhone" required>
            <el-input v-model="addFormData.staffPhone" placeholder="请输入电话" />
          </el-form-item>
          <el-form-item label="登录账号" prop="staffAccount" required>
            <el-input v-model="addFormData.staffAccount" placeholder="请输入登录账号" />
          </el-form-item>
          <el-form-item label="登录密码" prop="staffPassword" required>
            <el-input v-model="addFormData.staffPassword" placeholder="请输入登录密码" />
          </el-form-item>
          <el-form-item label="所属机构" prop="organization">
            <el-tree ref="treeRef" :data="data" show-checkbox node-key="id" @check-change="handleCheck" />
          </el-form-item>
          <el-form-item label="所属职位" prop="positionId" required>
            <el-select v-model="addFormData.positionId" placeholder="请选择职位">
              <el-option v-for="item in positionOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="人员类型" prop="staffTypeId" required>
            <el-select v-model="addFormData.staffTypeId" placeholder="人员类型">
              <el-option label="内部" value="3a1aa9dd-dfb0-c706-496a-965d53a73a02" />
            </el-select>
          </el-form-item>
          <el-form-item label="性别" prop="staffGender" required>
            <el-select v-model="addFormData.staffGender" placeholder="请选择性别">
              <el-option label="男" value="男" />
              <el-option label="女" value="女" />
              <el-option label="未知" value="未知" />
            </el-select>
          </el-form-item>
          <el-form-item label="学历" prop="education">
            <el-select v-model="addFormData.education" placeholder="请选择学历">
              <el-option label="未知" value="未知" />
              <el-option label="大专" value="大专" />
              <el-option label="本科" value="本科" />
              <el-option label="硕士" value="硕士" />
              <el-option label="博士" value="博士" />
            </el-select>
          </el-form-item>
          <el-form-item label="生日" prop="birthday">
            <el-date-picker v-model="addFormData.birthday" type="date" placeholder="请选择生日" style="width: 100%" />
          </el-form-item>
          <el-form-item label="毕业学校" prop="graduationSchool">
            <el-input v-model="addFormData.graduationSchool" placeholder="请输入毕业学校" />
          </el-form-item>
          <el-form-item label="入职日期" prop="entryDate">
            <el-date-picker v-model="addFormData.entryDate" type="date" placeholder="请选择入职日期" style="width: 100%" />
          </el-form-item>
          <el-form-item label="简介" prop="introduction">
            <el-input v-model="addFormData.introduction" type="textarea" :rows="2" placeholder="请输入简介" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-switch v-model="addFormData.status" :active-value="1" :inactive-value="0" active-text="在职"
              inactive-text="离职" />
          </el-form-item>
          <el-form-item label="照片" prop="photoUrl">
            <el-upload class="avatar-uploader" action="https://localhost:44375/api/upload/image" :show-file-list="false"
              :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
              <img v-if="imageUrl" :src="imageUrl" class="avatar" />
              <el-icon v-else class="avatar-uploader-icon">
                <Plus />
              </el-icon>
            </el-upload>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="addDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitAddForm">确认</el-button>
          </span>
        </template>
      </el-dialog>

      <el-dialog v-model="editDialogVisible" title="编辑员工" width="60%" @closed="resetEditForm">
        <el-form ref="editFormRef" :model="editFormData" :rules="editRules" label-width="110px">
          <el-form-item label="姓名" prop="staffName" required>
            <el-input v-model="editFormData.staffName" placeholder="请输入姓名" />
          </el-form-item>
          <el-form-item label="电话" prop="staffPhone" required>
            <el-input v-model="editFormData.staffPhone" placeholder="请输入电话" />
          </el-form-item>
          <el-form-item label="登录账号" prop="staffAccount" required>
            <el-input v-model="editFormData.staffAccount" placeholder="请输入登录账号" />
          </el-form-item>
          <el-form-item label="所属机构" prop="organization">
            <el-tree ref="treeRef" :data="data" show-checkbox node-key="id" @check-change="handleCheck" />
          </el-form-item>
          <el-form-item label="所属职位" prop="positionId" required>
            <el-select v-model="editFormData.positionId" placeholder="请选择职位">
              <el-option v-for="item in positionOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="人员类型" prop="staffTypeId" required>
            <el-select v-model="editFormData.staffTypeId" placeholder="人员类型">
              <el-option label="内部" value="3a1aa9dd-dfb0-c706-496a-965d53a73a02" />
            </el-select>
          </el-form-item>
          <el-form-item label="性别" prop="staffGender" required>
            <el-select v-model="editFormData.staffGender" placeholder="请选择性别">
              <el-option label="男" value="男" />
              <el-option label="女" value="女" />
              <el-option label="未知" value="未知" />
            </el-select>
          </el-form-item>
          <el-form-item label="学历" prop="education">
            <el-select v-model="editFormData.education" placeholder="请选择学历">
              <el-option label="未知" value="未知" />
              <el-option label="大专" value="大专" />
              <el-option label="本科" value="本科" />
              <el-option label="硕士" value="硕士" />
              <el-option label="博士" value="博士" />
            </el-select>
          </el-form-item>
          <el-form-item label="生日" prop="birthday">
            <el-date-picker v-model="editFormData.birthday" type="date" placeholder="请选择生日" style="width: 100%" />
          </el-form-item>
          <el-form-item label="毕业学校" prop="graduationSchool">
            <el-input v-model="editFormData.graduationSchool" placeholder="请输入毕业学校" />
          </el-form-item>
          <el-form-item label="入职日期" prop="entryDate">
            <el-date-picker v-model="editFormData.entryDate" type="date" placeholder="请选择入职日期" style="width: 100%" />
          </el-form-item>
          <el-form-item label="简介" prop="introduction">
            <el-input v-model="editFormData.introduction" type="textarea" :rows="2" placeholder="请输入简介" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-switch v-model="editFormData.status" :active-value="1" :inactive-value="0" active-text="在职"
              inactive-text="离职" />
          </el-form-item>
          <el-form-item label="照片" prop="photoUrl">
            <el-upload class="avatar-uploader" action="https://localhost:44375/api/upload/image" :show-file-list="false"
              :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
              <img v-if="imageUrl" :src="imageUrl" class="avatar" />
              <el-icon v-else class="avatar-uploader-icon">
                <Plus />
              </el-icon>
            </el-upload>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEditForm">保存</el-button>
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

      <el-dialog v-model="passwordDialogVisible" title="重置密码" width="400px">
        <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="100px">
          <el-form-item label="输入新密码:" prop="newPassword">
            <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="passwordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPassword">提交</el-button>
        </template>
      </el-dialog>

      <!-- 转机构对话框 -->
      <el-dialog v-model="transferDialogVisible" title="转机构" width="500px">
        <div class="transfer-dialog-content">
          <p>请选择要转入的机构：</p>
          <el-tree ref="transferTreeRef" :data="data" show-checkbox node-key="id" default-expand-all highlight-current
            :props="{ label: 'label' }" />
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="transferDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitTransfer">确认</el-button>
          </span>
        </template>
      </el-dialog>

    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, nextTick } from "vue";
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus";
import StaffAPI from "@/api/staff/staff.api"; // 导入您封装的API方法
import PositionAPI from "@/api/Organization/position.api";
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
const addDialogVisible = ref(false);
const editDialogVisible = ref(false);
const addFormRef = ref<FormInstance>();
const editFormRef = ref<FormInstance>();
const tableRef = ref<any>(null);
const showColumnDialog = ref(false);
const statusDialogVisible = ref(false);
const statusDialogTitle = ref();
const statusForm = reactive({
  status: "1", // 默认在职
});
// 转机构相关
const transferDialogVisible = ref(false);
const transferTreeRef = ref<any>(null);

const data = ref([]);
const positionOptions = ref<{ label: string; value: string }[]>([]);

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

// 新增表单
const addFormData = reactive<StaffFormData>({
  staffName: "",
  staffAccount: "",
  staffPassword: "",
  staffPhone: "",
  status: 1,
  organization: "",
  staffGender: "",
  positionId: "",
  staffTypeId: "",
  entryDate: "",
  education: "",
  birthday: "",
  graduationSchool: "",
  introduction: "",
  photoUrl: "",
});

// 编辑表单
const editFormData = reactive<StaffFormData>({
  id: "",
  staffName: "",
  staffAccount: "",
  staffPhone: "",
  status: 1,
  organization: "",
  staffGender: "",
  positionId: "",
  staffTypeId: "",
  entryDate: "",
  education: "",
  birthday: "",
  graduationSchool: "",
  introduction: "",
  photoUrl: "",
});

// 表单验证规则
const addRules = reactive<FormRules<StaffFormData>>({
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

const editRules = reactive<FormRules<StaffFormData>>({
  staffName: [
    { required: true, message: "请输入员工姓名", trigger: "blur" },
    { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" },
  ],
  staffAccount: [
    { required: true, message: "请输入账号", trigger: "blur" },
    { min: 4, max: 20, message: "长度在 4 到 20 个字符", trigger: "blur" },
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
      OrganizationId: selectedOrgId.value || undefined, // 传递机构ID
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

// 显示新增对话框
const showAddDialog = () => {
  resetAddForm();
  addDialogVisible.value = true;
};

// 显示编辑对话框
const showEditDialog = async (row: any) => {
  resetEditForm();
  Object.assign(editFormData, row);

  // 处理 organization 字段
  let orgNames = [];
  if (typeof row.organization === "string") {
    orgNames = row.organization.split(",");
  } else if (Array.isArray(row.organization)) {
    orgNames = row.organization;
  }

  editFormData.organization = orgNames;

  imageUrl.value = row.photoUrl;
  editDialogVisible.value = true;

  // 等待弹窗和树渲染后设置选中
  await nextTick();
  if (treeRef.value && data.value.length) {
    const checkedIds = findIdsByNames(data.value, orgNames);
    treeRef.value.setCheckedKeys(checkedIds);
  }
};

const shanji = ref([]);
// 提交表单
const submitAddForm = async () => {
  console.log("新增员工", addFormData);
  if (!treeRef.value) {
    console.error("无法获取实例，请检查 ref 绑定！");
    return;
  }
  const checked = treeRef.value.getCheckedNodes();
  const halfChecked = treeRef.value.getHalfCheckedNodes();
  console.log("完全选中：", checked);
  console.log("半选中：", halfChecked);
  for (let i = 0; i < checked.length; i++) {
    shanji.value.push(checked[i].id);
  }
  addFormData.organization = shanji.value.toString();
  console.log("组织ID：", addFormData.organization);
  try {
    await addFormRef.value?.validate();

    await StaffAPI.createStaff(addFormData);

    ElMessage.success("新增成功");
    addDialogVisible.value = false;
    fetchStaffList();
  } catch (error) {
    console.error(error);
  }
};

const submitEditForm = async () => {
  try {
    await editFormRef.value?.validate();

    // 获取树选中的节点
    const selectedNodes = treeRef.value?.getCheckedNodes();
    console.log('编辑表单 - 选中的节点:', selectedNodes);

    // 创建一个数组保存选中的机构名称
    const selectedOrgNames: string[] = [];

    // 将选中的节点label(机构名称)添加到数组中
    if (selectedNodes && selectedNodes.length > 0) {
      selectedNodes.forEach((node: any) => {
        if (node.label) {
          selectedOrgNames.push(node.label);
        }
      });
    }

    console.log('编辑表单 - 选中的机构名称:', selectedOrgNames);

    // 使用选中的机构名称作为organization值
    const params = {
      ...editFormData,
      organization: selectedOrgNames.length > 0 ? selectedOrgNames.join(',') : '',
    };

    console.log('编辑表单 - 提交数据:', params);

    // staffId 单独传
    await StaffAPI.updateStaff(editFormData.id, params);
    ElMessage.success("更新成功");
    editDialogVisible.value = false;
    fetchStaffList();
  } catch (error) {
    console.error("编辑表单提交失败:", error);
    ElMessage.error("更新失败");
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

// 跳转到详情页
const goToDetail = (row: any) => {
  // 实现跳转到详情页的逻辑
  console.log("跳转到详情页", row);
};

// 修改密码
const changePassword = (row: any) => {
  currentStaffId.value = row.id;
  passwordForm.newPassword = "";
  passwordDialogVisible.value = true;
  nextTick(() => {
    passwordFormRef.value?.clearValidate();
  });
};

// 恢复默认
const resetColumns = () => {
  checkedProps.value = allColumns.map((c) => c.prop);
};

// 图片上传相关
const imageUrl = ref("");

const handleAvatarSuccess: UploadProps["onSuccess"] = (response, uploadFile) => {
  imageUrl.value = URL.createObjectURL(uploadFile.raw!);
  addFormData.photoUrl = response;
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

  // 获取职位下拉数据
  const posRes = await PositionAPI.getPositionSelectList();
  // 假设返回数组为 [{ positionName, id }, ...]
  positionOptions.value = (posRes || []).map((item: any) => ({
    label: item.positionName,
    value: item.id,
  }));
  console.log("获取机构信息", data.value);
  console.log("组件已挂载，treeRef 状态：", treeRef.value ? "正常" : "异常");
});
const treeRef = ref(null);

// 获取选中节点
const handleCheck = () => {
  const keys = treeRef.value;
  console.log("选中变化时获取：", keys || "ref 未绑定");
};

const getSelected = () => { };

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

// 显示转机构对话框
const showTransferDialog = () => {
  if (!Delarr.value || Delarr.value.length === 0) {
    ElMessage.warning('请先选择要转机构的员工');
    return;
  }

  transferDialogVisible.value = true;
  nextTick(() => {
    if (transferTreeRef.value) {
      transferTreeRef.value.setCheckedKeys([]);
    }
  });
};

// 提交转机构
const submitTransfer = async () => {
  if (!transferTreeRef.value) {
    ElMessage.warning('组件初始化失败');
    return;
  }

  const selectedNodes = transferTreeRef.value.getCheckedNodes();
  if (!selectedNodes || selectedNodes.length === 0) {
    ElMessage.warning('请选择至少一个目标机构');
    return;
  }

  // 获取选中的机构ID
  const organizationIds = selectedNodes.map((node: any) => node.id);

  try {
    await StaffAPI.staffOrganization(Delarr.value, organizationIds);
    ElMessage.success('转机构操作成功');
    transferDialogVisible.value = false;
    fetchStaffList(); // 刷新列表
  } catch (error) {
    console.error('转机构操作失败:', error);
    ElMessage.error('转机构操作失败');
  }
};

// 递归查找所有匹配名称的节点id
function findIdsByNames(treeData: any, names: any) {
  const ids: any[] = [];
  function traverse(nodes: any) {
    nodes.forEach((node: any) => {
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

const handleChangeStatus = (status: any) => {
  // Delarr.value 是你存放已选员工id的数组
  if (!Delarr.value || Delarr.value.length === 0) {
    ElMessage.warning("请先选择要操作的员工");
    return;
  }
  openStatusDialog(status);
};

// 新增
const passwordDialogVisible = ref(false);
const passwordFormRef = ref<FormInstance>();
const passwordForm = reactive({
  newPassword: "",
});
const passwordRules = {
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 6, message: "密码长度不能少于6位", trigger: "blur" },
  ],
};
const currentStaffId = ref("");

// 提交新密码的方法
const submitPassword = async () => {
  await passwordFormRef.value?.validate();
  try {
    await StaffAPI.updateStaffPassword(currentStaffId.value, passwordForm.newPassword);
    ElMessage.success("密码修改成功");
    passwordDialogVisible.value = false;
  } catch (e) {
    ElMessage.error("密码修改失败");
  }
};

const resetAddForm = () => {
  Object.assign(addFormData, {
    staffName: "",
    staffAccount: "",
    staffPassword: "",
    staffPhone: "",
    status: 1,
    organization: "",
    staffGender: "",
    positionId: "",
    staffTypeId: "",
    entryDate: "",
    education: "",
    birthday: "",
    graduationSchool: "",
    introduction: "",
    photoUrl: "",
  });
  addFormRef.value?.resetFields();
  imageUrl.value = "";         // 清空图片
  shanji.value = [];           // 清空机构ID数组
  if (treeRef.value) {
    treeRef.value.setCheckedKeys([]); // 清空树选中
  }
};

const resetEditForm = () => {
  Object.assign(editFormData, {
    staffName: "",
    staffAccount: "",
    staffPhone: "",
    status: 1,
    organization: "",
    staffGender: "",
    positionId: "",
    staffTypeId: "",
    entryDate: "",
    education: "",
    birthday: "",
    graduationSchool: "",
    introduction: "",
    photoUrl: "",
  });
  editFormRef.value?.resetFields();
};

const orgTreeData = ref([]);
const selectedOrgId = ref<string | null>(null);

function handleOrgNodeClick(node: any) {
  selectedOrgId.value = node.id;
  fetchStaffList(); // 查询员工
}

onMounted(async () => {
  orgTreeData.value = await getOrganizationTree("00000000-0000-0000-0000-000000000000");
});

</script>

<style scoped>
.staff-page {
  display: flex;
  height: 100%;
}

.left-tree {
  width: 240px;
  min-width: 200px;
  background: #fff;
  border-right: 1px solid #f0f0f0;
  padding: 16px 0 16px 16px;
  box-sizing: border-box;
}

.right-content {
  flex: 1;
  padding: 16px;
  overflow: auto;
}

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

.transfer-dialog-content {
  margin-bottom: 15px;
}

.transfer-dialog-content p {
  margin-bottom: 15px;
  font-weight: 500;
}
</style>