<template>
  <div class="material-management">
    <!-- 搜索栏 -->
    <el-card style="max-width: 10000px">
      <div class="search-bar">
        <el-form :inline="true" :model="queryParams">
          <el-form-item label="物料名称：">
            <el-input v-model="queryParams.materialName" placeholder="请输入物料名称" clearable />
          </el-form-item>
          <el-form-item label="状态：">
            <el-select v-model="queryParams.materialStatus" placeholder="请选择" style="width: 200px;">
              <el-option label="全部" value="" />
              <el-option label="启用" :value="true" />
              <el-option label="禁用" :value="false" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">查询</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card style="max-width: 10000px;margin-top: 10px">
      <!-- 表格标题和操作按钮区 -->
      <div class="table-header-bar">
        <div class="table-title">物料列表</div>
        <div class="operation-area">
          <el-button type="primary" @click="showAddDialog">新增</el-button>
          <el-button type="danger" @click="handleDelete">删除</el-button>
          <el-button type="success" @click="handlestartEnable(true)">启用</el-button>
          <el-button type="danger" @click="handlestartEnable(false)">禁用</el-button>
          <el-button type="success" @click="fetchMaterialList">刷新</el-button>
          <el-button @click="showColumnDialog = true">自定义显示列</el-button>
        </div>
      </div>
      <!-- 物料表格 -->
      <el-table ref="tableRef" :data="materialList" style="width: 100%" @selection-change="selectAll">
        <el-table-column type="selection" width="50" />
        <el-table-column v-for="col in showColumns" :key="col.prop" :prop="col.prop" :label="col.label">
          <template v-if="col.prop === 'materialImage'" #default="{ row }">
            <el-image v-if="row.materialImage" :src="row.materialImage" :preview-src-list="[row.materialImage]"
              :style="'width:40px;height:40px'" />
            <span v-else style="color:#ccc">加载失败</span>
          </template>
          <template v-else-if="col.prop === 'lastModificationTime'" #default="{ row }">
            {{ moment(row.lastModificationTime).format("YYYY-MM-DD HH:mm:ss") }}
          </template>
          <template v-else-if="col.prop === 'status'" #default="{ row }">
            <el-tag v-if="row.status === true" type="primary">启用</el-tag>
            <el-tag v-if="row.status === false" type="danger">禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button type="text" @click="showEditDialog(row)">编辑</el-button>
            <el-button type="text" @click="showStockInDialog(row)">入库</el-button>
            <el-button type="text" @click="showStockOutDialog(row)">出库</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="pagination-container">
        <Pagination v-model:total="pageParams.TotalCount" v-model:page="pageParams.PageIndex"
          v-model:limit="pageParams.PageSize" @pagination="handlePagination" />
      </div>
    </el-card>
    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="40%" @closed="resetForm">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="物料名称" prop="materialName">
          <el-input v-model="formData.materialName" placeholder="请输入物料名称" />
        </el-form-item>
        <el-form-item label="所属学校" prop="schoolId">
          <el-select v-model="formData.schoolId" placeholder="请选择">
            <el-option v-for="item in Schoolname" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属分类" prop="materialTypeId">
          <el-select v-model="formData.materialTypeId" placeholder="请选择">
            <el-option label="教材" :value="0" />
            <el-option label="办公用品" :value="1" />
            <el-option label="桌椅" :value="2" />
            <el-option label="娱乐设施" :value="3" />
            <el-option label="电脑耗材" :value="4" />
            <el-option label="学习用品" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="物料图片" prop="materialImage">
          <el-upload class="avatar-uploader" action="https://localhost:44375/api/upload/image" :show-file-list="false"
            :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
            <img v-if="formData.materialImage" :src="formData.materialImage" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon">
              <Plus />
            </el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="物料说明" prop="mterialDescription">
          <el-input v-model="formData.mterialDescription" placeholder="请输入物料说明" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确认</el-button>
      </template>
    </el-dialog>
    <!-- 入库弹窗 -->
    <el-dialog v-model="stockInDialogVisible" title="物料入库" width="30%">
      <el-form :model="stockForm" :rules="stockInRules" ref="stockInFormRef" label-width="100px">
        <el-form-item label="入库数量:" prop="changeSum" required>
          <el-input-number v-model="stockForm.changeSum" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="入库说明:" prop="reason" required>
          <el-input v-model="stockForm.reason" type="textarea" placeholder="请输入入库说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="stockInDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitStockIn">提交</el-button>
      </template>
    </el-dialog>
    <!-- 出库弹窗 -->
    <el-dialog v-model="stockOutDialogVisible" title="物料出库" width="30%">
      <el-form :model="stockForm" :rules="stockOutRules" ref="stockOutFormRef" label-width="100px">
        <el-form-item label="出库数量:" prop="changeSum" required>
          <el-input-number v-model="stockForm.changeSum" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="原因说明:" prop="reason" required>
          <el-input v-model="stockForm.reason" type="textarea" placeholder="请输入原因说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="stockOutDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitStockOut">提交</el-button>
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
import Pagination from '@/components/Pagination/index.vue';
import { updateMaterial, getPagedMaterials, stockInMaterial, stockOutMaterial, updateMaterialStatus, addMaterial, batchDeleteMaterial } from "@/api/Materials/material.api";
import moment from "moment";
import { Plus } from '@element-plus/icons-vue'
import type { UploadProps } from 'element-plus'
import OrganizationAPI from "@/api/Organization/organizations.api";
import { materialRetordIn, materialRetordOut } from '@/api/Materials/storerooms.api';
// 查询参数
const queryParams = reactive({
  materialName: "",
  materialStatus: ""
});
const pageParams = reactive({
  PageIndex: 1,
  PageSize: 10,
  TotalCount: 0,
  TotalPage: 0
});
// 查询
const handleQuery = () => {
  pageParams.PageIndex = 1;
  fetchMaterialList();
};
// 获取列表
const fetchMaterialList = () => {
  const params: any = {
    pageIndex: pageParams.PageIndex,
    pageSize: pageParams.PageSize,
    materialName: queryParams.materialName,
  };
  if (queryParams.materialStatus !== '') {
    params.MaterialStatus = queryParams.materialStatus;
  }
  getPagedMaterials(params).then((res) => {
    console.log("物料列表=>", res);
    materialList.value = res.data;
    pageParams.TotalCount = res.totleCount;
    pageParams.TotalPage = res.totlePage;
  });
};
// 分页
const handlePagination = ({ page, limit }: { page: number; limit: number }) => {
  pageParams.PageIndex = page;
  pageParams.PageSize = limit;
  fetchMaterialList();
};
// 新增/编辑弹窗
const showAddDialog = () => {
  isAdd.value = true;
  dialogTitle.value = "新增物料";
  resetForm();
  dialogVisible.value = true;
};
const showEditDialog = (row: any) => {
  console.log("Editing row ID:", row.id);
  isAdd.value = false;
  dialogTitle.value = "编辑物料";
  Object.assign(formData, row);
  dialogVisible.value = true;
};
const materialList = ref<any[]>([]);
// 弹窗相关
const dialogVisible = ref(false);
const dialogTitle = ref("新增物料");
const formRef = ref<FormInstance>();
const isAdd = ref(true);
const formData = reactive<any>({
  id: "",
  materialName: "",
  materialTypeId: "",
  schoolId: null,
  materialImage: "",
  mterialDescription: ""
});
const rules: FormRules = {
  materialName: [{ required: true, message: "请输入物料名称", trigger: "blur" }],
  materialTypeId: [{ required: true, message: "请输入分类", trigger: "blur" }],
  schoolId: [{ required: true, message: "请输入所属学校", trigger: "blur" }],
  materialImage: [{ required: true, message: "请上传物料图片", trigger: "change" }],
  mterialDescription: [{ required: true, message: "请输入物料说明", trigger: "blur" }],
};
const resetForm = () => {
  formData.id = "";
  formData.materialName = "";
  formData.materialTypeId = "";
  formData.schoolId = null;
  formData.materialImage = "";
  formData.mterialDescription = "";
};
//学校下拉
let Schoolname = ref([{
  id: "",
  name: ""
}])
const SchoolSelect = () => {
  OrganizationAPI.getOrganizationSelect().then((res) => {
    console.log("学校下拉=>", res);
    Schoolname.value = res;
  })
}
// 图片上传
const imageUrl = ref('');
const handleAvatarSuccess: UploadProps['onSuccess'] = (response, uploadFile) => {
  imageUrl.value = URL.createObjectURL(uploadFile.raw!); // 预览图片
  formData.materialImage = response; // 将返回的图片 URL 赋值给 formData
};
const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png' && rawFile.type !== 'image/gif') {
    ElMessage.error('图片只能是 JPG/PNG/GIF 格式!');
    return false;
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('图片大小不能超过 2MB!');
    return false;
  }
  return true;
};
//添加修改
const submitForm = () => {
  (formRef.value as FormInstance).validate((valid) => {
    if (valid) {
      if (isAdd.value) {
        addMaterial(formData).then((res) => {
          console.log("物料添加=>", res);
          ElMessage.success("添加成功");
          dialogVisible.value = false;
          fetchMaterialList();

        })
      } else {
        console.log("Submitting update for ID:", formData.id);
        updateMaterial(formData.id, formData).then(res => {
          console.log("物料修改=>", res);
          ElMessage.success("编辑成功");
          dialogVisible.value = false;
          fetchMaterialList();
        })
      }
    }
  });
};
//全选 全部选
const Ids = ref([]);
const selectAll = (id: any) => {
  Ids.value = id.map((item: any) => (item.id));
  console.log("ids=>", Ids.value);
}
// 批量删除
const handleDelete = () => {
  if (!Ids.value.length) {
    ElMessage.warning("请先选择要删除的物料！");
    return;
  }
  ElMessageBox.confirm('确认删除吗?', '提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    .then(() => {
      batchDeleteMaterial({ ids: Ids.value }).then((res) => {
        console.log("物料批删=>", res);
        ElMessage.success("删除成功");
        fetchMaterialList();
      })
    })
    .catch(() => {
      ElMessage.info('删除已取消');
    });
};
// 启用/禁用
const handlestartEnable = (status: boolean) => {
  if (!Ids.value.length) {
    ElMessage.warning("请先选择要操作的物料！");
    return;
  }
  updateMaterialStatus(Ids.value, status).then(() => {
    ElMessage.success(status ? "启用成功" : "禁用成功");
    fetchMaterialList();
  });
};

