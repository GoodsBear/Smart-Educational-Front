<template>
  <div>
    <header class="app-header" @click="OrganizationPage"> 组织机构：</header>
    <ElTree ref="treeRef" style="max-width: 600px;float:left" class="filter-tree" :data="data" :props="defaultProps"
      default-expand-all :filter-node-method="filterNode" @node-click="nodeClick" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, type TreeInstance } from 'element-plus'
import { getOrganizationTree } from "../../../api/Organization/organization.api";//@/api/organization/organization.api
// 局部引入（组件内）
import { ElTree } from 'element-plus';
import { useRouter } from 'vue-router'
const router = useRouter()
const data = ref([])
const treeRef = ref<TreeInstance>()
onMounted(() => {
  getOrganizationTreelist();
})
const defaultProps = {
  children: 'children', // 子节点字段名
  label: 'label',       // 显示文本字段名
}
const getOrganizationTreelist = () => {
  try {
    getOrganizationTree("00000000-0000-0000-0000-000000000000").then(response => {
      if (response) {
        //  debugger;
        data.value = response || []
        console.log('获取组织机构树形成功code:', response
        )
      }
    })
  } catch (error) {
    console.error(error);
  }
}
const filterNode = (value: string, data: any) => {
  if (!value) return true
  return data.label.includes(value)
}
//树形点击事件
const nodeClick = (data: any) => {
  console.log(data)
  // ElMessage.success("点击的组织主键为" + data.id);
  //传递给表
  TreeOrganizationId.value = data.id;
}
const TreeOrganizationId = defineModel('TreeOrganizationId', {
  type: String,       // 类型验证
  default: ''  // 默认值
});
//传的表
// const TreeOrganizationId = ref<string>("");
// watch(TreeOrganizationId, (newVal, oldVal) => {
//   console.log('titleStaffName 变化:', newVal, oldVal);
//   需要的传的值 = newVal;
//   getSalary();
//   // 执行自定义逻辑（如调用 API、更新其他状态等）
// });

//跳转组织页面
const OrganizationPage = () => {
  router.push('/tissue/organization')
}
</script>

<style scoped>
.app-header {
  background-color: #a4a6aa;
  padding: 1rem 0;
  text-align: center;
  /* 文本居中 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 1.25rem;
  /* 增大基础字体大小 */
}
</style>
