<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item prop="roleName" label="角色名称">
          <el-input
            v-model="queryParams.roleName"
            placeholder="请输入角色名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item class="search-buttons">
          <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
          <el-button :icon="Refresh" @click="handleResetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="hover" class="data-table">
      <!-- 工具栏 -->
      <div class="data-table__toolbar">
        <div class="data-table__toolbar--actions">
          <el-button type="success" :icon="Plus" @click="handleAdd">新增</el-button>
          <el-button
            type="danger"
            :disabled="selectedRoles.length === 0"
            :icon="Delete"
            @click="handleBatchDelete"
          >
            删除
          </el-button>
        </div>
      </div>

      <!-- 数据表格 -->
      <el-table ref="dataTableRef" v-loading="loading" :data="roleList" highlight-current-row border
        class="data-table__content" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="角色名称" prop="roleName" min-width="120" />
        <el-table-column label="角色编码" prop="roleEncode" width="150" />
        <el-table-column label="操作" width="250">
          <template #default="scope">
            <el-button type="primary" size="small" link :icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" link :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
            <el-button type="primary" size="small" link @click="handleAssignPermission(scope.row)">分配权限</el-button>
            <el-button type="success" size="small" link @click="handleConfigStaff(scope.row)">移除人员</el-button>
            <el-button type="primary" size="small" link @click="handleAddStaff(scope.row)">配置人员</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <pagination
          v-model:total="total"
          v-model:page="queryParams.pageIndex"
          v-model:limit="queryParams.pageSize"
          @pagination="handlePagination"
        />
        <div class="pagination-info">
          共 {{ total }} 条 第{{ queryParams.pageIndex }}页/{{ totalPage }}页
        </div>
      </div>
    </el-card>

    <!-- 添加/修改角色对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      append-to-body
      @closed="resetForm"
    >
      <el-form
        ref="roleFormRef"
        :model="roleForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="roleForm.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input
            v-model="roleForm.roleDesc"
            type="textarea"
            placeholder="请输入角色描述"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog v-if="permissionDialogVisible" v-model="permissionDialogVisible" :key="currentRoleId" title="分配权限"
      width="950px" :close-on-click-modal="false" class="permission-dialog" destroy-on-close>
      <div class="permission-dialog-content">
        <el-card v-for="(group, index) in permissionTreeData" :key="index" class="permission-card" shadow="never">
          <template #header>
            <div class="card-header">
              <el-checkbox :model-value="getGroupCheckedState(group).all"
                :indeterminate="getGroupCheckedState(group).indeterminate"
                @change="(checked) => handleGroupCheckChange(group, checked as boolean)">
                <span class="card-title">{{ group.label }}</span>
              </el-checkbox>
            </div>
          </template>

          <!-- ====================== -->
          <div class="card-content">
            <el-checkbox-group v-model="checkedPermissions">
              <el-checkbox v-for="item in group.children" :key="item.value" :label="item.value"
                class="permission-checkbox">
                {{ item.label }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </el-card>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="permissionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSavePermissions">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 移除人员对话框 -->
    <el-dialog v-model="staffDialogVisible" title="移除角色人员" width="1000px" :close-on-click-modal="false">
      <div class="staff-dialog-header">
        <span class="staff-dialog-title">角色: {{ currentRoleName }}</span>
      </div>

      <el-table v-loading="staffLoading" :data="roleStaffList" border style="width: 100%; margin-bottom: 15px;"
        @selection-change="handleStaffSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="序号" type="index" />
        <el-table-column label="姓名" prop="staffName" />
        <el-table-column label="电话" prop="staffTel" />
        <el-table-column label="岗位" prop="staffJob" />
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <Pagination v-model:total="staffTotal" v-model:page="staffQueryParams.pageIndex"
          v-model:limit="staffQueryParams.pageSize" @pagination="handleStaffPagination" />
        <div class="pagination-info">
          共 {{ staffTotal }} 条 第{{ staffQueryParams.pageIndex }}页
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="staffDialogVisible = false">关闭</el-button>
          <el-button type="danger" :disabled="selectedStaffIds.length === 0"
            @click="handleRemoveSelectedStaff">移除人员</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 配置人员对话框 -->
    <el-dialog v-model="addStaffDialogVisible" title="配置角色人员" width="1000px" :close-on-click-modal="false">
      <div class="staff-dialog-header">
        <span class="staff-dialog-title">角色: {{ currentRoleName }}</span>
      </div>

      <el-table v-loading="addStaffLoading" :data="staffsNotInRoleList" border style="width: 100%; margin-bottom: 15px;"
        @selection-change="handleAddStaffSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="序号" type="index" />
        <el-table-column label="姓名" prop="staffName" />
        <el-table-column label="电话" prop="staffTel" />
        <el-table-column label="岗位" prop="staffJob" />
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <Pagination v-model:total="addStaffTotal" v-model:page="addStaffQueryParams.pageIndex"
          v-model:limit="addStaffQueryParams.pageSize" @pagination="handleAddStaffPagination" />
        <div class="pagination-info">
          共 {{ addStaffTotal }} 条 第{{ addStaffQueryParams.pageIndex }}页
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addStaffDialogVisible = false">关闭</el-button>
          <el-button type="primary" :disabled="selectedAddStaffIds.length === 0"
            @click="handleAddSelectedStaff">添加人员</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue';
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus';
import { Search, Refresh, Delete, Edit, Plus } from '@element-plus/icons-vue';
import RoleManagerAPI, { RoleQueryParams, RoleItem, RoleData, getRoleStaffList, removeStaffFromRole, getStaffsNotInRole, assignRoleToStaff } from '@/api/RBAC/RoleManager/RoleManager';
import Pagination from '@/components/Pagination/index.vue';
import { getPermissionTree, addRolePermission, getRolePermissions } from '@/api/RBAC/PermissionManager/PermissionManager';

defineOptions({
  name: "RoleList",
  inheritAttrs: false,
});

const queryFormRef = ref<FormInstance>();
const loading = ref(false);
const selectedRoles = ref<string[]>([]);
const total = ref(0);
const totalPage = ref(1);
const roleList = ref<RoleItem[]>([]);

const queryParams = reactive<RoleQueryParams>({
  pageIndex: 1,
  pageSize: 10,
  roleName: '',
});

const dialogVisible = ref(false);
const dialogTitle = ref('');
const roleFormRef = ref<FormInstance>();
const roleForm = reactive<RoleData>({
  roleName: '',
  roleEncode: 'ROLE_DEFAULT',
  roleDesc: '',
  roleStatus: 1,
});
const isEdit = ref(false);
const currentId = ref<string>('');

const rules = reactive<FormRules>({
  roleName: [
    { required: true, message: '角色名称不能为空', trigger: 'blur' },
    { min: 2, max: 50, message: '角色名称长度应在2到50个字符之间', trigger: 'blur' }
  ],
  roleDesc: [
    { max: 255, message: '角色描述长度不能超过255个字符', trigger: 'blur' }
  ]
});

// --- 权限分配相关 ---
const permissionDialogVisible = ref(false);
const permissionTreeData = ref<any[]>([]);
const currentRoleId = ref('');
const checkedPermissions = ref<string[]>([]);

const getGroupCheckedState = (group: any) => {
  if (!group.children || group.children.length === 0) {

    return { all: false, indeterminate: false };
  }
  const childIds = group.children.map((item: any) => item.value);
  const checkedCount = childIds.filter((id: string) => checkedPermissions.value.includes(id)).length;

  return {
    all: checkedCount === childIds.length && childIds.length > 0,
    indeterminate: checkedCount > 0 && checkedCount < childIds.length,
  };
};

const handleGroupCheckChange = (group: any, checked: boolean) => {
  const childIds = group.children.map((item: any) => item.value);
  const checkedSet = new Set(checkedPermissions.value);
  if (checked) {
    childIds.forEach((id: string) => checkedSet.add(id));
  } else {
    childIds.forEach((id: string) => checkedSet.delete(id));
  }
  checkedPermissions.value = Array.from(checkedSet);
};

const handleAssignPermission = async (row: RoleItem) => {
  try {
    currentRoleId.value = row.id;

    // 加载所有权限
    const treeResponse = await getPermissionTree();
    permissionTreeData.value = treeResponse?.data || treeResponse || [];

    // 获取并设置已有权限
    const rolePermissionsResponse = await getRolePermissions(row.id);
    const permissions = rolePermissionsResponse || [];
    console.log('当前角色权限:', permissions);
    console.log('权限树数据:', permissionTreeData.value);

    // 处理权限数据并设置选中状态
    if (Array.isArray(permissions)) {
      if (permissions.length > 0) {
        if (typeof permissions[0] === 'string') {
          // 如果是字符串数组，直接使用
          checkedPermissions.value = permissions;
        } else if (typeof permissions[0] === 'object' && permissions[0] !== null) {
          // 如果是对象数组，提取id作为value
          checkedPermissions.value = permissions
            .filter(item => item && typeof item === 'object' && 'id' in item)
            .map(item => item.id);

          // 确保权限树数据的value和label与后端返回的id和permissionName匹配
          const permissionMap = new Map(
            permissions.map(item => [item.id, item.permissionName])
          );



          // 更新权限树数据的value和label
          const updateTreeData = (nodes: any[]) => {
            nodes.forEach(node => {
              if (permissionMap.has(node.value)) {
                // 如果找到匹配的权限，确保label匹配
                node.label = permissionMap.get(node.value);
              }
              if (node.children && node.children.length > 0) {
                updateTreeData(node.children);
              }
            });
          };

          updateTreeData(permissionTreeData.value);
        }
      } else {
        // 空数组表示没有权限
        checkedPermissions.value = [];
      }
    } else {
      // 非数组数据
      console.warn('权限数据不是数组格式:', permissions);
      checkedPermissions.value = [];
    }

    permissionDialogVisible.value = true;
  } catch (error) {
    console.error('加载权限数据失败:', error);
    ElMessage.error('加载权限数据失败，请重试');
  }
};

const handleSavePermissions = async () => {
  try {
    await addRolePermission({
      roleId: currentRoleId.value,
      permissionIds: checkedPermissions.value
    });
    ElMessage.success('权限分配成功');
    permissionDialogVisible.value = false;
  } catch (error) {
    console.error('权限分配失败:', error);
    ElMessage.error('权限分配失败');
  }
};
// --- 权限分配结束 ---

// 配置人员相关
const staffDialogVisible = ref(false);
const staffLoading = ref(false);
const currentRoleName = ref('');
const roleStaffList = ref<any[]>([]);
const staffTotal = ref(0);
const selectedStaffIds = ref<string[]>([]);
const addStaffDialogVisible = ref(false);
const addStaffLoading = ref(false);
const staffsNotInRoleList = ref<any[]>([]);
const addStaffTotal = ref(0);
const selectedAddStaffIds = ref<string[]>([]);

const staffQueryParams = reactive({
  pageIndex: 1,
  pageSize: 5 // 使用默认值5
});

const addStaffQueryParams = reactive({
  pageIndex: 1,
  pageSize: 5 // 使用默认值5
});

// 打开配置人员对话框
const handleConfigStaff = async (row: RoleItem) => {
  currentRoleId.value = row.id;
  currentRoleName.value = row.roleName;
  staffDialogVisible.value = true;
  staffQueryParams.pageIndex = 1;
  await fetchRoleStaffList();
};

// 获取角色下的人员列表
const fetchRoleStaffList = async () => {
  if (!currentRoleId.value) return;

  staffLoading.value = true;
  try {
    const response = await getRoleStaffList(
      currentRoleId.value,
      staffQueryParams.pageIndex,
      staffQueryParams.pageSize
    );

    console.log('完整响应:', response);

    // 根据接口返回结构处理数据
    if (response) {
      // 从第一张图可以看出，数据结构是:
      // { totleCount: 1, totlePage: 1, data: [{ roleId: "...", children: [...] }] }
      if (response.data && response.data.length > 0) {
        roleStaffList.value = response.data[0].children || [];
        console.log('角色人员数据:', roleStaffList.value);
      } else {
        roleStaffList.value = [];
      }

      // 使用后台返回的totleCount
      staffTotal.value = response.totleCount || 0;
    } else {
      roleStaffList.value = [];
      staffTotal.value = 0;
    }
  } catch (error) {
    console.error('获取角色人员列表失败:', error);
    // 移除错误提示，即使获取失败也不显示错误消息
    // ElMessage.error('获取角色人员列表失败');
    roleStaffList.value = [];
    staffTotal.value = 0;
  } finally {
    staffLoading.value = false;
  }
};

// 处理人员分页
const handleStaffPagination = ({ page, limit }: { page: number; limit: number }) => {
  staffQueryParams.pageIndex = page;
  staffQueryParams.pageSize = limit;
  fetchRoleStaffList();
};

// 添加处理表格选择变化的方法
const handleStaffSelectionChange = (selection: any[]) => {
  selectedStaffIds.value = selection.map(item => item.staffId);
  console.log('选中的人员ID:', selectedStaffIds.value);
};

// 修改添加人员按钮为移除人员按钮，并修改其功能
const handleRemoveSelectedStaff = () => {
  if (selectedStaffIds.value.length === 0) {
    ElMessage.warning('请选择要移除的人员');
    return;
  }

  ElMessageBox.confirm(`确认要从角色"${currentRoleName.value}"中移除选中的${selectedStaffIds.value.length}名人员吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await removeStaffFromRole(currentRoleId.value, selectedStaffIds.value);
      ElMessage.success('移除成功');
      selectedStaffIds.value = []; // 清空选中
      fetchRoleStaffList(); // 刷新列表
    } catch (error) {
      console.error('移除人员失败:', error);
      ElMessage.error('移除人员失败');
    }
  }).catch(() => {
    ElMessage.info('已取消移除');
  });
};

// 获取不在角色下的人员列表
const fetchStaffsNotInRoleList = async () => {
  if (!currentRoleId.value) return;

  addStaffLoading.value = true;
  try {
    const response = await getStaffsNotInRole(
      currentRoleId.value,
      addStaffQueryParams.pageIndex,
      addStaffQueryParams.pageSize
    );

    console.log('不在角色下的人员响应:', response);

    // 根据接口返回结构处理数据
    if (response) {
      // 使用后台返回的totleCount
      addStaffTotal.value = response.totleCount || 0;
      console.log('总条数:', addStaffTotal.value);

      // 检查返回的data是否为数组且有内容
      if (Array.isArray(response.data) && response.data.length > 0) {
        if (response.data[0]?.children) {
          staffsNotInRoleList.value = response.data[0].children;
        } else {
          staffsNotInRoleList.value = response.data;
        }
      } else {
        staffsNotInRoleList.value = [];
      }

      console.log('不在角色下的人员数据:', staffsNotInRoleList.value);
    } else {
      staffsNotInRoleList.value = [];
      addStaffTotal.value = 0;
    }
  } catch (error) {
    console.error('获取不在角色下的人员列表失败:', error);
    staffsNotInRoleList.value = [];
    addStaffTotal.value = 0;
  } finally {
    addStaffLoading.value = false;
  }
};

// 处理人员分页
const handleAddStaffPagination = ({ page, limit }: { page: number; limit: number }) => {
  addStaffQueryParams.pageIndex = page;
  addStaffQueryParams.pageSize = limit;
  fetchStaffsNotInRoleList();
};

// 添加处理表格选择变化的方法
const handleAddStaffSelectionChange = (selection: any[]) => {
  // 清空之前的选择
  selectedAddStaffIds.value = [];

  // 将选中的人员ID添加到数组中
  for (const item of selection) {
    if (item.staffId) {
      selectedAddStaffIds.value.push(item.staffId);
    }
  }

  console.log('选中的人员ID:', selectedAddStaffIds.value);
};

// 打开配置人员对话框
const handleAddStaff = async (row: RoleItem) => {
  currentRoleId.value = row.id;
  currentRoleName.value = row.roleName;
  addStaffDialogVisible.value = true;
  addStaffQueryParams.pageIndex = 1;
  await fetchStaffsNotInRoleList();
};

// 添加选中人员到角色
const handleAddSelectedStaff = () => {
  if (selectedAddStaffIds.value.length === 0) {
    ElMessage.warning('请选择要添加的人员');
    return;
  }

  ElMessageBox.confirm(`确认要添加选中的${selectedAddStaffIds.value.length}名人员到角色"${currentRoleName.value}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 调用API将选中的人员添加到角色
      await assignRoleToStaff({
        roleId: currentRoleId.value,
        staffIds: selectedAddStaffIds.value
      });

      ElMessage.success('添加成功');
      selectedAddStaffIds.value = []; // 清空选中

      // 刷新列表数据
      await fetchStaffsNotInRoleList();

      // 如果配置了移除人员的列表，也一并刷新
      if (staffDialogVisible.value) {
        await fetchRoleStaffList();
      }
    } catch (error) {
      console.error('添加人员失败:', error);
      ElMessage.error('添加人员失败');
    }
  }).catch(() => {
    ElMessage.info('已取消添加');
  });
};