// 入库/出库弹窗
const stockInDialogVisible = ref(false);
const stockOutDialogVisible = ref(false);
const stockForm = reactive({
  materialId: "",
  changeSum: 1,
  reason: "",
  staffId: ""
});
const stockInFormRef = ref<FormInstance>();
const stockOutFormRef = ref<FormInstance>();
const stockInRules: FormRules = {
  changeSum: [
    { required: true, message: "请输入入库数量", trigger: "blur" }
  ],
  reason: [
    { required: true, message: "请输入入库说明", trigger: "blur" }
  ]
};
const stockOutRules: FormRules = {
  changeSum: [
    { required: true, message: "请输入出库数量", trigger: "blur" }
  ],
  reason: [
    { required: true, message: "请输入原因说明", trigger: "blur" }
  ]
};
// 入库/出库弹窗
const showStockInDialog = (row: any) => {
  stockForm.materialId = row.id;
  console.log("入库获取id=>", row.id);
  stockForm.staffId = "3a1ae2bb-d04c-4f58-d353-b43049a572fe";
  stockForm.changeSum = 1;
  stockForm.reason = "";
  stockInDialogVisible.value = true;
};
const showStockOutDialog = (row: any) => {
  stockForm.materialId = row.id;
  stockForm.staffId = "3a1add4f-706a-114a-d090-919def54ff5a";
  stockForm.changeSum = 1;
  stockForm.reason = "";
  stockOutDialogVisible.value = true;
};
const submitStockIn = () => {
  (stockInFormRef.value as FormInstance).validate((valid) => {
    if (!valid) return;
    materialRetordIn(stockForm).then(() => {
      ElMessage.success("入库成功");
      stockInDialogVisible.value = false;
      fetchMaterialList();
    });
  });
};
const submitStockOut = () => {
  (stockOutFormRef.value as FormInstance).validate((valid) => {
    if (!valid) return;
    materialRetordOut(stockForm).then(() => {
      ElMessage.success("出库成功");
      stockOutDialogVisible.value = false;
      fetchMaterialList();
    });
  });
};


// 自定义显示列相关
const allColumns = ref([
  { label: "图片", prop: "materialImage" },
  { label: "物料名称", prop: "materialName" },
  { label: "分类", prop: "materialTypeName" },
  { label: "所属学校", prop: "schoolName" },
  { label: "库存", prop: "stockSum" },
  { label: "最后编辑时间", prop: "lastModificationTime" },
  { label: "状态", prop: "status" },
]);
const checkedProps = ref(allColumns.value.map(col => col.prop));
const showColumns = computed(() =>
  allColumns.value.filter(col => checkedProps.value.includes(col.prop))
);
const showColumnDialog = ref(false);
const resetColumns = () => {
  checkedProps.value = allColumns.value.map(col => col.prop);
};

onMounted(() => {
  fetchMaterialList();
  SchoolSelect();
});
</script>

<style scoped>
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}

.material-management {
  padding: 24px;
  background: #fff;
  min-height: 100vh;
}

.search-bar {
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
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-container {
  margin-top: 16px;
  text-align: left;
}
</style>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>