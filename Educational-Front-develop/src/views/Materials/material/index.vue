<template>
  <div class="material-page">
    <!-- 顶部筛选栏 -->
    <el-form :inline="true" :model="searchForm" class="mb-4">
      <el-form-item label="物料名称：">
        <el-input v-model="searchForm.name" placeholder="请输入物料名称" clearable />
      </el-form-item>
      <el-form-item label="状态：">
        <el-select v-model="searchForm.status" placeholder="请选择">
          <el-option label="全部" value="" />
          <el-option label="启用" value="1" />
          <el-option label="禁用" value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格与工具栏 -->
    <PageContent
      :content-config="contentConfig"
      @toolbarClick="handleToolbarClick"
      @operateClick="handleOperateClick"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PageContent from '@/components/CURD/PageContent.vue';

// 搜索表单
const searchForm = ref({
  name: '',
  status: ''
});

// 表格配置
const contentConfig = {
  pk: 'id',
  permPrefix: 'material',
  table: {
    border: true,
    stripe: true,
    height: 'auto',
    'row-class-name': () => 'custom-row',
  },
  toolbar: ['add', 'delete', { name: 'enable', text: '启用', attrs: { type: 'primary' } }, { name: 'disable', text: '禁用', attrs: { type: 'warning' } }],
  columns: [
    { type: 'selection', width: 50 },
    { label: '图片', prop: 'image', width: 70, templet: 'image', imageWidth: 40, imageHeight: 40 },
    { label: '物料名称', prop: 'name', minWidth: 120 },
    { label: '分类', prop: 'category', minWidth: 80 },
    { label: '所属学校', prop: 'school', minWidth: 100 },
    { label: '库存', prop: 'stock', minWidth: 60 },
    { label: '最后编辑时间', prop: 'editTime', minWidth: 150, templet: 'date', dateFormat: 'YYYY-MM-DD HH:mm' },
    { label: '状态', prop: 'status', minWidth: 70, templet: 'list', selectList: { 1: '启用', 0: '禁用' } },
    {
      label: '操作',
      prop: 'actions',
      minWidth: 140,
      fixed: 'right',
      templet: 'tool',
      slotName: 'actions',
      width: 140
    }
  ],
  tableToolbarBtn: [
    { name: 'edit', text: '编辑', attrs: { type: 'primary', size: 'small' } },
    { name: 'in', text: '入库', attrs: { type: 'success', size: 'small' } },
    { name: 'out', text: '出库', attrs: { type: 'info', size: 'small' } }
  ],
  showPagination: true
};

// 查询事件
function handleSearch() {
  // TODO: 调用接口刷新表格数据
}

// 工具栏事件
function handleToolbarClick(name: string) {
  // TODO: 新增、删除、启用、禁用等
}

// 操作列事件
function handleOperateClick({ name, row }: any) {
  // TODO: 编辑、入库、出库
}
</script>

<style scoped>
.material-page {
  padding: 24px;
  background: #fff;
  min-height: 100vh;
}
.el-form {
  margin-bottom: 16px;
}
</style>
