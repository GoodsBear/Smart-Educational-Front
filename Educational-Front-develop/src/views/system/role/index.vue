<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item prop="roleName" label="角色名称">
          <el-input v-model="queryParams.roleName" placeholder="请输入角色名称" clearable @keyup.enter="handleQuery" />
        </el-form-item>

        <el-form-item class="search-buttons">
          <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
          <el-button :icon="Refresh" @click="handleResetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="hover" class="data-table">
      <div class="data-table__toolbar">
        <div class="data-table__toolbar--actions">
          <el-button type="success" :icon="Plus" @click="handleAdd">新增</el-button>
          <el-button type="danger" :disabled="selectedRoles.length === 0" :icon="Delete" @click="handleBatchDelete">
            删除
          </el-button>
        </div>
      </div>

      <el-table ref="dataTableRef" v-loading="loading" :data="roleList" highlight-current-row border
        class="data-table__content" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="角色名称" prop="roleName" min-width="120" />
        <el-table-column label="角色编码" prop="roleEncode" width="150" />

        <el-table-column label="操作" width="220">
          <template #default="scope">
            <el-button type="primary" size="small" link :icon="Edit" @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" link :icon="Delete" @click="handleDelete(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <Pagination v-model:total="total" v-model:page="queryParams.pageIndex" v-model:limit="queryParams.pageSize"
          @pagination="handlePagination" />
        <div class="pagination-info">
          共 {{ total }} 条 第{{ queryParams.pageIndex }}页/{{ totalPage }}页
        </div>
      </div>
    </el-card>

    <!-- 添加/修改角色对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" append-to-body @closed="resetForm">
      <el-form ref="roleFormRef" :model="roleForm" :rules="rules" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="roleForm.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="roleForm.roleDesc" type="textarea" placeholder="请输入角色描述" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue';
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus';
import { Search, Refresh, Delete, Edit, Plus } from '@element-plus/icons-vue';
import RoleManagerAPI, { RoleQueryParams, RoleItem, RoleData } from '@/api/RBAC/RoleManager/RoleManager';
import Pagination from '@/components/Pagination/index.vue';

defineOptions({
  name: "RoleList",
  inheritAttrs: false,
});

const queryFormRef = ref();
const loading = ref(false);
const selectedRoles = ref<string[]>([]);
const total = ref(0);
const totalPage = ref(1);
const roleList = ref<RoleItem[]>([]);

// 查询参数
const queryParams = reactive<RoleQueryParams>({
  pageIndex: 1,
  pageSize: 10,
});

// 对话框相关
const dialogVisible = ref(false);
const dialogTitle = ref('');
const roleFormRef = ref<FormInstance>();
const roleForm = reactive<RoleData>({
  roleName: '',
  roleEncode: 'ROLE_DEFAULT',  // 设置默认固定值
  roleDesc: '',
  roleStatus: 1  // 默认启用
});
const isEdit = ref(false); // 是否为编辑模式
const currentId = ref<string>(''); // 当前编辑的角色ID

// 表单验证规则
const rules = reactive<FormRules>({
  roleName: [
    { required: true, message: '角色名称不能为空', trigger: 'blur' },
    { min: 2, max: 50, message: '角色名称长度应在2到50个字符之间', trigger: 'blur' }
  ],
  roleDesc: [
    { max: 255, message: '角色描述长度不能超过255个字符', trigger: 'blur' }
  ]
});

// 获取数据
function fetchData() {
  loading.value = true;
  RoleManagerAPI.getRoleList(queryParams)
    .then((response) => {

      console.log(response)

      try {
        // 直接接收后台返回的数据
        if (response) {
          roleList.value = response.data || [];
          total.value = response.totleCount || 0;
          totalPage.value = response.totlePage || 1;
        } else {
          roleList.value = [];
          total.value = 0;
          totalPage.value = 1;
        }
      } catch (err) {
        console.error('处理角色列表数据时发生错误:', err);
        roleList.value = [];
        total.value = 0;
        totalPage.value = 1;
      }
    })
    .catch((error) => {
      console.error('获取角色列表失败:', error);
      ElMessage.error('获取角色列表失败');
      roleList.value = [];
      total.value = 0;
      totalPage.value = 1;
    })
    .finally(() => {
      loading.value = false;
    });
}

// 处理分页变化
function handlePagination({ page, limit }: { page: number; limit: number }) {
  queryParams.pageIndex = page;
  queryParams.pageSize = limit;
  fetchData();
}

// 查询（重置页码后获取数据）
function handleQuery() {
  queryParams.pageIndex = 1;
  fetchData();
}

// 重置查询
function handleResetQuery() {
  queryFormRef.value?.resetFields();
  queryParams.pageIndex = 1;
  fetchData();
}

// 行复选框选中
function handleSelectionChange(selection: RoleItem[]) {
  selectedRoles.value = selection.map(item => item.id);
}

// 功能开发中提示
function handleFeatureUnderDevelopment() {
  ElMessage({
    message: '该功能正在开发中，敬请期待！',
    type: 'info'
  });
}

// 新增角色
function handleAdd() {
  isEdit.value = false;
  currentId.value = '';
  resetForm();
  dialogTitle.value = '添加角色';
  dialogVisible.value = true;
}

// 编辑角色
function handleEdit(row: RoleItem) {
  isEdit.value = true;
  currentId.value = row.id;
  resetForm();

  // 填充表单数据
  roleForm.roleName = row.roleName;
  roleForm.roleEncode = row.roleEncode;
  roleForm.roleDesc = row.roleDesc;
  roleForm.roleStatus = row.roleStatus;

  dialogTitle.value = '编辑角色';
  dialogVisible.value = true;
}

// 重置表单
function resetForm() {
  if (roleFormRef.value) {
    roleFormRef.value.resetFields();
    roleForm.roleName = '';
    roleForm.roleDesc = '';
    roleForm.roleEncode = 'ROLE_DEFAULT';
    roleForm.roleStatus = 1;
  }
}

// 提交表单
function submitForm() {
  if (!roleFormRef.value) {
    return;
  }

  roleFormRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        // 编辑模式
        RoleManagerAPI.updateRole(currentId.value, roleForm)
          .then(() => {
            ElMessage.success('修改角色成功');
            dialogVisible.value = false;
            fetchData(); // 刷新列表
          })
          .catch((error) => {
            console.error('修改角色失败:', error.msg);
            ElMessage.error('修改角色失败');
          });
      } else {
        // 新增模式
        RoleManagerAPI.createRole(roleForm)
          .then(() => {
            ElMessage.success('添加角色成功');
            dialogVisible.value = false;
            fetchData(); // 刷新列表
          })
          .catch((error) => {
            console.error('添加角色失败:', error.msg);
            ElMessage.error('添加角色失败');
          });
      }
    }
  });
}

