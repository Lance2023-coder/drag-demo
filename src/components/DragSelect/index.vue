<template>
  <div :class="['index-page', mood ? '' : 'bigger']">
    <div class="result-box">
      <vue-drag-select
        v-model="selectedList"
        :selectedDOMList.sync="selectedDOMList"
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
import { ContextMenu } from "./utils";

export default {
  components: {
    VueDragSelect,
    DragSelectOption
  },
  data() {
    return {
      mood: true,
      dataList: [],
      selectedList: [],
      selectedDOMList: [],
      id: 300,
      menuSinglton: null,
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
    document.addEventListener("contextmenu", this.handleContextMenu);
    document.addEventListener("click", this.handleClick);
    this.initMenu();
  },
  methods: {
    handleContextMenu(e) {
      e.preventDefault();
      let flag = false
      this.selectedDOMList.forEach(dom => {
        if (dom.contains(e.target)) {
          flag = true
        }
      })
      const menus = this.menuSinglton;
      if (!flag) {
        this.selectedList = []
        this.selectedDOMList = []
        menus.classList.add("hidden");
        return
      }
      menus.style.top = `${e.clientY - 15}px`;
      menus.style.left = `${e.clientX}px`;
      menus.classList.remove("hidden");
    },
    handleClick() {
      const menus = this.menuSinglton;
      menus.classList.add("hidden");
    },
    initMenu() {
      const that = this;
      const menuSinglton = ContextMenu({
        menus: [
          {
            name: "查看选中项",
            onClick: function (e) {
              alert(
                `选中了${JSON.stringify(
                  that.selectedList
                    .map((item) => {
                      return item.name;
                    })
                    .join("、")
                )}`
              );
            },
          },
        ],
      });

      this.menuSinglton = menuSinglton.getInstance();
    },
  },
  beforeDestroy() {
    document.removeEventListener("contextmenu", this.handleContextMenu);
    document.removeEventListener("click", this.handleClick);
  },
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
      /* .item-self {
        border: 1px solid red;
        border-color: rgb(65, 98, 255);
        box-shadow: rgb(65, 98, 255) 0px 0px 0px 2px !important;
      } */
      .item-self {
        border: 1px solid red;
        border-color: rgb(65, 98, 255);
        transform: scale(0.8);
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

<style lang="scss">
.custom-context-menu {
  position: fixed;
  z-index: 9999;
  border: 1px solid #ccc;
  list-style: none;
  padding: 0;
  border-radius: 4px;
  overflow: hidden;

  &.hidden {
    display: none;
  }

  li {
    padding: 8px 12px;
    border-bottom: 1px solid #f0f2f5;
    user-select: none;
    transition: all 0.1s;
    background-color: #fff;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      cursor: pointer;
      background-color: #0170fe;
      color: #fff;
    }

    &:active {
      background-color: #f0f2f7;
    }
  }
}
</style>
