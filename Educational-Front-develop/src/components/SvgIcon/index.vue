<template>
  <svg
    class="svg-icon"
    :width="width"
    :height="height"
    :aria-labelledby="iconName"
    role="presentation"
  >
    <title :id="iconName" lang="en">{{ iconName }} icon</title>
    <use :xlink:href="iconPath" />
  </svg>
</template>

<script>
export default {
  name: 'SvgIcon',
  props: {
    iconName: {
      type: String,
      required: true
    },
    width: {
      type: [Number, String],
      default: 18
    },
    height: {
      type: [Number, String],
      default: 18
    }
  },
  computed: {
    iconPath() {
      return `#icon-${this.iconName}`
    }
  }
}
</script>

<style scoped>
.svg-icon {
  display: inline-block;
  vertical-align: middle;
  fill: currentColor;
}
</style>