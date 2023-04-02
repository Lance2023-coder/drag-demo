<template>
  <div :class="['index-page', mood ? '' : 'bigger']">
    <div class="result-box">
      <vue-drag-select
        v-model="selectedList"
        value-key="name"
        :item-margin="[0, 10, 10, 0]"
        ref="dragSelect"
      >
        <drag-select-option v-for="(item, index) in dataList" :key="item.id" :value="item" :item-index="index">
          <div class="item-self">
            {{ item.name }}
          </div>
        </drag-select-option>
      </vue-drag-select>
    </div>
    <div class="chart-box">chart</div>
  </div>
</template>

<script>
import VueDragSelect from './VueDragSelect.vue';
import DragSelectOption from './DragSelectOption.vue';

export default {
  components: {
    VueDragSelect,
    DragSelectOption
  },
  data() {
    return {
      mood: true,
      dataList: [
        {
          id: 1
        },
        {
          id: 2
        },
        {
          id: 3
        }
      ],
      selectedList: [],
      id: 300
    };
  },
  created() {
    this.dataList = [];
    for (let i = 0; i <= 255; i++) {
      this.dataList.push({
        id: i,
        name: i
      });
    }
  },
  watch: {
    mood() {
      clearTimeout(this.timeClick);
      this.timeClick = setTimeout(() => {
        this.$refs.dragSelect.elementLayout(200, 230);
      }, 500);
    }
  },
  methods: {
    insertItem() {
      const { id, name } = this.dataList.reduce((p, v) =>
        p.id < v.id ? v : p
      );
      this.dataList.splice(2, 0, {
        id: id + 1,
        name: name + 1,
        lip: true
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.index-page {
  width: 100%;
  height: 100%;
  position: relative;
  transition: all 0.3s ease;
  .result-box {
    width: 100%;
    height: 70vh;
    transition: all 0.3s;
    .vue-drag-select {
      background-color: #ddd;
    }
    .item-self {
      width: 100%;
      height: 100%;
      border-radius: 4px;
      border: 1px solid #fff;
      background-color: #fff;
      transition: all 0.3s ease;
      overflow: hidden;
      &:hover {
        box-shadow: 0px 2px 20px -2px rgba(0, 0, 0, 0.5);
      }
      img {
        width: 100%;
      }
    }
    .selected-item {
      .item-self {
        border: 1px solid red;
        border-color: rgb(65, 98, 255);
        box-shadow: rgb(65, 98, 255) 0px 0px 0px 2px !important;
      }
    }
  }
  .chart-box {
    height: 100%;
    width: calc(100vw - 1008px);
    position: absolute;
    top: 0;
    right: 0;
    background-color: pink;
  }
}
.bigger {
  width: 100%;
  padding: 0 0 0 100px;
  .result-box {
    height: 600px;
  }
}
</style>
