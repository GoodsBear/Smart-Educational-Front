<template>
  <div>
    <!-- 部门数据表格 -->
    <el-table :data="tableData1" style="width: 100%" row-key="id" border lazy :load="load"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" :expand-row-keys="expandedRowKeys">
      <el-table-column prop="shortName" label="机构名称" />
      <el-table-column prop="name" label="全称" width="150" />
      <el-table-column prop="levelName" label="级别" width="120" />
      <el-table-column prop="contactPerson" label="联系人" width="150" />
      <el-table-column prop="phone" label="电话" width="130" />
      <el-table-column label="操作" width="400">
        <template #default="scope">
          <el-button type="primary" size="small" @click="openAddDialog(scope.row)">
            增加子机构
          </el-button>
          <el-button type="primary" size="small" @click="openEditDialog(scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
          <el-button type="primary" size="small" @click="handleView(scope.row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="addDialogVisible" title="新增子机构" width="600px">
      <el-form ref="addFormRef" :model="addForm" :rules="addRules" label-width="100px">
        <el-form-item label="机构名" prop="name" required>
          <el-input v-model="addForm.name" />
        </el-form-item>
        <el-form-item label="级别" prop="levelId" required>
          <el-select v-model="addForm.levelId" placeholder="请选择">
            <el-option v-for="item in levelList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="简称" prop="shortName" required>
          <el-input v-model="addForm.shortName" />
        </el-form-item>
        <el-form-item label="联系人" prop="contactPerson" required>
          <el-input v-model="addForm.contactPerson" />
        </el-form-item>
        <el-form-item label="电话" prop="phone" required>
          <el-input v-model="addForm.phone" />
        </el-form-item>
        <el-form-item label="传真" prop="fax">
          <el-input v-model="addForm.fax" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="addForm.sortOrder" :min="0" />
        </el-form-item>
        <el-form-item label="状态" prop="isActive">
          <el-switch v-model="addForm.isActive" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="说明" prop="description">
          <el-input v-model="addForm.description" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAddForm">提交</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="editDialogVisible" title="编辑组织机构" width="600px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <el-form-item label="机构名" prop="name" required>
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="级别" prop="levelId" required>
          <el-select v-model="editForm.levelId" placeholder="请选择">
            <el-option v-for="item in levelList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="简称" prop="shortName" required>
          <el-input v-model="editForm.shortName" />
        </el-form-item>
        <el-form-item label="联系人" prop="contactPerson" required>
          <el-input v-model="editForm.contactPerson" />
        </el-form-item>
        <el-form-item label="电话" prop="phone" required>
          <el-input v-model="editForm.phone" />
        </el-form-item>
        <el-form-item label="传真" prop="fax">
          <el-input v-model="editForm.fax" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="editForm.sortOrder" :min="0" />
        </el-form-item>
        <el-form-item label="状态" prop="isActive">
          <el-switch v-model="editForm.isActive" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="说明" prop="description">
          <el-input v-model="editForm.description" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEditForm">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="infoDialogVisible" title="组织机构基本信息" width="500px">
      <el-form :model="infoForm" label-width="100px">
        <el-form-item label="机构名称">
          <el-input v-model="infoForm.name" disabled />
        </el-form-item>
        <el-form-item label="简称">
          <el-input v-model="infoForm.shortName" disabled />
        </el-form-item>
        <el-form-item label="级别">
          <el-input v-model="infoForm.levelName" disabled />
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="infoForm.contactPerson" disabled />
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="infoForm.phone" disabled />
        </el-form-item>
        <el-form-item label="传真">
          <el-input v-model="infoForm.fax" disabled />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="infoForm.email" disabled />
        </el-form-item>
        <el-form-item label="排序">
          <el-input v-model="infoForm.sortOrder" disabled />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="infoForm.isActive" :active-value="1" :inactive-value="0" disabled active-text="禁用"
            inactive-text="启用" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="infoForm.description" type="textarea" disabled />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="infoDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {
  createOrganization, getOrganizationList, deleteOrganization, getOrganizationById, updateOrganization, getOrganizationLevelList, addOrganizationLevel,
  getOrganizationDropdown, getOrganizationTreeAll, getOrganizationTree, getOrganizationTreeSimple
} from "@/api/Organization/organization.api"
import { ElMessage, ElMessageBox } from 'element-plus'

interface Organization {
  id: string;
  shortName: string;
  name: string;
  levelName: string;
  contactPerson: string;
  phone: string;
  hasChildren?: boolean;
  children?: Organization[];
}

const tableData1 = ref([]);
const expandedRowKeys = ref<string[]>([]);

const load = (row: Organization, treeNode: unknown, resolve: (data: Organization[]) => void) => {
  setTimeout(() => {
    if (row.id == "00000000-0000-0000-0000-000000000000") {
      resolve([]);
    } else {
      resolve([]);
    }
  }, 1000);
};

// 递归收集所有节点id
function collectAllKeys(data: Organization[]): string[] {
  let keys: string[] = [];
  data.forEach((item) => {
    keys.push(item.id);
    if (item.children && item.children.length > 0) {
      keys = keys.concat(collectAllKeys(item.children));
    }
  });
  return keys;
}

