<!-- 课程管理主页面 -->
<template>
  <div class="app-container">
    <div class="filter-container">
      <el-card class="box-card">
        <div class="filter-item">

          <el-form :inline="true" :model="queryParams" class="demo-form-inline">
            <el-form-item label="课程名称">
              <el-input v-model="queryParams.CourseName" placeholder="请输入课程名称" style="width: 150px" class="filter-item"
                @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="适用学校">
              <el-select v-model="queryParams.CampusId" placeholder="请选择学校" style="width: 150px;" clearable>
                <el-option label="Zone two" value="beijing" />
              </el-select>
            </el-form-item>
            <el-form-item label="科目">
              <el-select v-model="queryParams.SubjectId" placeholder="请选择科目" style="width: 150px;" clearable>
                <el-option v-for="item in SubjectList" :key="item.id" :label="item.subjectName" :value="item.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="queryParams.status" placeholder="请选择状态" style="width: 150px;" clearable>
                <el-option label="启用" :value="true" />
                <el-option label="禁用" :value="false" />
              </el-select>
            </el-form-item>
            <el-form-item label="适用年级">
              <el-select v-model="queryParams.GradeId" placeholder="请选择年级" style="width: 150px;" clearable>
                <el-option label="Zone two" value="beijing" />
              </el-select>
            </el-form-item>

            <el-button type="primary" class="filter-item" @click="handleQuery">
              搜索
            </el-button>
            <el-button class="filter-item" round @click="handleResetQuery">
              ✖
            </el-button>
          </el-form>
        </div>
      </el-card>
    </div>

    <el-card class="box-card">
      <el-row>
        <el-col style="margin-bottom: 20px;">
          <el-button type="success" class="filter-item" @click="handleAdd">
            ✚&nbsp;新增
          </el-button>
          <el-button type="success" @click="handleAction('enable')">启用</el-button>
          <el-button type="danger" @click="handleAction('disable')">禁用</el-button>
          <el-button type="primary" @click="handleAction('publish')">上架</el-button>
          <el-button type="warning" @click="handleAction('unpublish')">下架</el-button>
          <el-button type="danger" @click="handleAction('delete')">删除</el-button>
        </el-col>
      </el-row>

      <el-table ref="tableRef" v-loading="loading" :data="courseList" style="width: 100%" border>
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="课程名称" prop="courseName" />
        <el-table-column label="状态" prop="status">
          <template #default="scope">
            <el-tag v-if="scope.row.status" type="success">启用</el-tag>
            <el-tag v-else type="danger">禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否上架" prop="isOnlineSale">
          <template #default="scope">
            <el-tag v-if="scope.row.isOnlineSale" type="success">已上架</el-tag>
            <el-tag v-else type="danger">已下架</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="校区" prop="campusName" />
        <el-table-column label="科目" prop="subjectName" />
        <el-table-column label="专题" prop="topicName" />
        <el-table-column label="课程类型" prop="courseTypeName" />
        <el-table-column label="价格" prop="price" />
        <el-table-column label="创建时间" prop="creationTime" width="180">
          <template #default="scope">
            <span style="color: chocolate;">{{ moment(scope.row.creationTime).format('YYYY-MM-DD HH:mm:SS') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <el-button type="primary" link @click="handleEdit(scope.row)">
              编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination v-model:current-page="queryParams.PageIndex" v-model:page-size="queryParams.PageSize"
          :total="total" :page-sizes="[10, 20, 30, 50]" layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </el-card>
  </div>

  <!-- 新增课程抽屉 -->

  <el-drawer v-model="drawer" close-on-press-escape size="850" :with-header="false">
    <h2 style="background-color: #48c;">&emsp;{{ title }}</h2>
    <el-form ref="ruleFormRef" :model="courseForm" :rules="rules" label-width="auto">
      <!-- 基本信息 -->
      <el-form-item label="课程名称" prop="courseName">
        <el-input v-model="courseForm.courseName"></el-input>
      </el-form-item>
      <el-form-item label="适用学校" prop="campusId">
        <el-select v-model="courseForm.campusId" placeholder="请选择学校">
          <!-- 学校选项 -->
        </el-select>
      </el-form-item>
      <el-row>
        <el-col :span="12">
          <el-form-item label="所属科目" prop="subjectId">
            <el-select v-model="courseForm.subjectId" placeholder="请选择科目">
              <!-- 科目选项 -->
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="关联专题" prop="topicId">
            <el-input v-model="courseForm.topicId"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="适用年级" prop="gradeId">
            <el-select v-model="courseForm.gradeId" placeholder="请选择年级">
              <!-- 年级选项 -->
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="出售单位" prop="sellUnit">
            <el-radio-group v-model="courseForm.sellUnit">
              <el-radio label="次">次</el-radio>
              <el-radio label="期">期</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="总价" prop="totalPrice">
            <el-row>
              <el-col :span="22">
                <el-input v-model="courseForm.totalPrice"></el-input>
              </el-col>
              <el-col :span="2">
                <el-button disabled style="background-color: #ddd;color: black;">元</el-button>
              </el-col>
            </el-row>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <!-- 留空 -->
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="课时数" prop="lessonNum">
            <el-input v-model="courseForm.lessonNum"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="有效月数" prop="validMonthNum">
            <el-input v-model="courseForm.validMonthNum"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <!-- 课堂类型与预约模式 -->
          <el-form-item label="课堂类型" prop="courseTypeId">
            <el-radio-group v-model="courseForm.courseTypeId">
              <el-radio :label="1">大班课</el-radio>
              <el-radio :label="2">小班课</el-radio>
              <el-radio :label="3">一对一</el-radio>
            </el-radio-group>
            <div style="font-size: 12px; color: #999;">一对一类型可自动生成班级</div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="预约模式" prop="isReserve">
            <el-switch v-model="courseForm.isReserve"></el-switch>
            <span style="margin-left: 10px;">开启</span>
            <div style="font-size: 12px; color: #999;">开启后，学生需主动预约才可参与点名签到</div>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <!-- 消课课酬与课酬计费模式 -->
          <el-form-item label="消课课酬" prop="lessonCut">
            <el-input v-model="courseForm.lessonCut"></el-input>
            <span style="margin-left: 10px;color: #999;">用于统计老师消课课酬</span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="后付费模式" prop="isAfterPay">
            <el-switch v-model="courseForm.isAfterPay"></el-switch>
            <span style="margin-left: 10px;">开启</span>
            <div style="font-size: 12px; color: #999;">开启后，学生报名后先上课再缴费，结算缴费单在“后付费结算”模块中生成。</div>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="课酬计费模式" prop="lessonCutMode">
            <el-select v-model="courseForm.lessonCutMode" placeholder="请选择课酬计费模式" style="width: 250px;">
              <el-option label="按实际出勤计费" value="0"></el-option>
              <el-option label="按非实际出勤计费" value="1"></el-option>
            </el-select>
            <span style="font-size: 12px; color: #999;">与老师的课时计费汇总有关：按实际出勤时会按实际消课数统计，按非实际出勤时学生是否来上课都会统计</span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="上课时长（分钟）" prop="lessonDuration">
            <el-select v-model.number="courseForm.lessonDuration" placeholder="请选择">
              <el-option v-for="duration in [50, 90, 180]" :key="duration" :label="`${duration}分钟`" :value="duration" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 在线购课报名设置 -->
      <el-divider content-position="left">在线购课报名设置</el-divider>
      <el-row>
        <el-col :span="12">
          <el-form-item label="是否上架" prop="isOnlineSale">
            <el-switch v-model="courseForm.isOnlineSale"></el-switch>
            <span style="margin-left: 10px;">上架</span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="课程封面图" prop="coverImage">
            <el-upload action="upload_url" :show-file-list="false" :on-success="handleCoverImageSuccess">
              <el-button type="primary">上传</el-button>
            </el-upload>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="精品推荐" prop="isOpenRecommend">
            <el-switch v-model="courseForm.isOpenRecommend"></el-switch>
            <span style="margin-left: 10px;">开启</span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="班级群二维码" prop="classQrCode">
            <el-upload action="upload_url" :show-file-list="false" :on-success="handleClassQrCodeSuccess">
              <el-button type="primary">上传</el-button>
            </el-upload>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="库存量" prop="stockNum">
            <el-input v-model="courseForm.stockNum"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="停售日期" prop="stopSaleDate">
            <el-date-picker v-model="courseForm.stopSaleDate" type="date" placeholder="选择日期"></el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>



      <el-form-item label="详情介绍图集" prop="detailImageList">
        <el-upload action="upload_url" list-type="picture-card" :file-list="courseForm.detailImageList">
          <el-button type="primary">上传</el-button>
        </el-upload>
      </el-form-item>
      <el-form-item label="师资说明" prop="teacherRemark">
        <el-input v-model="courseForm.teacherRemark" type="textarea"></el-input>
      </el-form-item>
      <el-form-item label="服务说明" prop="serviceRemark">
        <el-input v-model="courseForm.serviceRemark" type="textarea"></el-input>
      </el-form-item>



      <!-- 提交按钮 -->
      <el-form-item>
        <el-button type="primary" @click="submitForm(ruleFormRef)">提交</el-button>
        <el-button @click="resetForm(ruleFormRef)">重置</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>


</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { updateCourseStatus, getCourseList, addCourse } from '@/api/Lession/CourseManager/Course'
import moment from 'moment'
import type { FormInstance, FormRules } from 'element-plus'
import { getSubjectList, getSubjectById, getSubjectDropdown, deleteSubjects, updateSubject, addSubject } from '@/api/Lession/SubjectManager/Subject'



defineOptions({
  name: 'CourseManagement'
})

// 加载状态
const loading = ref(false)
// 课程列表数据
const courseList = ref([])
// 总记录数
const total = ref()
const count = ref()

// 查询参数
const queryParams = reactive({
  CourseName: '',
  CampusId: '',
  SubjectId: '',
  status: '',
  GradeId: '',
  PageIndex: 1,
  PageSize: 10
})

// 查询方法
const handleQuery = async () => {
  // TODO: 实现查询逻辑

  const response = await getCourseList(queryParams);
  courseList.value = response.data
  total.value = response.totleCount;
  count.value = response.totlePage;
}
//重置查询条件
const handleResetQuery = () => {
  // TODO: 实现重置查询逻辑
  queryParams.CourseName = ''
  queryParams.CampusId = ''
  queryParams.SubjectId = ''
  queryParams.status = ''
  queryParams.GradeId = ''
  handleQuery()
}



//#region 添加相关操作
// 抽屉开关
const drawer = ref(false)
// 标题
const title = ref("")
// 表单数据
interface CourseForm {
  id: string
  courseName: string
  campusId: string,
  subjectId: string,
  topicId: string,
  gradeId: string,
  sellUnit: string,
  courseTypeId: number,
  totalPrice: number,
  lessonNum: number,
  validMonthNum: number,
  isReserve: boolean,
  lessonCut: number,
  isAfterPay: boolean,
  lessonCutMode: number,
  lessonDuration: number,
  status: boolean,
  isOnlineSale: boolean,
  coverImage: string,
  isOpenRecommend: boolean,
  classQrCode: string,
  stockNum: number,
  stopSaleDate: Date,
  detailImageList: string[],
  teacherRemark: string,
  serviceRemark: string
}

const ruleFormRef = ref()
const courseForm = reactive<CourseForm>({
  id: '',
  courseName: '',
  campusId: '',
  subjectId: '',
  topicId: '',
  gradeId: '',
  sellUnit: '次',
  courseTypeId: 1,
  totalPrice: null,
  lessonNum: null,
  validMonthNum: null,
  isReserve: false,
  lessonCut: null,
  isAfterPay: false,
  lessonCutMode: null,
  lessonDuration: null,
  status: true,
  isOnlineSale: false,
  coverImage: '',
  isOpenRecommend: false,
  classQrCode: '',
  stockNum: null,
  stopSaleDate: null,
  detailImageList: [],
  teacherRemark: '',
  serviceRemark: ''
})

const rules = reactive<FormRules>({
  courseName: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  campusId: [{ required: true, message: '请选择学校', trigger: 'change' }],
  subjectId: [{ required: true, message: '请选择科目', trigger: 'change' }],
  topicId: [{ required: true, message: '请输入关联专题', trigger: 'blur' }],
  gradeId: [{ required: true, message: '请选择年级', trigger: 'change' }],
  sellUnit: [{ required: true, message: '请选择出售单位', trigger: 'change' }],
  totalPrice: [{ required: true, message: '请输入总价', trigger: 'blur' }],
  lessonNum: [{ required: true, message: '请输入课时数', trigger: 'blur' }],
  validMonthNum: [{ required: true, message: '请输入有效月数', trigger: 'blur' }],
  courseTypeId: [{ required: true, message: '请选择课堂类型', trigger: 'change' }],
  lessonCut: [{ required: true, message: '请输入消课课酬', trigger: 'blur' }],
  lessonCutMode: [{ required: true, message: '请选择课酬计费模式', trigger: 'change' }],
  stockNum: [{ required: true, message: '请输入库存量', trigger: 'blur' }],
  stopSaleDate: [{ required: true, message: '请选择停售日期', trigger: 'change' }],
  detailImageList: [{ required: true, message: '请上传详情介绍图集', trigger: 'change' }],
  teacherRemark: [{ required: true, message: '请输入师资说明', trigger: 'blur' }],
  serviceRemark: [{ required: true, message: '请输入服务说明', trigger: 'blur' }],
  coverImage: [{ required: true, message: '请上传课程封面图', trigger: 'change' }],
  classQrCode: [{ required: true, message: '请上传班级群二维码', trigger: 'change' }]
});
// 新增方法
const handleAdd = async () => {
  // TODO: 实现新增逻辑
  drawer.value = true
  title.value = "新增课程"
}
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      const response = await addCourse(courseForm)
      if (response.code === 200) {
        ElMessage.success(response.message)
        drawer.value = false
        handleQuery()
      } else {
        ElMessage.error(response.message)
      }
    } else {
      console.log('error submit!', fields)
    }
  })
}

