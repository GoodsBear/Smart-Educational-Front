<template>
  <div class="flex h-full">
    <!-- 左侧组织树卡片  -->
    <el-card class="org-tree-card w-[30%] flex-shrink-0 h-full">
      <salarytree v-model:TreeOrganizationId="TreeOrganizationId"></salarytree>
    </el-card>
    <!-- 右侧薪资列表  -->
    <div class="salary-list bg-aquamarine w-[70%] h-full p-4 overflow-auto">
      <h3 class="font-bold mb-3">薪资列表</h3>
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="salaryList"
        style="width: 100%"
        @selection-change="ToAll"
      >
        <el-table-column type="index" label="序号" width="80" />
        <template v-for="col in allColumns" :key="col.prop">
          <el-table-column
            v-if="checkedProps.includes(col.prop)"
            :prop="col.prop"
            :label="col.label"
          >
            <template v-if="col.prop === 'basicSalaryType'" #default="{ row }">
              <el-tag :type="row.basicSalaryType === 0 ? 'success' : 'warning'">
                {{ row.basicSalaryType === 0 ? "非底薪模式" : "底薪模式" }}
              </el-tag>
            </template>
            <template v-else-if="col.prop === 'classHourDuration'" #default="{ row }">
              <span v-if="row.classHourDuration != 0">{{ row.classHourDuration }}分钟</span>
              <span v-else-if="row.classHourDuration === 0"></span>
            </template>
            <template v-else-if="col.prop === 'classHourFee'" #default="{ row }">
              <span v-if="row.classHourFee != 0">{{ row.classHourFee }}元</span>
              <span v-else-if="row.classHourFee === 0"></span>
            </template>
            <template v-else-if="col.prop === 'assistantFee'" #default="{ row }">
              <span v-if="row.assistantFee != 0">{{ row.assistantFee }}元</span>
              <span v-else-if="row.assistantFee === 0"></span>
            </template>
          </el-table-column>
        </template>
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button size="small" @click="showEditDialog(row)">修改</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
  <!-- 编辑修改dialog -->
  <el-dialog
    v-model="open"
    title="薪资设置"
    width="700px"
    destroy-on-close
    :close-on-click-modal="false"
  >
    <el-form re="topicForm" :model="form" :rules="rules" label-width="100px" status-icon>
      <el-form-item label="员工姓名">
        <el-input v-model="form.staffName" readonly />
        <!-- 禁用（disabled）和只读（readonly） -->
      </el-form-item>
      <el-form-item label="薪资模式">
        <el-radio-group v-model="form.basicSalaryType">
          <el-radio :value="0" size="large">非底薪模式</el-radio>
          <el-radio :value="1" size="large">底薪模式</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="form.basicSalaryType == 1" label="底薪" prop="basicSalary">
        <el-input v-model="form.basicSalary">
          <template #append>元/月</template>
        </el-input>
      </el-form-item>
      <el-form-item v-if="form.basicSalaryType == 1" label="达标课时数" prop="qualifiedClassHours">
        <el-input v-model="form.qualifiedClassHours" type="number" />
        <span class="teachermoney">
          若开启系统配置“老师上课数达标后才有课时费”，则上完达标课时数后才统计课时费。
        </span>
      </el-form-item>
      <!-- <el-form-item label="讲师" prop="teacher">
        <el-select v-model="form.teacher" placeholder="请输入讲师名称" style="width: 240px">
          <el-option v-for="item in staffList" :key="item.id" :label="item.staffName" :value="item.staffName" />
        </el-select>
      </el-form-item> -->
      <el-divider>课时费设置</el-divider>
      <div width="500" append-to-body>
        <!-- v-model="form.classHourFeeSettings"  -->
        <!-- 添加按钮 -->
        <el-button type="primary" style="margin-bottom: 12px" @click="addRow">添 加</el-button>
        <!-- 动态行列表 -->
        <div class="border border-slate-200 rounded-lg overflow-hidden">
          <!-- 表头 -->
          <div
            class="flex items-center bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 border-b border-slate-200"
          >
            <div class="w-120">上课时长</div>
            <div class="w-120 ml-2">课时费(元)</div>
            <div class="w-120 ml-2">助教费(元)</div>
            <div class="ml-2 flex-1 text-right"></div>
          </div>

          <!-- 数据行 -->
          <div
            v-for="(row, index) in rows"
            :key="index"
            class="flex items-center px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors"
          >
            <!-- 课时时长（下拉框） -->
            <el-select v-model="row.classHourDuration" placeholder="请选择" class="w-120">
              <el-option
                v-for="opt in durationOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>

            <!-- 课时费（输入框） -->
            <el-input
              v-model.number="row.classHourFee"
              placeholder="课时费(元)"
              class="w-120 ml-2"
            />

            <!-- 助教费（输入框） -->
            <el-input
              v-model.number="row.assistantFee"
              placeholder="助教费(元)"
              class="w-120 ml-2"
            />

            <!-- 删除按钮 -->
            <el-button
              type="danger"
              class="ml-2"
              :disabled="rows.length === 1"
              @click="deleteRow(index)"
            >
              删 除
            </el-button>
          </div>
        </div>
      </div>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <!-- //submitForm -->
        <el-button type="primary" @click="submitForm">提 交</el-button>
        <el-button @click="getSalary">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import { getSalaryList, getSalaryHourList, updateSalary } from "@/api/SalaryManager/Salary";
