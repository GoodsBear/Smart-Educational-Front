<template>
  <div class="clbum-management">
    <!-- 搜索栏 -->
    <el-card>
      <div class="search-bar">
        <el-form :inline="true" :model="queryParams">
          <el-form-item label="班级名称：">
            <el-input v-model="queryParams.ClassName" placeholder="请输入班级名称" clearable />
          </el-form-item>
          <el-form-item label="选择分校：">
            <el-select v-model="queryParams.campusId" placeholder="请选择" style="width: 200px;">
              <el-option v-for="item in organizationname" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="默认课程：">
            <el-select v-model="queryParams.defaultCourseId" placeholder="请选择" style="width: 200px;">
              <el-option v-for="item in coursename" :key="item.id" :label="item.courseName" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="教室：">
            <el-select v-model="queryParams.defaultClassroomId" placeholder="请选择" style="width: 200px;">
              <el-option v-for="item in classroomname" :key="item.id" :label="item.classRoomName" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="班主任：">
            <el-select v-model="queryParams.classTeacherId" placeholder="请选择" style="width: 200px;">
              <el-option v-for="item in staffname" :key="item.id" :label="item.staffName" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="年级：">
            <el-select v-model="queryParams.gradeId" placeholder="请选择" style="width: 200px;">
              <el-option v-for="item in gradename" :key="item.id" :label="item.gradeName" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="班级状态：">
            <el-select v-model="queryParams.classStatus" placeholder="请选择" style="width: 200px;">
              <el-option label="未排课" :value="0" />
              <el-option label="已停课" :value="1" />
              <el-option label="进行中" :value="2" />
              <el-option label="已结业" :value="3" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchClbumList">查询</el-button>
            <el-button @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card style="margin-top: 10px">
      <!-- 表格标题和操作按钮区 -->
      <div class="table-header-bar">
        <div class="table-title">班级列表</div>
        <div class="operation-area">
          <el-button type="primary" @click="showAddDialog">新增</el-button>
          <el-button @click="handleDelete" type="danger">删除</el-button>
          <el-button @click="fetchClbumList" type="success">刷新</el-button>
          <el-button @click="handleupdateStatus" type="warning">结业</el-button>
          <el-button @click="showColumnDialog = true" type="primary">自定义显示列</el-button>
        </div>
      </div>
      <!-- 班级列表表格 -->
      <el-table ref="tableRef" :data="clbumList" style="width: 100%" @selection-change="selectAll">
        <el-table-column type="selection" width="50" />
        <el-table-column v-for="col in showColumns" :key="col.prop" :prop="col.prop" :label="col.label">
          <template v-if="col.prop === 'planOpenDate'" #default="{ row }">
            {{ moment(row.planOpenDate).format("YYYY-MM-DD") }}
          </template>
          <template v-else-if="col.prop === 'planCloseDate'" #default="{ row }">
            {{ moment(row.planCloseDate).format("YYYY-MM-DD") }}
          </template>
          <template v-else-if="col.prop === 'classQrCode'" #default="{ row }">
            <el-image :src="row.classQrCode" :preview-src-list="[row.classQrCode]" :style="'width:40px;height:40px'" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="text" @click="showEditDialog(row)">编辑</el-button>
            <el-button type="text">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="pagination-container">
        <pagination v-model:total="pageParams.TotalCount" v-model:page="pageParams.PageIndex"
          v-model:limit="pageParams.PageSize" @pagination="handlePagination" />
      </div>
    </el-card>
    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="40%" @closed="resetForm">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="班级名称" prop="className">
          <el-input v-model="formData.className" placeholder="请输入班级名称" />
        </el-form-item>
        <el-form-item label="选择分校" prop="campusId">
          <el-select v-model="formData.campusId" placeholder="请选择" style="width: 200px;">
            <el-option v-for="item in organizationname" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="年级" prop="gradeId">
          <el-select v-model="formData.gradeId" placeholder="请选择" style="width: 200px;">
            <el-option v-for="item in gradename" :key="item.id" :label="item.gradeName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="班主任" prop="classTeacherId">
          <el-select v-model="formData.classTeacherId" placeholder="请选择" style="width: 200px;">
            <el-option v-for="item in staffname" :key="item.id" :label="item.staffName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="预招人数" prop="preNum">
          <el-input v-model="formData.preNum" placeholder="请输入预招数" />
        </el-form-item>
        <el-form-item label="预排课次数" prop="preCourseNum">
          <el-input v-model="formData.preCourseNum" placeholder="请输入预招数" />
        </el-form-item>
        <el-form-item label="默认课程" prop="defaultCourseId">
          <el-select v-model="formData.defaultCourseId" placeholder="请选择" style="width: 200px;">
            <el-option v-for="item in coursename" :key="item.id" :label="item.courseName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="默认教室" prop="defaultClassroomId">
          <el-select v-model="formData.defaultClassroomId" placeholder="请选择" style="width: 200px;">
            <el-option v-for="item in classroomname" :key="item.id" :label="item.classRoomName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="计划开课日期" prop="planOpenDate">
          <el-date-picker v-model="formData.planOpenDate" placeholder="请选择开课日期" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="计划结业日期" prop="planCloseDate">
          <el-date-picker v-model="formData.planCloseDate" placeholder="请选择结业日期" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="班级群二维码" prop="classQrCode">
          <el-upload class="avatar-uploader" action="https://localhost:44375/api/upload/image" :show-file-list="false"
            :on-success="handleQrCodeSuccess" :before-upload="beforeQrCodeUpload">
            <img v-if="formData.classQrCode" :src="formData.classQrCode" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon">
              <Plus />
            </el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="排课备注" prop="courseRemark">
          <el-input v-model="formData.courseRemark" placeholder="请输入排课备注" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确认</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 自定义显示列弹窗 -->
    <el-dialog v-model="showColumnDialog" title="自定义显示列" width="400px">
      <el-checkbox-group v-model="checkedProps">
        <el-checkbox v-for="col in allColumns" :key="col.prop" :label="col.prop">
          {{ col.label }}
        </el-checkbox>
      </el-checkbox-group>
      <template #footer>
        <el-button @click="resetColumns">恢复默认</el-button>
        <el-button type="primary" @click="showColumnDialog = false">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus";