function fetchData() {
  loading.value = true;
  RoleManagerAPI.getRoleList(queryParams)
    .then((response) => {
      if (response) {
        roleList.value = response.data || [];
        total.value = response.totleCount || 0;
        totalPage.value = response.totlePage || 1;
      } else {
        roleList.value = [];
        total.value = 0;
        totalPage.value = 1;
      }
    })
    .catch((error) => {
      console.error('获取角色列表失败:', error);
      ElMessage.error('获取角色列表失败');
    })
    .finally(() => {
      loading.value = false;
    });
}

function handlePagination({ page, limit }: { page: number; limit: number }) {
  queryParams.pageIndex = page;
  queryParams.pageSize = limit;
  fetchData();
}

function handleQuery() {
  queryParams.pageIndex = 1;
  fetchData();
}

function handleResetQuery() {
  queryFormRef.value?.resetFields();
  queryParams.pageIndex = 1;
  fetchData();
}

function handleSelectionChange(selection: RoleItem[]) {
  selectedRoles.value = selection.map(item => item.id);
}

function handleAdd() {
  isEdit.value = false;
  currentId.value = '';
  resetForm();
  dialogTitle.value = '添加角色';
  dialogVisible.value = true;
}

function handleEdit(row: RoleItem) {
  isEdit.value = true;
  currentId.value = row.id;
  Object.assign(roleForm, row);
  dialogTitle.value = '编辑角色';
  dialogVisible.value = true;
}

