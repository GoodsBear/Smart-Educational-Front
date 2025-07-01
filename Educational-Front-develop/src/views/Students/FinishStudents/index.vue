<template>
  <div class="finish-students">
    <el-card>      
      <!-- 搜索区域 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="学员姓名">
          <el-input v-model="queryParams.studentName" placeholder="请输入学员姓名" clearable />
        </el-form-item>
        <el-form-item label="所属机构">
          <el-select v-model="queryParams.orgaizationId" placeholder="请选择机构" style="width:200px" clearable>
            <el-option 
              v-for="item in orgList" 
              :key="item.id" 
              :label="item.name" 
              :value="item.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属年级">
          <el-select v-model="queryParams.gradeId" placeholder="请选择年级" style="width:200px" clearable>
            <el-option 
              v-for="item in gradeList" 
              :key="item.id || item.gradeId" 
              :label="item.gradeName || item.name" 
              :value="item.id || item.gradeId" 
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="reloadData">刷新数据</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格区域 -->
      <el-table v-loading="loading" :data="studentList" border style="width: 100%">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="编号" type="index" width="60" align="center" />
        <el-table-column label="学员姓名" prop="name" align="center" />
        <el-table-column label="分校" prop="campusName" align="center" />
        <el-table-column label="家长姓名" prop="parentName" align="center" />
        <el-table-column label="亲属关系" align="center">
          <template #default="{ row }">
            {{ formatRelation(row.relation) }}
          </template>
        </el-table-column>
        <el-table-column label="联系电话" prop="phone" align="center" />
        <el-table-column label="顾问" prop="staffName" align="center" />
        <el-table-column label="年级" prop="gradeName" align="center" />
        <el-table-column label="课时数" prop="lessonNums" align="center" />
        <el-table-column label="积分" prop="score" align="center" />
        <el-table-column label="性别" align="center">
          <template #default="{ row }">
            {{ formatSex(row.sex) }}
          </template>
        </el-table-column>
        <el-table-column label="年龄" prop="age" align="center" />
        <el-table-column label="备注" prop="remark" align="center" show-overflow-tooltip />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="primary" link @click="handleFollow(row)">跟进</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        v-model:current-page="queryParams.pageIndex"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        class="pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import studentApi from '@/api/StudentsManager/Student/Student'
import { formatDate } from '@/utils/date'

// 查询参数
const queryParams = reactive({
  studentName: '',
  orgaizationId: '',
  gradeId: '',
  pageIndex: 1,
  pageSize: 10
})

// 数据列表
const studentList = ref([])
const total = ref(0)
const loading = ref(false)
const orgList = ref<any[]>([]) // 明确指定类型为数组
const gradeList = ref<any[]>([]) // 明确指定类型为数组

// 格式化性别
const formatSex = (sex: number) => {
  const sexMap: Record<number, string> = {
    0: '男',
    1: '女'
  }
  return sexMap[sex] || '未知'
}

// 格式化亲属关系
const formatRelation = (relation: number) => {
  const relationMap: Record<number, string> = {
    0: '父亲',
    1: '母亲',
    2: '祖父母',
    3: '其他'
  }
  return relationMap[relation] || '未知'
}

// 获取结业学员列表
const getStudentList = async () => {
  try {
    loading.value = true
    const res = await studentApi.getFinishStudents(queryParams)
    console.log('结业学员数据:', res)
    
    if (res) {
      studentList.value = res.data
      total.value = res.totleCount || 0
    } else {
      studentList.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取结业学员列表失败:', error)
    ElMessage.error('获取列表失败')
    studentList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 获取机构列表
const getOrganizationList = async () => {
  try {
    const res = await studentApi.getOrganizationList()
    console.log('机构数据:', res)
    
    // 直接将返回结果赋值给orgList
    orgList.value = res
    console.log('机构列表:', orgList.value)
  } catch (error) {
    console.error('获取机构列表失败:', error)
    ElMessage.error('获取机构列表失败')
  }
}

// 获取年级列表
const getGradeList = async () => {
  try {
    const res = await studentApi.getGradeList()
    console.log('年级数据:', res)
    
    // 直接将返回结果赋值给gradeList
    gradeList.value = res
    console.log('年级列表:', gradeList.value)
  } catch (error) {
    console.error('获取年级列表失败:', error)
    ElMessage.error('获取年级列表失败')
  }
}

// 获取员工列表
const getStaffList = async () => {
  try {
    const res = await studentApi.getStaffList()
    console.log('员工数据:', res)
  } catch (error) {
    console.error('获取员工列表失败:', error)
    ElMessage.error('获取员工列表失败')
  }
}

// 搜索
const handleSearch = () => {
  queryParams.pageIndex = 1
  getStudentList()
}

// 重置
const handleReset = () => {
  queryParams.studentName = ''
  queryParams.orgaizationId = ''
  queryParams.gradeId = ''
  queryParams.pageIndex = 1
  getStudentList()
}

// 分页大小改变
const handleSizeChange = (val: number) => {
  queryParams.pageSize = val
  getStudentList()
}

// 页码改变
const handleCurrentChange = (val: number) => {
  queryParams.pageIndex = val
  getStudentList()
}

// 编辑学员
const handleEdit = (row: any) => {
  // TODO: 实现编辑功能
  console.log('编辑学员:', row)
}

// 跟进学员
const handleFollow = (row: any) => {
  // TODO: 实现跟进功能
  console.log('跟进学员:', row)
}

// 删除学员
const handleDelete = (row: any) => {
  ElMessageBox.confirm('确认要删除该学员吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await studentApi.deleteStudent(row.guid)
      ElMessage.success('删除成功')
      getStudentList()
    } catch (error) {
      console.error('删除学员失败:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

// 重新加载所有数据
const reloadData = () => {
  getOrganizationList()
  getGradeList()
  getStaffList()
  getStudentList()
}

// 页面加载时获取列表
onMounted(() => {
  getStudentList()
  getOrganizationList()
  getGradeList()
  getStaffList()
})
</script>

<style scoped>
.finish-students {
  padding: 20px;
}

.search-form {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