// 删除角色
function handleDelete(row: RoleItem) {
  ElMessageBox.confirm(`确认要删除角色"${row.roleName}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteRole(row.id);
  }).catch(() => {
    // 用户取消删除操作
    ElMessage({
      type: 'info',
      message: '已取消删除'
    });
  });
}

// 批量删除
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
    // 逐个删除选中的角色
    const promises = selectedRoles.value.map(id => deleteRole(id, false));
    Promise.all(promises)
      .then(() => {
        ElMessage.success(`成功删除${selectedRoles.value.length}个角色`);
        fetchData();
      })
      .catch(error => {
        console.error('批量删除角色失败:', error);
        ElMessage.error('批量删除角色失败');
      });
  }).catch(() => {
    ElMessage({
      type: 'info',
      message: '已取消删除'
    });
  });
}

// 执行删除操作
function deleteRole(id: string, showMessage = true) {
  return RoleManagerAPI.deleteRole(id)
    .then(response => {
      ElMessage.success('删除角色成功');
      fetchData();
    })
    .catch(error => {
      if (showMessage) {
        console.error('删除角色失败:', error.msg);
        ElMessage.error('删除角色失败');
      }
      return Promise.reject(error);
    });
}

// 在组件卸载前清理所有可能的定时器和状态
//
onBeforeUnmount(() => {
  // 确保对话框关闭
  dialogVisible.value = false;
  // 清空列表数据，避免内存泄漏
  roleList.value = [];
});

onMounted(() => {
  handleQuery();
});
</script>

<style scoped>
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
  text-align: center;
}
</style>
