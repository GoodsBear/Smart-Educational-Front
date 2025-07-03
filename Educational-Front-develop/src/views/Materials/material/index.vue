<template>
  <div class="material-management">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="物料名称：">
          <el-input v-model="queryParams.name" placeholder="请输入物料名称" clearable />
        </el-form-item>
        <el-form-item label="状态：">
          <el-select v-model="queryParams.status" placeholder="请选择">
            <el-option label="全部" value="" />
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchMaterialList">查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 操作按钮区 -->
    <div class="operation-area">
      <el-button type="primary" @click="showAddDialog">新增</el-button>
      <el-button @click="handleDelete">删除</el-button>
      <el-button @click="handleEnable(true)">启用</el-button>
      <el-button @click="handleEnable(false)">禁用</el-button>
      <el-button @click="fetchMaterialList">刷新</el-button>
      <el-button @click="showColumnDialog = true">自定义显示列</el-button>
    </div>
    <!-- 物料表格 -->
    <el-table ref="tableRef" :data="materialList" style="width: 100%" @selection-change="selectAll">
      <el-table-column type="selection" width="50" />
      <el-table-column v-for="col in showColumns" :key="col.prop" :prop="col.prop" :label="col.label" :width="col.width" :min-width="col.minWidth">
        <template v-if="col.templet === 'image'" #default="{ row }">
          <el-image v-if="row[col.prop]" :src="row[col.prop]" :preview-src-list="[row[col.prop]]" :style="'width:40px;height:40px'" />
          <span v-else style="color:#ccc">加载失败</span>
        </template>
        <template v-else-if="col.templet === 'list'" #default="{ row }">
          {{ col.selectList[row[col.prop]] || '' }}
        </template>
        <template v-else-if="col.templet === 'date'" #default="{ row }">
          {{ row[col.prop] ? (row[col.prop].replace('T', ' ').slice(0, 16)) : '' }}
        </template>
        <template v-else #default="{ row }">
          {{ row[col.prop] }}
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
      <el-pagination
        background
        layout="total, prev, pager, next, sizes"
        :total="pageParams.total"
        :page-size="pageParams.pageSize"
        :current-page="pageParams.pageIndex"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="40%" @closed="resetForm">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="物料名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入物料名称" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-input v-model="formData.category" placeholder="请输入分类" />
        </el-form-item>
        <el-form-item label="所属学校" prop="school">
          <el-input v-model="formData.school" placeholder="请输入所属学校" />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="formData.stock" :min="0" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status">
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确认</el-button>
      </template>
    </el-dialog>
    <!-- 入库弹窗 -->
    <el-dialog v-model="stockInDialogVisible" title="物料入库" width="30%">
      <el-form :model="stockForm">
        <el-form-item label="入库数量">
          <el-input-number v-model="stockForm.count" :min="1" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="stockInDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitStockIn">确认</el-button>
      </template>
    </el-dialog>
    <!-- 出库弹窗 -->
    <el-dialog v-model="stockOutDialogVisible" title="物料出库" width="30%">
      <el-form :model="stockForm">
        <el-form-item label="出库数量">
          <el-input-number v-model="stockForm.count" :min="1" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="stockOutDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitStockOut">确认</el-button>
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
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus";
import {
  addMaterial,
  getPagedMaterials,
  stockInMaterial,
  stockOutMaterial,
  updateMaterialStatus
} from "@/api/Materials/material.api";

// 查询参数
const queryParams = reactive({ name: "", status: "" });
const pageParams = reactive({ pageIndex: 1, pageSize: 10, total: 0 });
const materialList = ref<any[]>([]);
const Ids = ref<string[]>([]);

// 列定义
const allColumns = ref([
  { label: "图片", prop: "image", width: 70, templet: "image" },
  { label: "物料名称", prop: "name", minWidth: 120 },
  { label: "分类", prop: "category", minWidth: 80 },
  { label: "所属学校", prop: "school", minWidth: 100 },
  { label: "库存", prop: "stock", minWidth: 60 },
  { label: "最后编辑时间", prop: "editTime", minWidth: 150, templet: "date" },
  { label: "状态", prop: "status", minWidth: 70, templet: "list", selectList: { 1: "启用", 0: "禁用" } }
]);
const checkedProps = ref(allColumns.value.map(col => col.prop));
const resetColumns = () => {
  checkedProps.value = allColumns.value.map(col => col.prop);
};
const showColumns = computed(() => allColumns.value.filter(col => checkedProps.value.includes(col.prop)));