// 获取树数据后，收集所有key
const OrganizationTree = async () => {
  try {
    const response = await getOrganizationTreeAll('00000000-0000-0000-0000-000000000000')
    tableData1.value = response
    expandedRowKeys.value = collectAllKeys(response)
  } catch (error) {
    console.error("获取部门树形数据失败:", error);
  }
};

const handleDelete = async (row: Organization) => {
  if (row.children && row.children.length > 0) {
    ElMessage.warning("当前机构下有子机构，无法删除");
    return;
  }
  ElMessageBox.confirm("确定要删除该机构吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      await deleteOrganization(row.id);
      ElMessage.success('删除成功');
      OrganizationTree();
    } catch {
      ElMessage.error("删除失败");
    }
  });
};

const addDialogVisible = ref(false);
const addFormRef = ref();
const addForm = reactive({
  name: "",
  levelId: "",
  partentedId: "", // 由openAddDialog设置
  shortName: "",
  contactPerson: "",
  phone: "",
  fax: "",
  email: "",
  sortOrder: 0,
  isActive: 1,
  description: "",
});
const addRules = {
  name: [{ required: true, message: "请输入机构名", trigger: "blur" }],
  levelId: [{ required: true, message: "请选择级别", trigger: "change" }],
  shortName: [{ required: true, message: "请输入简称", trigger: "blur" }],
  contactPerson: [{ required: true, message: "请输入联系人", trigger: "blur" }],
  phone: [
    { required: true, message: "请输入电话", trigger: "blur" },
    { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号", trigger: "blur" },
  ],
};
const levelList = ref([
  {
    id: "",
    name: "",
  },
]);

const GetLevel = async () => {
  const res = await getOrganizationLevelList()
  levelList.value = res || []
}

// 打开对话框并设置父ID
const openAddDialog = (parentRow: Organization) => {
  addForm.name = "";
  addForm.levelId = "";
  addForm.partentedId = parentRow.id;
  addForm.shortName = "";
  addForm.contactPerson = "";
  addForm.phone = "";
  addForm.fax = "";
  addForm.email = "";
  addForm.sortOrder = 0;
  addForm.isActive = 1;
  addForm.description = "";
  addDialogVisible.value = true;
};

// 提交表单
const submitAddForm = () => {
  addFormRef.value.validate(async (valid: any) => {
    if (!valid) return
    await createOrganization(addForm)
    console.log(addForm);
    ElMessage.success("新增成功");
    addDialogVisible.value = false;
    OrganizationTree();
  });
};

const editDialogVisible = ref(false);
const editFormRef = ref();
const editForm = reactive({
  id: "",
  name: "",
  levelId: "",
  shortName: "",
  contactPerson: "",
  phone: "",
  fax: "",
  email: "",
  sortOrder: 0,
  isActive: 1,
  description: "",
});
const editRules = {
  name: [{ required: true, message: "请输入机构名", trigger: "blur" }],
  levelId: [{ required: true, message: "请选择级别", trigger: "change" }],
  shortName: [{ required: true, message: "请输入简称", trigger: "blur" }],
  contactPerson: [{ required: true, message: "请输入联系人", trigger: "blur" }],
  phone: [
    { required: true, message: "请输入电话", trigger: "blur" },
    { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号", trigger: "blur" },
  ],
};

// 打开编辑弹窗并回显数据
function openEditDialog(row: Organization) {
  Object.assign(editForm, row); // 回显所有字段
  editDialogVisible.value = true;
}

// 提交编辑表单
function submitEditForm() {
  editFormRef.value.validate(async (valid: any) => {
    if (!valid) return
    await updateOrganization(editForm.id, editForm)
    ElMessage.success('修改成功')
    editDialogVisible.value = false
    OrganizationTree()
  })
}

const infoDialogVisible = ref(false);
const infoForm = reactive({
  name: "",
  shortName: "",
  levelName: "",
  contactPerson: "",
  phone: "",
  fax: "",
  email: "",
  sortOrder: 0,
  isActive: 1,
  description: "",
});

// 查看按钮事件
async function handleView(row: any) {
  try {
    const res = await getOrganizationById(row.id)
    console.log(res);

    // 字段映射
    infoForm.name = res.name || "";
    infoForm.shortName = res.shortName || "";
    infoForm.levelName = res.levelName || "";
    infoForm.contactPerson = res.contactPerson || "";
    infoForm.phone = res.phone || "";
    infoForm.fax = res.fax || "";
    infoForm.email = res.email || "";
    infoForm.sortOrder = res.sortOrder ?? 0;
    infoForm.isActive = res.isActive ?? 1;
    infoForm.description = res.description || "";
    infoDialogVisible.value = true;
  } catch {
    ElMessage.error("获取信息失败");
  }
}

// 初始根节点数据
onMounted(() => {
  OrganizationTree();
  GetLevel();
});
</script>

<style scoped></style>