const resetForm = (formEl: any) => {
  if (!formEl) return
  formEl.resetFields()
}

//#endregion

//#region 操作按钮
const tableRef = ref() // 用于获取表格实例
const actionResult = ref();
const status = ref();
const actions = ref("");
//批量操作
const handleAction = async (action: any) => {
  switch (action) {
    //启用
    case 'enable':
      actions.value = "启用"
      status.value = true;
      actionResult.value = 0;
      break;
    //禁用
    case 'disable':
      actions.value = "禁用"
      status.value = false;
      actionResult.value = 0;
      break;
    //上架
    case 'publish':
      actions.value = "上架"
      status.value = true;
      actionResult.value = 1;
      break;
    //下架
    case 'unpublish':
      actions.value = "下架"
      status.value = true;
      actionResult.value = 1;
      break;
    //删除
    case 'delete':
      actions.value = "删除"
      actionResult.value = 2;
      break;
  }

  // 这里可以添加实际的操作逻辑
  // 获取选中行数据
  const selectedRows = tableRef.value?.getSelectionRows()
  if (!selectedRows?.length) {
    return ElMessage.warning('请先选择要' + actions.value + '的课程')
  }
  // 提取选中行ID
  const ids = selectedRows.map(row => row.id)

  // 显示确认对话框
  await ElMessageBox.confirm(
    `确定【${actions.value}】选中的【${ids.length}】门课程吗?`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
  // 调用后台API

    const response = await updateCourseStatus({
      status: status.value,
      type: actionResult.value,
    }, ids);

      ElMessage.success('课程【' + actions.value + '】成功');
      handleQuery();

};



// 编辑方法
const handleEdit = (row: any) => {
  // TODO: 实现编辑逻辑
  drawer.value = true
  Object.assign(courseForm, row)
}



// 处理每页显示数量变化
const handleSizeChange = (val: number) => {
  queryParams.PageSize = val
  handleQuery()
}

// 处理页码变化
const handleCurrentChange = (val: number) => {
  queryParams.PageIndex = val
  handleQuery()
}
//#endregion
//#region 下拉框数据
//学校选项
const LoadSchool = () => {

}
//科目数据
const SubjectList = ref([{
  id: '',
  subjectName: ''
}])
//科目选项
const LoadSubject = async () => {
  const response = await getSubjectDropdown()
  SubjectList.value = response
}
//年级选项
const LoadGrade = () => {

}
//专题选项
const LoadTopic = () => {

}


//#endregion


onMounted(() => {
  handleQuery()
  LoadSubject()
})
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