import { getClassInfoList, createClassInfo, updateClassInfo, batchDeleteClassInfo, batchUpdateClassStatus } from '@/api/Senate/clbum.api';
import moment from "moment";
import { getOrganizationDropdown } from '@/api/Organization/organization.api'
import { selectClassRoom } from '@/api/Senate/classroom.api'
import api from '@/api/StudentsManager/Staff/Staff'
import { getGradeDropdown } from '@/api/Senate/grade.api'
import { getCourseDropdown } from '@/api/Lession/CourseManager/Course'
import { Plus } from '@element-plus/icons-vue';
import type { UploadProps } from 'element-plus';
// 查询参数

const queryParams = reactive({
  ClassName: "",
  campusId: "",
  defaultCourseId: "",
  defaultClassroomId: "",
  classTeacherId: "",
  gradeId: "",
  classStatus: 0
});
const pageParams = reactive({
  PageIndex: 1,
  PageSize: 20,
  TotalCount: 0,
  TotalPage: 0
});
//列表
const fetchClbumList = () => {
  const params: any = {
    PageIndex: pageParams.PageIndex,
    PageSize: pageParams.PageSize,
    campusId: queryParams.campusId || "",
    defaultCourseId: queryParams.defaultCourseId || "",
    defaultClassroomId: queryParams.defaultClassroomId || "",
    classTeacherId: queryParams.classTeacherId || "",
    gradeId: queryParams.gradeId || "",
    classStatus: queryParams.classStatus,
  };
  
  // 只有当ClassName有值时才添加此参数
  if (queryParams.ClassName) {
    params.ClassName = queryParams.ClassName;
  }
  
  getClassInfoList(params).then((res) => {
    clbumList.value = res.data || [];
    pageParams.TotalCount = res.totleCount || 0;
    pageParams.TotalPage = res.totlePage || 1;
  });
}
// 分页
const handlePagination = ({ page, limit }: { page: number; limit: number }) => {
  pageParams.PageIndex = page;
  pageParams.PageSize = limit;
  fetchClbumList();
};
onMounted(() => {
  fetchClbumList();
  Selectorganization();
  Selectclassroom();
  Selectstaff();
  Selectgrade();
  Selectcourse();
});
//学校下拉
let organizationname = ref([{
  id: "",
  name: ""
}])
const Selectorganization = () => {
  getOrganizationDropdown().then((res) => {
    console.log("组织下拉=>", res);
    organizationname.value = res;
  })
}
//教室下拉
let classroomname = ref([{
  id: "",
  classRoomName: ""
}])
const Selectclassroom = () => {
  selectClassRoom().then((res) => {
    console.log("教室下拉=>", res);
    classroomname.value = res;
  })
}
//班主任下拉
let staffname = ref([{
  id: "",
  staffName: ""
}])
const Selectstaff = () => {
  api.getStaffList().then((res) => {
    console.log("班主任下拉=>", res);
    staffname.value = res;
  })
}
//年级下拉
let gradename = ref([{
  id: "",
  gradeName: ""
}])
const Selectgrade = () => {
  getGradeDropdown().then((res) => {
    console.log("年级下拉=>", res);
    gradename.value = res;
  })
}
//课程下拉
let coursename = ref([{
  id: "",
  courseName: ""
}])
const Selectcourse = () => {
  getCourseDropdown().then((res) => {
    console.log("课程下拉=>", res);
    coursename.value = res;
  })
}
// 数据状态
const clbumList = ref<any[]>([]);
const dialogVisible = ref(false);
const dialogTitle = ref("新增班级");
const formRef = ref<FormInstance>();
const isAdd = ref(true);
// 表单数据
const formData = reactive({
  id: "",
  className: "",
  campusId: "",
  gradeId: "",
  classTeacherId: "",
  preNum: "",
  preCourseNum: "",
  defaultCourseId: 0,
  defaultClassroomId: 0,
  planOpenDate: "",
  planCloseDate: "",
  classQrCode: "",
  courseRemark: ""
});
// 重置表单
const resetForm = () => {
  formData.id = "";
  formData.className = "";
  formData.campusId = "";
  formData.gradeId = "";
  formData.classTeacherId = "";
  formData.preNum = "";
  formData.preCourseNum = "";
  formData.defaultCourseId = 0;
  formData.defaultClassroomId = 0;
  formData.planOpenDate = "";
  formData.planCloseDate = "";
  formData.classQrCode = "";
  formData.courseRemark = "";
}
//数据验证
const rules: FormRules = {
  className: [{ required: true, message: "请输入班级名称", trigger: "blur" }],
  campusId: [{ required: true, message: "请输入分校", trigger: "blur" }],
  defaultCourseId: [{ required: true, message: "请输入默认课程", trigger: "blur" }],
  defaultClassroomId: [{ required: true, message: "请输入教室", trigger: "blur" }],
  gradeId: [{ required: true, message: "请输入年级", trigger: "blur" }],
  classTeacherId: [{ required: true, message: "请输入班主任", trigger: "blur" }],
};
// 新增弹出框
function showAddDialog() {
  isAdd.value = true;
  dialogTitle.value = "新增班级";
  resetForm();
  dialogVisible.value = true;
}
// 编辑弹出框
function showEditDialog(row: any) {
  isAdd.value = false;
  formData.id = row.id;
  dialogTitle.value = "编辑班级";
  console.log("编辑=>", row);
  Object.assign(formData, row);
  dialogVisible.value = true;
}
//全选 全部选
const Ids = ref<any[]>([]);
const selectAll = (rows: any[]) => {
  Ids.value = rows.map((item: any) => item.id);
}
// 批量删除
const handleDelete = () => {
  if (!Ids.value.length) {
    ElMessage.warning("请先选择要删除的班级！");
    return;
  }
  ElMessageBox.confirm(
    '确认删除吗?',
    'Warning',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      batchDeleteClassInfo({ ids: Ids.value }).then(() => {
        ElMessage.success("删除成功");
        fetchClbumList();
      });
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '删除已取消',
      })
    })
}
// 批量结业
const handleupdateStatus = () => {
  if (!Ids.value.length) {
    ElMessage.warning("请先选择要结业的班级！");
    return;
  }
  ElMessageBox.confirm(
    '确认结业吗?',
    'Warning',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      batchUpdateClassStatus(Ids.value).then(() => {
        ElMessage.success("修改成功");
        fetchClbumList();
      });
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '修改已取消',
      })
    })
}
//添加修改
const submitForm = () => {
  (formRef.value as FormInstance).validate((valid) => {
    if (valid) {
      if (isAdd.value) {
        createClassInfo(formData).then(() => {
          ElMessage.success("添加成功");
          dialogVisible.value = false;
          fetchClbumList();
        });
      } else {
        updateClassInfo(formData.id, formData).then(() => {
          ElMessage.success("修改成功");
          dialogVisible.value = false;
          fetchClbumList();
        });
      }
    }
  });
}
// 重置查询条件
const resetQuery = () => {
  queryParams.ClassName = "";
  queryParams.campusId = "";
  queryParams.defaultCourseId = "";
  queryParams.defaultClassroomId = "";
  queryParams.classTeacherId = "";
  queryParams.gradeId = "";
  queryParams.classStatus = 0;
  fetchClbumList();
};