// 弹窗相关
const dialogVisible = ref(false);
const dialogTitle = ref("新增物料");
const formRef = ref<FormInstance>();
const isAdd = ref(true);
const formData = reactive<any>({ id: "", name: "", category: "", school: "", stock: 0, status: 1 });
const rules: FormRules = {
  name: [{ required: true, message: "请输入物料名称", trigger: "blur" }],
  category: [{ required: true, message: "请输入分类", trigger: "blur" }],
  school: [{ required: true, message: "请输入所属学校", trigger: "blur" }],
  stock: [{ required: true, message: "请输入库存", trigger: "blur" }],
};

// 入库/出库弹窗
const stockInDialogVisible = ref(false);
const stockOutDialogVisible = ref(false);
const stockForm = reactive({ id: "", count: 1 });

// 选择
const selectAll = (rows: any[]) => {
  Ids.value = rows.map(item => item.id);
};

// 获取列表
const fetchMaterialList = () => {
  const params = {
    pageIndex: pageParams.pageIndex,
    pageSize: pageParams.pageSize,
    name: queryParams.name,
    status: queryParams.status
  };
  getPagedMaterials(params).then(res => {
    materialList.value = res.data?.items || [];
    pageParams.total = res.data?.total || 0;
  });
};

// 分页
const handleSizeChange = (size: number) => {
  pageParams.pageSize = size;
  fetchMaterialList();
};
const handleCurrentChange = (page: number) => {
  pageParams.pageIndex = page;
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
  isAdd.value = false;
  dialogTitle.value = "编辑物料";
  Object.assign(formData, row);
  dialogVisible.value = true;
};
const resetForm = () => {
  formData.id = "";
  formData.name = "";
  formData.category = "";
  formData.school = "";
  formData.stock = 0;
  formData.status = 1;
};
const submitForm = () => {
  (formRef.value as FormInstance).validate((valid) => {
    if (valid) {
      if (isAdd.value) {
        addMaterial(formData).then(() => {
          ElMessage.success("添加成功");
          dialogVisible.value = false;
          fetchMaterialList();
        });
      } else {
        // TODO: 编辑接口
        ElMessage.success("编辑成功");
        dialogVisible.value = false;
        fetchMaterialList();
      }
    }
  });
};
// 删除
const handleDelete = () => {
  if (!Ids.value.length) {
    ElMessage.warning("请先选择要删除的物料！");
    return;
  }
  ElMessageBox.confirm('确认删除吗?', '提示', { confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning' })
    .then(() => {
      // TODO: 删除接口
      ElMessage.success("删除成功");
      fetchMaterialList();
    })
    .catch(() => {
      ElMessage.info('删除已取消');
    });
};
// 启用/禁用
const handleEnable = (enable: boolean) => {
  if (!Ids.value.length) {
    ElMessage.warning("请先选择要操作的物料！");
    return;
  }
  updateMaterialStatus({ ids: Ids.value, status: enable ? 1 : 0 }).then(() => {
    ElMessage.success(enable ? "启用成功" : "禁用成功");
    fetchMaterialList();
  });
};
// 入库/出库弹窗
const showStockInDialog = (row: any) => {
  stockForm.id = row.id;
  stockForm.count = 1;
  stockInDialogVisible.value = true;
};
const showStockOutDialog = (row: any) => {
  stockForm.id = row.id;
  stockForm.count = 1;
  stockOutDialogVisible.value = true;
};
const submitStockIn = () => {
  stockInMaterial(stockForm.id, { count: stockForm.count }).then(() => {
    ElMessage.success("入库成功");
    stockInDialogVisible.value = false;
    fetchMaterialList();
  });
};
const submitStockOut = () => {
  stockOutMaterial(stockForm.id, { count: stockForm.count }).then(() => {
    ElMessage.success("出库成功");
    stockOutDialogVisible.value = false;
    fetchMaterialList();
  });
};
// 自定义列
const showColumnDialog = ref(false);

onMounted(() => {
  fetchMaterialList();
});
</script>

<style scoped>
.material-management {
  padding: 24px;
  background: #fff;
  min-height: 100vh;
}
.search-bar {
  margin-bottom: 8px;
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
</style>