import salarytree from "./salaryTree.vue";
import { ref, reactive, onMounted } from "vue";
//import { parse } from "path";
const topicForm = ref();
const loading = ref(false);
const open = ref(false);
const salaryList = ref([]);
const queryParams = reactive({
  OrganizationId: "",
  PageIndex: 1,
  PageSize: 10,
});
const allColumns = [
  { label: "主键", prop: "id", show: false },
  { label: "姓名主键", prop: "staffId", show: false },
  { label: "姓名或电话", prop: "staffName", show: true },
  { label: "薪资模式", prop: "basicSalaryType", show: true },
  { label: "底薪", prop: "basicSalary", show: true },
  { label: "达标课时数", prop: "qualifiedClassHours", show: true },
  { label: "课时时长", prop: "classHourDuration", show: true },
  { label: "课时费", prop: "classHourFee", show: true },
  { label: "助教费", prop: "assistantFee", show: true },
];
const checkedProps = ref(allColumns.filter((c) => c.show).map((c) => c.prop));
onMounted(async () => {
  getSalary(); //薪资
});
// 获取选中节点

//组织机构树形
const TreeOrganizationId = ref<string>("");
watch(TreeOrganizationId, (newVal, oldVal) => {
  console.log("titleStaffName 变化:", newVal, oldVal);
  queryParams.OrganizationId = newVal;
  getSalary();
  // 执行自定义逻辑（如调用 API、更新其他状态等）
});

//获取薪资列表
const getSalary = async () => {
  try {
    loading.value = true;
    const params = {
      OrganizationId: queryParams.OrganizationId,
      PageIndex: queryParams.PageIndex,
      PageSize: queryParams.PageSize,
    };
    const response = await getSalaryList(params);
    console.log("接口返回", response);
    salaryList.value = response.data;
  } catch {
    ElMessage.error("获取薪资列表失败");
  } finally {
    loading.value = false;
  }
};

