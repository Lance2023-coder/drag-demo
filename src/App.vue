<template>
  <div class="app">
    <div class="drag-select-wrapper">
      <DragSelect />
    </div>
  </div>
</template>

<script>
import DragSelect from './components/DragSelect/index.vue'

export default {
  components: {
    DragSelect
  }
}
</script>

<style lang="scss" scoped>
.drag-select-wrapper {
  margin-top: 100px;
}
</style>
