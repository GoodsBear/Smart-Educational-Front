<!-- 科目管理主页面 -->
<template>
  <div class="app-container">
    <div class="filter-container">
      <el-card class="box-card">
        <div class="filter-item">
          <el-input
            v-model="queryParams.keyword"
            placeholder="请输入科目名称"
            style="width: 200px"
            class="filter-item"
            @keyup.enter="handleQuery"
          />
          <el-button type="primary" class="filter-item" @click="handleQuery">
            搜索
          </el-button>
          <el-button type="success" class="filter-item" @click="handleAdd">
            新增
          </el-button>
        </div>
      </el-card>
    </div>

    <el-card class="box-card">
      <el-table
        v-loading="loading"
        :data="subjectList"
        style="width: 100%"
        border
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="科目名称" prop="name" />
        <el-table-column label="科目描述" prop="description" />
        <el-table-column label="创建时间" prop="createTime" width="180" />
        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <el-button type="primary" link @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button type="danger" link @click="handleDelete(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

defineOptions({
  name: 'SubjectManagement'
})

// 加载状态
const loading = ref(false)
// 科目列表数据
const subjectList = ref([])
// 总记录数
const total = ref(0)

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: ''
})

// 查询方法
const handleQuery = () => {
  // TODO: 实现查询逻辑
}

// 新增方法
const handleAdd = () => {
  // TODO: 实现新增逻辑
}

// 编辑方法
const handleEdit = (row: any) => {
  // TODO: 实现编辑逻辑
}

// 删除方法
const handleDelete = (row: any) => {
  // TODO: 实现删除逻辑
}

// 处理每页显示数量变化
const handleSizeChange = (val: number) => {
  queryParams.pageSize = val
  handleQuery()
}

// 处理页码变化
const handleCurrentChange = (val: number) => {
  queryParams.pageNum = val
  handleQuery()
}
</script>

<style scoped>
.filter-container {
  margin-bottom: 20px;
}

.filter-item {
  display: inline-block;
  margin-right: 10px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}
</style> 