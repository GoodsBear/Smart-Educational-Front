<template>
  <!-- 主弹窗 -->
  <el-dialog :model-value="localVisible" title="关联课程" width="60%" @close="handleClose">
    <div style="margin-bottom: 16px;">
      <el-button type="primary" @click="showAddDialog = true">+ 新增关联</el-button>
    </div>
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="courseName" label="课程名称" />
      <el-table-column prop="subjectName" label="科目" />
      <el-table-column prop="totalPrice" label="价格" />
      <el-table-column prop="sellUnit" label="单位" />
      <el-table-column prop="courseTypeName" label="班型" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button type="text" @click="removeRow(scope.row)">移除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin-top: 16px; text-align: right;">
      <el-pagination background layout="prev, pager, next" :total="total" :page-size="pageSize"
        :current-page="currentPage" @current-change="handlePageChange" />
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </span>
    </template>

    <!-- 新增关联弹窗 -->
    <el-dialog :model-value="showAddDialog" title="添加关联" width="500px" append-to-body @close="handleAddDialogClose">
      <el-form ref="addFormRef" :model="addForm" :rules="addRules" label-width="100px">
        <el-form-item label="选择课程" prop="courseNames">
          <el-input v-model="addForm.courseNames" placeholder="请选择课程" readonly @click="openCourseSelectDialog" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleAddDialogClose">取消</el-button>
        <el-button type="primary" @click="handleAddSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 课程选择弹窗（独立） -->
    <el-dialog :model-value="showCourseSelectDialog" title="选择课程" width="900px" append-to-body
      @close="showCourseSelectDialog = false">
      <el-row :gutter="20">
        <!-- 左侧课程表格 -->
        <el-col :span="15">
          <el-input v-model="searchName" placeholder="课程名称" style="width: 200px; margin-bottom: 10px;"
            @keyup.enter="fetchCourseList" />
          <el-button type="primary" @click="fetchCourseList">搜索</el-button>
          <el-table :data="courseList" style="width: 100%; margin-top: 10px;" height="350">
            <el-table-column prop="courseName" label="课程名称" />
            <el-table-column prop="lessonNum" label="课时" width="80" />
            <el-table-column label="单价" width="100">
              <template #default="scope">
                {{ scope.row.totalPrice / scope.row.lessonNum }}
              </template>
            </el-table-column>
            <el-table-column prop="totalPrice" label="总价" width="100" />
            <el-table-column prop="sellUnit" label="单位" width="60" />
            <el-table-column prop="lessonDuration" label="时长" width="60" />
            <el-table-column prop="courseTypeName" label="类型" width="60" />
            <el-table-column prop="courseTypeName" label="类型" width="80" />
            <el-table-column prop="lessonDuration" label="时长" width="80" />
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="scope">
                <el-button type="primary" size="small" :disabled="isSelected(scope.row)"
                  @click="selectCourse(scope.row)">选择</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination style="margin-top: 10px;" background layout="total, sizes, prev, pager, next"
            :total="courseTotal" :page-size="coursePageSize" :current-page="courseCurrentPage"
            @size-change="handleCoursePageSizeChange" @current-change="handleCoursePageChange" />
        </el-col>
        <!-- 右侧已选列表 -->
        <el-col :span="9">
          <div style="font-weight: bold; margin-bottom: 10px;">已选列表</div>
          <el-empty v-if="selectedCourses.length === 0" description="暂无数据" />
          <div v-else>
            <div v-for="item in selectedCourses" :key="item.id"
              style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span>{{ item.courseName }}</span>
              <el-button type="danger" size="small" @click="removeCourse(item)">移除</el-button>
            </div>
          </div>
        </el-col>
      </el-row>
      <template #footer>
        <el-button @click="showCourseSelectDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCourseSelectConfirm">确定</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { getCourseList, addReletedCourse, getReletedCourse, removeReletedCourse } from '@/api/Lession/CourseManager/Course';
import { ElMessage, FormInstance, FormRules } from 'element-plus';

const props = defineProps<{ visible: boolean; courseId: string }>();
const emit = defineEmits(['update:visible']);

const localVisible = ref(false);
const tableData = ref([]);
const total = ref(0);
const pageSize = ref(20);
const currentPage = ref(1);
const showAddDialog = ref(false);
const showCourseSelectDialog = ref(false);
const addFormRef = ref<FormInstance>();
const addForm = reactive({ courseNames: '' });
const addRules: FormRules = {
  courseNames: [{ required: true, message: '请选择课程', trigger: 'change' }]
};
// 课程选择相关
const searchName = ref('');
const courseList = ref<any[]>([]);
const courseTotal = ref(0);
const coursePageSize = ref(10);
const courseCurrentPage = ref(1);
const selectedCourses = ref<any[]>([]);

watch(
  () => props.visible,
  (val) => {
    localVisible.value = val;
    if (val && props.courseId) {
      fetchData();
    }
  },
  { immediate: true }
);
watch(
  () => props.courseId,
  (val) => {
    if (localVisible.value && val) {
      fetchData();
    }
  }
);

function fetchData() {
  if (!props.courseId) return;
  getReletedCourse({ id: props.courseId, pageIndex: currentPage.value, pageSize: pageSize.value }).then(res => {
    tableData.value = res.data;
    total.value = res.totleCount;
  });
}

function fetchCourseList() {
  getCourseList({
    CourseName: searchName.value,
    PageIndex: courseCurrentPage.value,
    PageSize: coursePageSize.value
  }).then(res => {
    courseList.value = res.data || [];
    courseTotal.value = res.totleCount || 0;
  });
}

function selectCourse(row: any) {
  if (!selectedCourses.value.find(item => item.id === row.id)) {
    selectedCourses.value.push(row);
  }
}
function removeCourse(row: any) {
  selectedCourses.value = selectedCourses.value.filter(item => item.id !== row.id);
}
function isSelected(row: any) {
  return selectedCourses.value.some(item => item.id === row.id);
}
function handleCoursePageChange(page: number) {
  courseCurrentPage.value = page;
  fetchCourseList();
}
function handleCoursePageSizeChange(size: number) {
  coursePageSize.value = size;
  fetchCourseList();
}
function handleCourseSelectConfirm() {
  addForm.courseNames = selectedCourses.value.map(item => item.courseName).join(',');
  showCourseSelectDialog.value = false;
}
function handleAddDialogClose() {
  showAddDialog.value = false;
  addForm.courseNames = '';
  selectedCourses.value = [];
}
function handleAddSubmit() {
  addFormRef.value?.validate(async (valid: boolean) => {
    const courseId = props.courseId;
    const guids = selectedCourses.value.map(item => item.id);
    const res = await addReletedCourse({ courseId, guids });
    ElMessage.success('关联成功');
    showAddDialog.value = false;
    addForm.courseNames = '';
    selectedCourses.value = [];
    fetchData();

  });
}
function handleAdd() {
  showAddDialog.value = true;
}
async function removeRow(row: any) {
  // 主课程id为props.courseId，关联课程id为row.id
  await removeReletedCourse({ id: props.courseId, guid: row.id })
  ElMessage.success("移除成功")
  fetchData()
}
function handlePageChange(page: number) {
  currentPage.value = page;
  fetchData();
}
function handleClose() {
  localVisible.value = false;
  emit('update:visible', false);
}
function openCourseSelectDialog() {
  showCourseSelectDialog.value = true;
  fetchCourseList();
}
</script>