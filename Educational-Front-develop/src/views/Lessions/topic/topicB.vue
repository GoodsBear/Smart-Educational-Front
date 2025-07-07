<template>
  <staff v-model:title-staff-name="titleStaffName" />
  <!-- <staff :titlestaffname1="titlestaffname1"></staff> -->
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import staff from "../../system/staff/staff2.vue"
const Name = defineModel('Name', {
  type: String,       // 类型验证
  default: '默认名称'  // 默认值
});
const titleStaffName = ref<string>("");
watch(titleStaffName, (newVal, oldVal) => {
  console.log('titleStaffName 变化:', newVal, oldVal);
  Name.value = newVal;
  // 执行自定义逻辑（如调用 API、更新其他状态等）
});

</script>

<style scoped></style>
