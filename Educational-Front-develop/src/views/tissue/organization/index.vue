<template>
  <div class="organization-management">
    <!-- 组织机构树形表格 -->
    <el-table ref="tableRef" :data="treeData" style="width: 100%" border row-key="id" lazy :load="load"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" default-expand-all
      @selection-change="selectAll">
      <el-table-column type="selection" width="50" />
      <el-table-column prop="name" label="机构名称" min-width="120" />
      <el-table-column prop="shortName" label="全称" min-width="150" />
      <el-table-column prop="levelId" label="级别" min-width="80" />
      <el-table-column prop="contactPerson" label="联系人" min-width="100" />
      <el-table-column prop="phone" label="电话" min-width="120" />
      <el-table-column label="操作" min-width="200">
        <template #default="{ row }">
          <el-button type="text" @click="showAddDialog(row)">添加子机构</el-button>
          <el-button type="text" @click="showEditDialog(row)">编辑</el-button>
          <el-button type="text" @click="handleDelete(row)">删除</el-button>
          <el-button type="text" @click="handleView(row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="40%" @closed="resetForm">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="机构名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入机构名称" />
        </el-form-item>
        <el-form-item label="全称" prop="fullName">
          <el-input v-model="formData.fullName" placeholder="请输入机构全称" />
        </el-form-item>
        <el-form-item label="级别" prop="level">
          <el-select v-model="formData.level" placeholder="请选择机构级别">
            <el-option v-for="item in levelOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系人" prop="contactPerson">
          <el-input v-model="formData.contactPerson" placeholder="请输入联系人" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入电话" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确认</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 查看对话框 -->
    <el-dialog v-model="viewDialogVisible" title="机构详情" width="30%">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="机构名称">{{ viewData.name }}</el-descriptions-item>
        <el-descriptions-item label="全称">{{ viewData.fullName }}</el-descriptions-item>
        <el-descriptions-item label="级别">{{ viewData.levelName }}</el-descriptions-item>
        <el-descriptions-item label="联系人">{{ viewData.contactPerson }}</el-descriptions-item>
        <el-descriptions-item label="电话">{{ viewData.phone }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus";
import OrganizationAPI from "@/api/Organization/organizations.api";
// 树形结构数据
const treeData = ref<any[]>([]);
const tableRef = ref();
// 级别下拉
const levelOptions = ref<any[]>([]);
// 弹窗相关
const dialogVisible = ref(false);
const dialogTitle = ref("新增机构");
const formRef = ref<FormInstance>();
const isAdd = ref(true);
// 1. 新增接口定义
interface IOrganizationForm {
  id: string;
  name: string;
  fullName: string;
  level: string;
  contactPerson: string;
  phone: string;
  parentId: string;
}
const formData = reactive<IOrganizationForm>({
  id: "",
  name: "",
  fullName: "",
  level: "",
  contactPerson: "",
  phone: "",
  parentId: "",
});
const rules: FormRules = {
  name: [{ required: true, message: "请输入机构名称", trigger: "blur" }],
  fullName: [{ required: true, message: "请输入机构全称", trigger: "blur" }],
  level: [{ required: true, message: "请选择机构级别", trigger: "change" }],
};
// 查看对话框
const viewDialogVisible = ref(false);
const viewData = reactive<any>({});
// 懒加载子节点
const load = async (
  row: IOrganizationForm,
  treeNode: unknown,
  resolve: (data: IOrganizationForm[]) => void
) => {
  setTimeout(() => {
    if (row.id === '00000000-0000-0000-0000-000000000000') {
      resolve([]);
    } else {
      resolve([]);
    }
  }, 500);
};
// 获取顶级节点
const fetchOrganizationList = () => {
  OrganizationAPI.getOrganizationTreeAll("00000000-0000-0000-0000-000000000000").then((res) => {
    treeData.value = res.data;
  });
};
// 获取级别下拉
const fetchLevelOptions = async () => {
  const res = await OrganizationAPI.getOrganizationLevelList();
  levelOptions.value = (res.data || []).map((item: any) => ({ label: item.name, value: item.value }));
};
// 新增弹窗
function showAddDialog(parent?: any) {
  isAdd.value = true;
  dialogTitle.value = '添加子机构';
  formData.parentId = parent?.id || "";
  dialogVisible.value = true;
}
// 编辑弹窗
function showEditDialog(row: any) {
  isAdd.value = false;
  dialogTitle.value = "编辑机构";
  Object.assign(formData, row);
  dialogVisible.value = true;
}
//全选 全部选
const Ids = ref([]);
const selectAll = (id: any) => {
  Ids.value = id.map((item: any) => (item.id));
  console.log("ids=>", Ids.value);
}
// 批量删除
const handleDelete = (row?: any) => {
  let ids: string[] = [];
  if (row) {
    ids = [row.id];
  } else {
    ids = Ids.value;
  }
  if (!ids.length) {
    ElMessage.warning("请先选择要删除的机构！");
    return;
  }
  ElMessageBox.confirm(
    '确认删除吗?',
    'Warning',
    {
      confirmButtonText: '确认',
      cancelButtonText: ' 取消',
      type: 'warning',
    }
  )
    .then(() => {
      const params = {
        ids: Ids.value,
      };
      OrganizationAPI.batchDeleteOrganization(params).then((res) => {
        console.log("组织批量删除=>", res);
        ElMessage.success("删除成功");
      });
      fetchOrganizationList();
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '删除已取消',
      })
    })
}
// // 重置表单
// const resetForm = () => {
//   formData.id = "";
//   formData.name = "";
//   formData.fullName = "";
//   formData.level = "";
//   formData.contactPerson = "";
//   formData.phone = "";
//   formData.parentId = "";
// }
//添加修改
const submitForm = () => {
  (formRef.value as FormInstance).validate((valid) => {
    if (valid) {
      if (isAdd.value) {
        OrganizationAPI.createOrganization(formData).then((res) => {
          console.log("组织添加=>", res);
          ElMessage.success("添加成功");
        });
      } else {
        OrganizationAPI.updateOrganization(formData.id, formData).then((res) => {
          console.log("组织修改=>", res);
          ElMessage.success("修改成功");
        });
      }
      dialogVisible.value = false;
      fetchOrganizationList();
    }
  });
}
// 查看
function handleView(row: any) {
  Object.assign(viewData, row);
  viewDialogVisible.value = true;
}

onMounted(() => {
  fetchOrganizationList();
  fetchLevelOptions();
});
</script>

<style scoped>
.organization-management {
  padding: 24px;
  background: #fafafa;
  min-height: 100vh;
}

.search-bar {
  margin-bottom: 12px;
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
