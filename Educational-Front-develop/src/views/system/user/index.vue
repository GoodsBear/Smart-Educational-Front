<!-- 用户管理 -->
<template>
  <div class="app-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" size="small" @click="handleAdd">添加用户</el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="queryParams" inline label-width="68px" class="mb-3">
        <el-form-item label="用户名">
          <el-input v-model="queryParams.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="queryParams.mobile" placeholder="请输入手机号" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">搜索</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 用户表格 -->
      <el-table :data="userList" border style="width: 100%">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="nickname" label="昵称" width="150" />
        <el-table-column prop="mobile" label="手机号" width="150" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '1' ? 'success' : 'danger'">
              {{ scope.row.status === '1' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" fixed="right" width="250">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
            <el-button 
              size="small" 
              :type="scope.row.status === '1' ? 'warning' : 'success'" 
              @click="handleStatusChange(scope.row)">
              {{ scope.row.status === '1' ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container mt-4">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// 查询参数
const queryParams = reactive({
  username: '',
  mobile: '',
  status: '',
  pageNum: 1,
  pageSize: 10
});

// 静态用户数据
const userList = ref([
  {
    id: 1,
    username: 'admin',
    nickname: '管理员',
    mobile: '13800138000',
    email: 'admin@example.com',
    status: '1',
    createTime: '2023-01-01 00:00:00'
  },
  {
    id: 2,
    username: 'zhangsan',
    nickname: '张三',
    mobile: '13800138001',
    email: 'zhangsan@example.com',
    status: '1',
    createTime: '2023-01-02 00:00:00'
  },
  {
    id: 3,
    username: 'lisi',
    nickname: '李四',
    mobile: '13800138002',
    email: 'lisi@example.com',
    status: '0',
    createTime: '2023-01-03 00:00:00'
  },
  {
    id: 4,
    username: 'wangwu',
    nickname: '王五',
    mobile: '13800138003',
    email: 'wangwu@example.com',
    status: '1',
    createTime: '2023-01-04 00:00:00'
  },
  {
    id: 5,
    username: 'zhaoliu',
    nickname: '赵六',
    mobile: '13800138004',
    email: 'zhaoliu@example.com',
    status: '1',
    createTime: '2023-01-05 00:00:00'
  }
]);

// 总记录数
const total = ref(5);

// 搜索处理
const handleQuery = () => {
  ElMessage.success('执行了搜索操作');
  // 这里可以添加实际的搜索逻辑
};

// 重置搜索
const resetQuery = () => {
  queryParams.username = '';
  queryParams.mobile = '';
  queryParams.status = '';
  ElMessage.info('重置了搜索条件');
};

// 处理页面大小变化
const handleSizeChange = (size: number) => {
  queryParams.pageSize = size;
  handleQuery();
};

// 处理页码变化
const handleCurrentChange = (page: number) => {
  queryParams.pageNum = page;
  handleQuery();
};

// 添加用户
const handleAdd = () => {
  ElMessage.success('点击了添加用户');
};

// 编辑用户
const handleEdit = (row: any) => {
  ElMessage.success(`编辑用户: ${row.username}`);
};

// 删除用户
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除用户 ${row.username} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    ElMessage.success(`删除用户: ${row.username}`);
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
};

// 更改用户状态
const handleStatusChange = (row: any) => {
  const newStatus = row.status === '1' ? '0' : '1';
  const statusText = newStatus === '1' ? '启用' : '禁用';
  ElMessageBox.confirm(
    `确定要${statusText}用户 ${row.username} 吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    row.status = newStatus;
    ElMessage.success(`已${statusText}用户: ${row.username}`);
  }).catch(() => {
    ElMessage.info('已取消操作');
  });
};

onMounted(() => {
  // 初始化页面时可以添加一些逻辑
  console.log('用户管理页面已加载');
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
