<template>
  <div id="app">
    <div class="result-box">
      <VueDragSelect
        v-model="selectedList"
        value-key="name"
        :item-margin="[0, 10, 10, 0]"
        :warpper-padding="[20, 20, 20, 20]"
        ref="dragSelect"
      >
        <DragSelectOption
          v-for="(item, index) in dataList"
          :key="item.id"
          :value="item"
          :item-index="index"
        >
          <div class="item-self">
            {{ item.name }}
          </div>
        </DragSelectOption>
      </VueDragSelect>
    </div>
  </div>
</template>

<script>
import VueDragSelect from "./components/VueDragSelect.vue";
import DragSelectOption from "./components/DragSelectOption.vue";
import { ContextMenu } from "./utils";

export default {
  components: {
    VueDragSelect,
    DragSelectOption,
  },
  data() {
    return {
      mood: true,
      dataList: [],
      selectedList: [],
      id: 300,
      menuSinglton: null,
    };
  },
  created() {
    this.dataList = [];
    for (let i = 0; i <= 255; i++) {
      this.dataList.push({
        id: i,
        name: i,
      });
    }
    document.addEventListener("contextmenu", this.handleContextMenu);
    document.addEventListener("click", this.handleClick);
    this.initMenu();
  },
  watch: {
    mood() {
      clearTimeout(this.timeClick);
      this.timeClick = setTimeout(() => {
        this.$refs.dragSelect.elementLayout(200, 230);
      }, 500);
    },
  },

  methods: {
    insertItem() {
      const { id, name } = this.dataList.reduce((p, v) =>
        p.id < v.id ? v : p
      );
      this.dataList.splice(2, 0, {
        id: id + 1,
        name: name + 1,
        lip: true,
      });
    },
    handleContextMenu(e) {
      e.preventDefault();
      const menus = this.menuSinglton;
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
  },
};
</script>

<style lang="scss">
div::-webkit-scrollbar {
  display: none;
}

.result-box {
  width: 992px;
  max-height: 90vh;
  overflow: scroll;
  box-sizing: border-box;
  .vue-drag-select {
    background-color: #fff;
  }
  .item-self {
    width: 100%;
    height: 100%;
    border-radius: 4px;
    border: 1px solid #fff;
    transition: all 0.3s ease;
    overflow: hidden;
    background-color: lightblue;
    &:hover {
      box-shadow: 0 4px 10px #e8e8e8;
    }
    img {
      width: 100%;
    }
  }
  .selected-item {
    .item-self {
      border: 1px solid red;
      border-color: rgb(65, 98, 255);
      transform: scale(0.8);
    }
  }
}

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
