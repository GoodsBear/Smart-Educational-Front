<template>
    <div class="position-management">
        <!-- 搜索栏 -->
        <el-card style="max-width: 10000px">
            <div class="search-bar">
                <el-form :inline="true" :model="queryParams">
                    <el-form-item label="搜索名称：">
                        <el-input v-model="queryParams.PositionName" placeholder="请输入" clearable />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="fetchPositionList">查询</el-button>
                    </el-form-item>
                </el-form>

            </div>
        </el-card>
        <el-card style="max-width: 10000px;margin-top: 10px">
            <!-- 表格标题和操作按钮区 -->
            <div class="table-header-bar">
                <div class="table-title">职位列表</div>
                <div class="operation-area">
                    <el-button type="primary" @click="showAddDialog">新增</el-button>
                    <el-button @click="handleDelete">删除</el-button>
                    <el-button @click="fetchPositionList">刷新</el-button>
                    <el-button @click="showColumnDialog = true">自定义显示列</el-button>
                </div>
            </div>
            <!-- 职位列表表格 -->
            <!-- <el-table :data="positionList" border style="width: 100%; margin-top: 10px"
            header-cell-class-name="table-header" @selection-change="selectAll"> -->
            <el-table ref="tableRef" :data="positionList" style="width: 100%" @selection-change="selectAll">
                <el-table-column type="selection" width="50" />
                <el-table-column v-for="col in showColumns" :key="col.prop" :prop="col.prop" :label="col.label" />
                <el-table-column label="操作" width="180">
                    <template #default="{ row }">
                        <el-button type="text" @click="showEditDialog(row)">编辑</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页 -->
            <div class="pagination-container">
                <pagination v-model:total="pageParams.TotalCount" v-model:page="pageParams.PageIndex"
                    v-model:limit="pageParams.PageSize" @pagination="handlePagination" />
                <!-- <div class="pagination-info">
                共 {{ pageParams.TotalCount }} 条 第{{ pageParams.PageIndex }}页/{{ pageParams.TotalPage }}页
            </div> -->
            </div>
        </el-card>

        <!-- 新增/编辑对话框 -->
        <el-dialog v-model="dialogVisible" :title="dialogTitle" width="30%" @closed="resetForm">
            <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
                <el-form-item label="职位名称" prop="positionName">
                    <el-input v-model="formData.positionName" placeholder="请输入岗位名称" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitForm">确认</el-button>
                </span>
            </template>
        </el-dialog>
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
import PositionAPI from "@/api/Organization/position.api";

// 查询参数
const queryParams = reactive({
    PositionName: "",
});
const pageParams = reactive({
    PageIndex: 1,
    PageSize: 10,
    TotalCount: 0,
    TotalPage: 0
});

// 数据状态
const positionList = ref<any[]>([]);
const dialogVisible = ref(false);
const dialogTitle = ref("新增职位");
const formRef = ref<FormInstance>();
const isAdd = ref(true);
// 表单数据
const formData = reactive({
    id: "",
    positionName: "",
});
//数据验证
const rules: FormRules = {
    positionName: [{ required: true, message: "请输入职位名称", trigger: "blur" }],
};
// 新增弹出框
function showAddDialog() {
    isAdd.value = true;
    dialogTitle.value = "新增职位";
    resetForm();
    dialogVisible.value = true;
}
// 编辑弹出框
function showEditDialog(row: any) {
    isAdd.value = false;
    formData.id = row.id;
    console.log("row=>", row);
    dialogTitle.value = "编辑职位";
    Object.assign(formData, row);
    dialogVisible.value = true;

}
//全选 全部选
const Ids = ref([]);
const selectAll = (id: any) => {
    Ids.value = id.map((item: any) => (item.id));
    console.log("ids=>", Ids.value);
}
// 批量删除
const handleDelete = () => {
    if (!Ids.value.length) {
        ElMessage.warning("请先选择要删除的职位！");
        return;
    }
    ElMessageBox.confirm(
        '确认删除吗?',
        'Warning',
        {
            confirmButtonText: '确认',
            cancelButtonText: ' 取消',
            type: 'warning',
        }
    )
        .then(() => {
            const params = {
                ids: Ids.value,
            };
            PositionAPI.batchDeletePosition(params).then((res) => {
                console.log("职位批量删除=>", res);
                ElMessage.success("删除成功");
                fetchPositionList();
            });
            // const res = await PositionAPI.batchDeletePosition(params);
            // console.log("职位批量删除=>", res);
            // if (res) {
            //     ElMessage.success("删除成功");
            //     fetchPositionList();
            // }

        })
        .catch(() => {
            ElMessage({
                type: 'info',
                message: '删除已取消',
            })
        })
}
// 重置表单
const resetForm = () => {
    formData.positionName = "";
}
//添加修改
const submitForm = () => {
    (formRef.value as FormInstance).validate((valid) => {
        if (valid) {
            if (isAdd.value) {
                PositionAPI.createPosition(formData).then((res) => {
                    console.log("职位添加=>", res);
                    ElMessage.success("添加成功");
                    dialogVisible.value = false;
                    fetchPositionList();
                });
            } else {
                PositionAPI.updatePosition(formData.id, formData).then((res) => {
                    console.log("职位修改=>", res);
                    ElMessage.success("修改成功");
                    dialogVisible.value = false;
                    fetchPositionList();
                });
            }
            dialogVisible.value = false;
            fetchPositionList();
        }
    });
}
//列表
const fetchPositionList = () => {
    const params = { PageIndex: pageParams.PageIndex, PageSize: pageParams.PageSize, PositionName: queryParams.PositionName }
    PositionAPI.getPositionList(params).then((res) => {
        console.log("职位列表=>", res);
        positionList.value = res.data;
        //positionList.value = Array.isArray(res.data.data) ? res.data.data : [];
        pageParams.TotalCount = res.totleCount;
        pageParams.TotalPage = res.totlePage;
    });
}
// 自定义显示列相关
const showColumnDialog = ref(false);
const allColumns = ref([
    { label: "职位名称", prop: "positionName" },
]);
const checkedProps = ref(allColumns.value.map(col => col.prop));
const resetColumns = () => {
    checkedProps.value = allColumns.value.map(col => col.prop);
};
const showColumns = computed(() =>
    allColumns.value.filter(col => checkedProps.value.includes(col.prop))
);

// 分页
const handlePagination = ({ page, limit }: { page: number; limit: number }) => {
    pageParams.PageIndex = page;
    pageParams.PageSize = limit;
    fetchPositionList();
};
// // 查询（重置页码后获取数据）
// function handleQuery() {
//     pageParams.PageIndex = 1;
//     fetchPositionList();
// }
onMounted(() => {
    fetchPositionList();
});
</script>

<style scoped>
.position-management {
    padding: 24px;
    background: #fafafa;
    min-height: 100vh;
}

.tabs-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
}

.tab {
    padding: 4px 16px;
    background: #f4f6fa;
    border-radius: 4px 4px 0 0;
    color: #888;
    font-size: 16px;
}

.tab.active {
    background: #409eff;
    color: #fff;
}

.search-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
}

.search-bar-right {
    display: flex;
    gap: 8px;
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

.pagination {
    margin-top: 16px;
    text-align: left;
}
</style>
