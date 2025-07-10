<!-- 课程管理主页面 -->
<template>
  <div class="app-container">
    <!-- 筛选项 -->
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
                <el-option v-for="item in SchoolList" :key="item.id" :label="item.name" :value="item.id" />
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
                <el-option v-for="item in GradeList" :key="item.id" :label="item.gradeName" :value="item.id" />
              </el-select>
            </el-form-item>

            <el-button type="primary" class="filter-item" @click="handleQuery">
              搜索
            </el-button>
            <el-button size="small" class="filter-item" round @click="handleResetQuery">
              ✖
            </el-button>
          </el-form>
        </div>
      </el-card>
    </div>
    <el-card class="box-card">
      <!-- 操作按钮 -->
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
      <!-- 数据展示 -->
      <el-table ref="tableRef" v-loading="loading" :data="courseList" style="width: 100%" border>
        <el-table-column fixed="left" type="selection" width="55" align="center" />
        <el-table-column fixed="left" label="课程" prop="courseName" />
        <el-table-column label="校区" prop="campusName" />
        <el-table-column label="科目" prop="subjectName" />
        <el-table-column label="专题" prop="topicName" />
        <el-table-column label="课型" prop="courseTypeName" />
        <el-table-column label="单价">
          <template v-slot="scope">
            {{ (scope.row.totalPrice / scope.row.lessonNum).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="总售价" prop="totalPrice" />
        <el-table-column label="课时数" prop="lessonNum" />
        <el-table-column label="单位" prop="sellUnit" />
        <el-table-column label="班型" prop="courseTypeName" />
        <el-table-column label="关联数" prop="" />
        <el-table-column label="群二维码" prop="classQrCode">
          <template #default="scope">
            <template v-if="scope.row.classQrCode">
              <el-tooltip placement="top" effect="dark">
                <template #content>
                  <img :src="scope.row.classQrCode" style="width:120px;height:120px;" />
                </template>
                <span style="color: #409EFF; cursor: pointer;">有</span>
              </el-tooltip>
            </template>
            <template v-else>
              <span>无</span>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="可预约" prop="totalPrice" />
        <el-table-column label="上架状态" prop="status">
          <template #default="scope">
            <el-tag v-if="scope.row.isOnlineSale" type="success">已上架</el-tag>
            <el-tag v-else type="danger">未上架</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="库存" prop="stockNum" />
        <el-table-column label="销售量" prop="" />
        <el-table-column label="销售额" prop="" />
        <el-table-column label="销售截止日期" prop="stopSaleDate" width="120">
          <template v-slot="scope">
            {{ moment().format("yyyy-MM-DD") }}
          </template>
        </el-table-column>
        <el-table-column label="课程状态" prop="creationTime">
          <template v-slot="scope">
            <el-tag v-if="scope.row.status" type="success">启用</el-tag>
            <el-tag v-else type="danger">禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="180" align="center">
          <template #default="scope">
            <el-button type="primary" link @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button type="primary" link @click="reletedopen(scope.row)">关联课程</el-button>
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

  <el-drawer v-model="drawer" close-on-press-escape size="850" :title="title" :with-header="true"
    @close="resetForm(ruleFormRef)">
    <el-form ref="ruleFormRef" :model="courseForm" :rules="rules" label-width="auto">
      <!-- 基本信息 -->
      <el-form-item label="课程名称" prop="courseName">
        <el-input v-model="courseForm.courseName"></el-input>
      </el-form-item>
      <el-form-item label="适用学校" prop="campusId">
        <el-select v-model="courseForm.campusId" placeholder="请选择学校">
          <el-option v-for="item in SchoolList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-row>
        <el-col :span="12">
          <el-form-item label="所属科目" prop="subjectId">
            <el-select v-model="courseForm.subjectId" placeholder="请选择科目">
              <el-option v-for="item in SubjectList" :key="item.id" :label="item.subjectName" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="关联专题" prop="topicId">
            <el-select v-model="courseForm.topicId" placeholder="请选择专题">
              <el-option v-for="item in TopicList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="适用年级" prop="gradeId">
            <el-select v-model="courseForm.gratorId" placeholder="请选择年级">
              <el-option v-for="item in GradeList" :key="item.id" :label="item.gradeName" :value="item.id" />
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
              <el-radio :label="0">大班课</el-radio>
              <el-radio :label="1">小班课</el-radio>
              <el-radio :label="2">一对一</el-radio>
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
          <el-form-item label="课程封面图">
            <SingleImageUpload v-model="courseForm.coverImage" :accept="'image/*'" :max-file-size="10" />
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
          <el-form-item label="班级群二维码">
            <SingleImageUpload v-model="courseForm.classQrCode" :accept="'image/*'" :max-file-size="10" />
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

      <!-- <el-form-item label="详情介绍图集">
        <MultiImageUpload v-model="courseForm.detailImageList" :limit="10" />
      </el-form-item> -->
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

  <!-- 关联课程弹窗 -->
  <ReletedCourse v-model:visible="reletedCourseDialogVisible" :course-id="currentCourseId" />

</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { updateCourseStatus, getCourseList, addCourse, updateCourse } from '@/api/Lession/CourseManager/Course'
import moment from 'moment'
import type { FormInstance, FormRules } from 'element-plus'
import { getSubjectDropdown } from '@/api/Lession/SubjectManager/Subject'
import { getSpecialSubjectDropdown } from '@/api/Lession/TopicManager/TopicManager'
import { getGradeDropdown } from '@/api/Lession/ClassAndGrade/Grade'
import ReletedCourse from './reletedcourse/ReletedCourse.vue'
import MultiImageUpload from '@/components/Upload/MultiImageUpload.vue'
import { getOrganizationDropdown } from '@/api/organization/organization.api'


defineOptions({
  name: 'CourseManagement'
})

//#region 数据展示
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

//#endregion

//#region 添加相关操作
// 抽屉开关
const drawer = ref(false)
// 标题
const title = ref("")
// 表单数据
interface CourseForm {
  id:string,
  courseName: string,
  campusId: string,
  subjectId: string,
  topicId: string,
  gratorId: string,
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
  detailImageList: string,
  teacherRemark: string,
  serviceRemark: string
}

const ruleFormRef = ref()
const courseForm = reactive<CourseForm>({
  id:'',
  courseName: '',
  campusId: '',
  subjectId: '',
  topicId: '',
  gratorId: '',
  sellUnit: '次',
  courseTypeId: 1,
  totalPrice: 0,
  lessonNum: 0,
  validMonthNum: 0,
  isReserve: true,
  lessonCut: 0,
  isAfterPay: true,
  lessonCutMode: 0,
  lessonDuration: 0,
  status: true,
  isOnlineSale: false,
  coverImage: '',
  isOpenRecommend: false,
  classQrCode: '',
  stockNum: 0,
  stopSaleDate: new Date(),
  detailImageList: '',
  teacherRemark: '',
  serviceRemark: ''
})

const rules = reactive<FormRules>({
  courseName: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  campusId: [{ required: true, message: '请选择学校', trigger: 'change' }],
  subjectId: [{ required: true, message: '请选择科目', trigger: 'change' }],
  topicId: [{ required: true, message: '请输入关联专题', trigger: 'blur' }],
  gratorId: [{ required: true, message: '请选择年级', trigger: 'change' }],
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

//重置表单
const resetForm = (formEl: any) => {
  if (!formEl) return
  formEl.resetFields()
  // 还原所有字段到初始状态
  Object.assign(courseForm, {
    id: '',
    courseName: '',
    campusId: '',
    subjectId: '',
    topicId: '',
    gratorId: '',
    sellUnit: '次',
    courseTypeId: 1,
    totalPrice: 0,
    lessonNum: 0,
    validMonthNum: 0,
    isReserve: true,
    lessonCut: 0,
    isAfterPay: true,
    lessonCutMode: 0,
    lessonDuration: 0,
    status: true,
    isOnlineSale: false,
    coverImage: '',
    isOpenRecommend: false,
    classQrCode: '',
    stockNum: 0,
    stopSaleDate: new Date(),
    detailImageList: '',
    teacherRemark: '',
    serviceRemark: ''
  })
}
// 新增方法
const handleAdd = async () => {
  // TODO: 实现新增逻辑
  drawer.value = true
  title.value = "新增课程"
}
// 编辑方法
const handleEdit = (row: any) => {
  title.value = "编辑课程";
  drawer.value = true;
  // 深拷贝，避免直接修改表格数据
  Object.assign(courseForm, JSON.parse(JSON.stringify(row)));
}

// 提交方法
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      let response;
      if (title.value == "新增课程") {
        // 编辑
        response = await addCourse(courseForm);
      } else {
        // 新增
        response = await updateCourse(courseForm);
      }
        drawer.value = false;
        handleQuery();
    } else {
      console.log('error submit!', fields);
    }
  });
};

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
      status.value = false;
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

  await updateCourseStatus({
    status: status.value,
    type: actionResult.value,
  }, ids);

  ElMessage.success('课程【' + actions.value + '】成功');
  handleQuery();

};


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

//#region 下拉框数据
//学校下拉数据
const SchoolList = ref([{
  id: '',
  name: ''
}])
//学校选项
const LoadSchool = async () => {
  const response = await getOrganizationDropdown();
  console.log(response)
  SchoolList.value = response
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
const GradeList = ref([{
  id: '',
  gradeName: ''
}])
//年级选项
const LoadGrade = async () => {
  const response = await getGradeDropdown()
  GradeList.value = response

}
//专题下拉数据
const TopicList = ref([{
  id: '',
  name: ''
}])
//专题选项
const LoadTopic = async () => {
  const response = await getSpecialSubjectDropdown();
  TopicList.value = response
}
//#endregion
//#region 关联课程相关
const reletedCourseDialogVisible = ref(false)
const currentCourseId = ref('')

function reletedopen(row: any) {
  currentCourseId.value = row.id;
  reletedCourseDialogVisible.value = true;
}
//#endregion

//#endregion

//钩子函数
onMounted(() => {
  //课程加载
  handleQuery()
  //科目选项
  LoadSubject()
  //科目选项
  LoadTopic()
  //校区选项
  LoadSchool()
  //年级选项
  LoadGrade()
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

.avatar-uploader .avatar {
  width: 100px;
  height: 100px;
}
</style>