// 图片上传相关
const qrCodeUrl = ref("");

const handleQrCodeSuccess: UploadProps["onSuccess"] = (response, uploadFile) => {
  qrCodeUrl.value = URL.createObjectURL(uploadFile.raw!);
  formData.classQrCode = response;
};

const beforeQrCodeUpload: UploadProps["beforeUpload"] = (rawFile) => {
  if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error("二维码图片大小不能超过2MB!");
    return false;
  }
  return true;
};

// 自定义显示列相关
const showColumnDialog = ref(false);
const allColumns = ref([
  { label: "班级名称", prop: "className" },
  { label: "分校", prop: "name" },
  { label: "默认课程", prop: "courseName" },
  { label: "教室", prop: "classRoomName" },
  { label: "年级", prop: "gradeName" },
  { label: "班主任", prop: "staffName" },
  { label: "预招数", prop: "preNum" },
  { label: "群二维码", prop: "classQrCode" },
  { label: "计划课次", prop: "preCourseNum" },
  { label: "排课备注", prop: "courseRemark" },
  { label: "开班时间", prop: "planOpenDate" },
  { label: "结业时间", prop: "planCloseDate" },
  { label: "状态", prop: "classStatusName" }
]);
const checkedProps = ref(allColumns.value.map(col => col.prop));
const resetColumns = () => {
  checkedProps.value = allColumns.value.map(col => col.prop);
};
const showColumns = computed(() =>
  allColumns.value.filter(col => checkedProps.value.includes(col.prop))
);

</script>

<style scoped>
.clbum-management {
  padding: 24px;
  background: #fafafa;
  min-height: 100vh;
}

.search-bar {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  margin-bottom: 8px;
}

.table-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.table-title {
  font-size: 18px;
  font-weight: bold;
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

.avatar-uploader .avatar {
  width: 100px;
  height: 100px;
  display: block;
}

.avatar-uploader .avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