// DTO 接口
interface UpdateSalaryDto {
  classHourDuration?: number;
  classHourFee?: number;
  assistantFee?: number;
}
//表单参数
const form = ref({
  id: "",
  staffId: "",
  staffName: "",
  basicSalaryType: 0,
  basicSalary: 0,
  qualifiedClassHours: 0,
  classHourFeeSettings: [],
  organizationId: "",
  classHourDuration: 0,
  classHourFee: 0,
  assistantFee: 0,
});
//重置表单
const reset = () => {
  form.value = {
    id: "",
    staffId: "",
    staffName: "",
    basicSalaryType: 0,
    basicSalary: 0,
    qualifiedClassHours: 0,
    classHourFeeSettings: [],
    organizationId: "",
    classHourDuration: 0,
    classHourFee: 0,
    assistantFee: 0,
  };
};
//打开修改对话框
const showEditDialog = async (row: any) => {
  open.value = true;
  form.value = row;
  //获取课时表列表
  const response = await getSalaryHourList(row.id);
  console.log("getSalaryHourList接口返回", response);
  //课时表数据获取到rows
  rows.value = response;
  // rows.value = form.value;
};
// 转换函数
const convertToDtoArray = () => {
  return rows.value.map((row) => ({
    classHourDuration: row.classHourDuration ? Number(row.classHourDuration) : undefined,
    classHourFee: row.classHourFee,
    assistantFee: row.assistantFee,
  }));
};
//修改表单提交
const submitForm = async () => {
  // const formEl = topicForm.value
  //  console.log("submitForm--1");
  // form.value.classHourFeeSettings
  // if (!formEl) return
  console.log("submitForm--123");
  //将classHourFeeSettings转化为数组？？
  //form.value.classHourFeeSettings = rows.value;
  const dtoArray: UpdateSalaryDto[] = convertToDtoArray();
  //  form.value.classHourFeeSettings = dtoArray;
  console.log("提交的数据:", dtoArray);
  try {
    // await formEl.validate();
    console.log("submitForm--12");
    try {
      await updateSalary(form.value.id, {
        id: form.value.id,
        staffId: form.value.staffId,
        staffName: form.value.staffName,
        basicSalaryType: form.value.basicSalaryType,
        basicSalary: form.value.basicSalary,
        qualifiedClassHours: form.value.qualifiedClassHours,
        classHourFeeSettings: dtoArray,
        classHourDuration: form.value.classHourDuration,
        classHourFee: form.value.classHourFee,
        assistantFee: form.value.assistantFee,
      });
      ElMessage.success("修改成功");
      open.value = false;
      reset();
      getSalary();
    } catch (error: any) {
      console.error("修改失败:", error.response?.data);
      ElMessage.error(error.response?.data?.error?.message || "修改失败");
    }
  } catch (error) {
    console.error("表单验证失败:", error);
    ElMessage.warning("请填写必填项");
    return false;
  }
};
// 表单校验
const rules = {
  basicSalary: [
    {
      validator: (rule, value, callback) => {
        const basic = form.value.basicSalaryType; // 获取表单中的basicSalaryType
        if (basic == 0 && !value) {
          // 若basic为0且basicSalary为空，则通过校验
          //0为非底薪模式
          callback();
        } else if (basic != 0 && !value) {
          // 若basic=1但basicSalary为空，则触发错误
          callback(new Error("底薪不能为空"));
        } else {
          // 其他情况通过校验
          callback();
        }
      },
      trigger: "blur",
    },
  ],
  qualifiedClassHours: [
    {
      validator: (rule, value, callback) => {
        const basic = form.value.qualifiedClassHours; // 获取表单中的qualifiedClassHours
        if (basic == 0 && !value) {
          // 若basic为0且basicSalary为空，则通过校验
          //0为非底薪模式
          callback();
        } else if (basic != 0 && !value) {
          // 若basic=1但basicSalary为空，则触发错误
          callback(new Error("达标课时数不能为空"));
        } else {
          // 其他情况通过校验
          callback();
        }
      },
      trigger: "blur",
    },
  ],
};

// 课时时长选项（可自定义）
const durationOptions = [
  { label: "45", value: 45 },
  { label: "50", value: 50 },
  { label: "80", value: 80 },
  { label: "180", value: 180 },
];

// 动态行数据（响应式）
const rows = ref([
  {
    classHourDuration: "", // 课时时长（关联下拉框）
    classHourFee: 0, // 课时费（数字类型）
    assistantFee: 0, // 助教费（数字类型）
  },
]);
// 添加一行
const addRow = () => {
  rows.value.push({
    classHourDuration: "",
    classHourFee: 0,
    assistantFee: 0,
  });
};
// 删除一行（保留至少一行）
const deleteRow = (index: number) => {
  if (rows.value.length === 1) return; // 禁止删除最后一行
  rows.value.splice(index, 1);
};
</script>

<style scoped>
.dynamic-row {
  padding: 16px;
  background: #fff;
  border-radius: 8px;
}

.row-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
</style>
<style scoped>
.teachermoney {
  font-size: 0.75rem;
  color: #909399;
}

/* 页面 */
.flex {
  display: flex;
}

.h-full {
  height: 100%;
}

.w-\[30\%\] {
  width: 20%;
}

.w-\[70\%\] {
  width: 80%;
}

.flex-shrink-0 {
  flex-shrink: 0;
}

.p-4 {
  padding: 1rem;
}

.font-bold {
  font-weight: bold;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.overflow-auto {
  overflow: auto;
}

.overflow-y-auto {
  overflow-y: auto;
}

.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.org-tree-card {
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
  font-weight: bold;
}

.tree-content {
  padding: 16px;
}

.text-item {
  margin-bottom: 8px;
  padding: 8px;
  border-radius: 4px;
  background-color: #f5f7fa;
  transition: background-color 0.3s;
}

.text-item:hover {
  background-color: #e4e7ed;
}

.card-footer {
  padding: 16px;
  border-top: 1px solid #ebeef5;
  text-align: center;
  color: #909399;
  font-size: 14px;
}
</style>
