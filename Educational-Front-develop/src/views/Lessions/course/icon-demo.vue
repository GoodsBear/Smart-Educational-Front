<template>
  <div class="icon-demo">
    <h2>图标使用示例</h2>
    
    <!-- 方案一：使用CustomIcon组件 -->
    <div class="demo-section">
      <h3>方案一：CustomIcon组件</h3>
      <div class="icon-grid">
        <div v-for="icon in availableIcons.slice(0, 10)" :key="icon" class="icon-item">
          <CustomIcon :name="icon" :size="24" />
          <span>{{ icon }}</span>
        </div>
      </div>
    </div>

    <!-- 方案二：直接使用img标签 -->
    <div class="demo-section">
      <h3>方案二：直接使用img标签</h3>
      <div class="icon-grid">
        <div v-for="icon in availableIcons.slice(10, 20)" :key="icon" class="icon-item">
          <img :src="getIconUrl(icon)" :alt="icon" style="width: 24px; height: 24px;" />
          <span>{{ icon }}</span>
        </div>
      </div>
    </div>

    <!-- 方案三：在按钮中使用 -->
    <div class="demo-section">
      <h3>方案三：在按钮中使用</h3>
      <el-button type="primary">
        <CustomIcon name="user" :size="16" style="margin-right: 4px;" />
        用户管理
      </el-button>
      <el-button type="success">
        <CustomIcon name="setting" :size="16" style="margin-right: 4px;" />
        系统设置
      </el-button>
      <el-button type="warning">
        <CustomIcon name="menu" :size="16" style="margin-right: 4px;" />
        菜单管理
      </el-button>
    </div>

    <!-- 方案四：在表格中使用 -->
    <div class="demo-section">
      <h3>方案四：在表格中使用</h3>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="name" label="功能名称" />
        <el-table-column prop="icon" label="图标">
          <template #default="scope">
            <CustomIcon :name="scope.row.icon" :size="20" />
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" />
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAvailableIcons, getIconUrl } from '@/utils/icons'
import CustomIcon from '@/components/CustomIcon/index.vue'

const availableIcons = ref<string[]>([])

// 表格数据
const tableData = ref([
  { name: '用户管理', icon: 'user', description: '管理系统用户' },
  { name: '系统设置', icon: 'setting', description: '系统配置管理' },
  { name: '菜单管理', icon: 'menu', description: '菜单权限管理' },
  { name: '角色管理', icon: 'role', description: '角色权限管理' },
  { name: '文件管理', icon: 'file', description: '文件上传下载' }
])

onMounted(() => {
  availableIcons.value = getAvailableIcons()
  console.log('可用图标:', availableIcons.value)
})
</script>

<style scoped>
.icon-demo {
  padding: 20px;
}

.demo-section {
  margin-bottom: 30px;
}

.demo-section h3 {
  margin-bottom: 15px;
  color: #333;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
  text-align: center;
}

.icon-item span {
  margin-top: 5px;
  font-size: 12px;
  color: #666;
}
</style> 