function resetForm() {
  if (roleFormRef.value) {
    roleFormRef.value.resetFields();
    roleForm.roleName = '';
    roleForm.roleDesc = '';
    roleForm.roleEncode = 'ROLE_DEFAULT';
    roleForm.roleStatus = 1;
  }
}

function submitForm() {
  roleFormRef.value?.validate((valid) => {
    if (valid) {
      const apiCall = isEdit.value ? RoleManagerAPI.updateRole(currentId.value, roleForm) : RoleManagerAPI.createRole(roleForm);
      const successMessage = isEdit.value ? '修改角色成功' : '添加角色成功';
      const errorMessage = isEdit.value ? '修改角色失败' : '添加角色失败';

      apiCall.then(() => {
        ElMessage.success(successMessage);
        dialogVisible.value = false;
        fetchData();
      }).catch((error) => {
        console.error(errorMessage, error);
        ElMessage.error(errorMessage);
      });
    }
  });
}

function handleDelete(row: RoleItem) {
  ElMessageBox.confirm(`确认要删除角色"${row.roleName}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteRoles([row.id]);
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
}

function handleBatchDelete() {
  if (selectedRoles.value.length === 0) {
    ElMessage.warning('请选择要删除的角色');
    return;
  }
  ElMessageBox.confirm(`确认要删除选中的${selectedRoles.value.length}个角色吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteRoles(selectedRoles.value);
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
}

function deleteRoles(ids: string[]) {
  const promises = ids.map(id => RoleManagerAPI.deleteRole(id));
  Promise.all(promises)
    .then(() => {
      ElMessage.success(`成功删除${ids.length}个角色`);
      fetchData();
    })
    .catch(error => {
      console.error('删除角色失败:', error);
      ElMessage.error('删除角色失败');
    });
}

onMounted(() => {
  fetchData();
});

onBeforeUnmount(() => {
  dialogVisible.value = false;
  roleList.value = [];
});
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.search-container {
  margin-bottom: 20px;
  background-color: #fff;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.search-buttons {
  margin-left: 10px;
}

.data-table {
  margin-bottom: 20px;
}

.data-table__toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.data-table__toolbar--actions {
  display: flex;
  gap: 8px;
}

.data-table__content {
  margin-bottom: 16px;
}

.pagination-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 16px;
}

.pagination-info {
  margin-top: 8px;
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}

.dialog-footer {
  text-align: right;
}

// --- 权限分配对话框样式 ---
.permission-dialog {
  :deep(.el-dialog__body) {
    padding: 15px 20px;
    max-height: 70vh;
    overflow-y: auto;
  }
}

.permission-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.permission-card {
  border-radius: 4px;
  border: 1px solid #e4e7ed;

  :deep(.el-card__header) {
    background-color: #f5f7fa;
    padding: 10px 15px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-title {
    font-weight: bold;
    font-size: 15px;
  }

  :deep(.el-card__body) {
    padding: 15px;
  }

  .card-content .el-checkbox-group {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
    font-size: 14px;
  }
}

.permission-checkbox {
  margin-right: 0 !important;
}
</style>
