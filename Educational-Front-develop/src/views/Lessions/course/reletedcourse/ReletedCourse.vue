<template>
  <!-- 主弹窗 -->
  <el-dialog :model-value="localVisible" title="关联课程" width="60%" @close="handleClose">
    <div style="margin-bottom: 16px;">
      <el-button type="primary" @click="showAddDialog = true">+ 新增关联</el-button>
    </div>
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="name" label="课程名称" />
      <el-table-column prop="subject" label="科目" />
      <el-table-column prop="price" label="价格" />
      <el-table-column prop="unit" label="单位" />
      <el-table-column prop="classType" label="班型" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button type="text" @click="editRow(scope.row)">编辑</el-button>
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

<script>
import { getCourseList, addReletedCourse, getReletedCourse } from '@/api/Lession/CourseManager/Course';
export default {
  name: "ReletedCourse",
  props: {
    visible: Boolean,
    courseId: String
  },
  emits: ["update:visible"],
  data() {
    return {
      localVisible: false,
      tableData: [],
      total: 0,
      pageSize: 20,
      currentPage: 1,
      showAddDialog: false,
      showCourseSelectDialog: false,
      addForm: {
        courseNames: ''
      },
      addRules: {
        courseNames: [{ required: true, message: '请选择课程', trigger: 'change' }]
      },
      // 课程选择相关
      searchName: '',
      courseList: [],
      courseTotal: 0,
      coursePageSize: 10,
      courseCurrentPage: 1,
      selectedCourses: []
    };
  },
  watch: {
    visible: {
      immediate: true,
      handler(val) {
        this.localVisible = val;
        if (val && this.courseId) {
          this.fetchData();
        }
      }
    },
    courseId(val) {
      if (this.localVisible && val) {
        this.fetchData();
      }
    }
  },
  methods: {
    fetchData() {
      // 拉取当前courseId的关联课程数据
      if (!this.courseId) return;
      getReletedCourse({ id: this.courseId, pageIndex: this.currentPage, pageSize: this.pageSize }).then(res => {
        if (res && res.isSuc) {
          this.tableData = res.data.data.data || [];
          console.log(this.tableData)
          this.total = res.data ? res.data.length : 0;
        } else {
          this.tableData = [];
          this.total = 0;
        }
      });
    },
    // 课程选择相关方法
    fetchCourseList() {
      getCourseList({
        CourseName: this.searchName,
        PageIndex: this.courseCurrentPage,
        PageSize: this.coursePageSize
      }).then(res => {
        this.courseList = res.data || [];
        this.courseTotal = res.totleCount || 0;
      });
    },
    selectCourse(row) {
      if (!this.selectedCourses.find(item => item.id === row.id)) {
        this.selectedCourses.push(row);
      }
    },
    removeCourse(row) {
      this.selectedCourses = this.selectedCourses.filter(item => item.id !== row.id);
    },
    isSelected(row) {
      return this.selectedCourses.some(item => item.id === row.id);
    },
    handleCoursePageChange(page) {
      this.courseCurrentPage = page;
      this.fetchCourseList();
    },
    handleCoursePageSizeChange(size) {
      this.coursePageSize = size;
      this.fetchCourseList();
    },
    handleCourseSelectConfirm() {
      // 多选，回填课程名称用逗号隔开
      this.addForm.courseNames = this.selectedCourses.map(item => item.courseName).join(',');
      this.showCourseSelectDialog = false;
    },
    handleAddDialogClose() {
      this.showAddDialog = false;
      this.addForm = { courseNames: '' };
      this.selectedCourses = [];
    },
    handleAddSubmit() {
      this.$refs.addFormRef.validate(async valid => {
        if (valid) {
          // 调用后端接口
          const courseId = this.courseId;
          const guids = this.selectedCourses.map(item => item.id);
          try {
            const res = await addReletedCourse({ courseId, guids });
            if (res && res.isSuc) {
              this.$message.success(res.msg || '添加成功');
              this.showAddDialog = false;
              this.addForm = { courseNames: '' };
              this.selectedCourses = [];
              this.fetchData && this.fetchData(); // 刷新主表
            } else {
              this.$message.error(res.msg || '添加失败');
            }
          } catch (e) {
            this.$message.error('请求失败' + e.message);
          }
        }
      });
    },
    handleAdd() {
      this.showAddDialog = true;
    },
    editRow(row) {
      // TODO: 编辑逻辑
    },
    handlePageChange(page) {
      this.currentPage = page;
      this.fetchData();
    },
    handleClose() {
      this.localVisible = false;
      this.$emit("update:visible", false);
    },
    openCourseSelectDialog() {
      this.showCourseSelectDialog = true;
      this.fetchCourseList();
    }
  }
};
</script>