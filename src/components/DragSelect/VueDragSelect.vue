<template>
  <div class="vue-drag-select" ref="vueDragSelect">
    <div class="select-wrapper" @mousedown="onMouseDown" :style="wrapperStyle">
      <slot></slot>
      <div v-show="mouseDown" class="vue-drag-select-box" :style="selectionBoxStyling"></div>
    </div>
  </div>
</template>

<script>
import { initRequestAnimationFrame, getValueByPath } from './utils'

export default {
  name: "vueDragSelect",
  props: {
    value: {
      type: Array,
      default: function() {
        return [];
      }
    },
    valueKey: {
      type: String,
      default: "value"
    },
    itemWidth: {
      type: Number,
      default: 50
    },
    itemHeight: {
      type: Number,
      default: 50
    },
    itemMargin: {
      type: Array,
      default() {
        return [20,20,20,20]
      },
      validator(val) {
        return [1,2,3,4].includes(val.length)
      }
    },
    warpperPadding: {
      type: Array,
      default() {
        return [20,20,20,20]
      },
      validator(val) {
        return [1,2,3,4].includes(val.length)
      }
    },
    // 自动滚动速度 慢速模式
    slowSpeed: {
      type: Number,
      default: 0
    },
    // 自动滚动速度 快速模式
    fastSpeed: {
      type: Number,
      default: 20
    },
    selectedDOMList: {
      type: Array,
      default() {
        return []
      }
    }
  },
  provide() {
    return {
      vueDragSelect: this
    };
  },
  data() {
    return {
      clientRect: null,
      // 子元素
      options: [],
      // 元素容器最小高度
      minHeight: 100,
      // 鼠标按下状态
      mouseDown: false,
      // 起始点
      startPoint: null,
      // 结束点
      endPoint: null,
      // 最终计算 结束点
      lastEndPoint: null,
      // 滚动状态
      scrollIng: false,
      // 自动滚动计时器
      autoScrollTimer: null,
      // 滚动方向 true 向下 false 向上
      scrollDirection: true,
      // 选框最终数据
      selectionBox: {
        left: 0,
        top: 0,
        width: 0,
        height: 0
      },
      // 选框最终样式
      selectionBoxStyling: {
        left: "0px",
        top: "0px",
        width: "0px",
        height: "0px",
        borderWidth: "0px"
      },
      // 按键状态
      shiftKeyDown: false,
      scrollSpeedSlow: Math.min(this.slowSpeed, this.fastSpeed),
      scrollSpeedFast: Math.max(this.slowSpeed, this.fastSpeed),
      scrollSpeed: Math.min(this.slowSpeed, this.fastSpeed),
      // 滚动触发，速度基数 暂不对开发者暴露，一般无需改动
      triggerDistance: 10
    };
  },
  mounted() {
    initRequestAnimationFrame()
    this.clientRect = this.$el.getBoundingClientRect();
    this.elementLayout();
    this.detectKey();
  },
  computed: {
    currentValue: {
      get: function() {
        return this.value;
      },
      set: function(val) {
        this.$emit("input", val);
      }
    },
    wrapperStyle() {
      const padding = this.warpperPadding.map(item => item + 'px').join(' ')
      return {
        minHeight: `${this.minHeight}px`,
        padding
      }
    }
  },
  methods: {
    boxAutoScroll() {
      this.scrollIng = true;
      this.autoScrollTimer = window.requestAnimationFrame(this.scrollFn);
    },
    scrollFn() {
      if (!this.mouseDown) {
        this.scrollIng = false;
        return;
      }
      if (this.scrollDirection) {
        if (
          this.$el.scrollTop + this.$el.offsetHeight >=
          this.minHeight
        ) {
          this.scrollIng = false;
          return;
        } else {
          this.$el.scrollTop += this.scrollSpeed;
        }
      } else {
        if (this.$el.scrollTop <= 0) {
          this.scrollIng = false;
          return;
        } else {
          this.$el.scrollTop -= this.scrollSpeed;
        }
      }
      cancelAnimationFrame(this.autoScrollTimer);
      this.computeLastEndPoint();
      this.autoScrollTimer = window.requestAnimationFrame(this.scrollFn)
    },
    computeLastEndPoint() {
      if (!this.mouseDown || !this.startPoint || !this.endPoint) return;
      const clientRect = this.clientRect;
      this.lastEndPoint = {
        x: this.endPoint.x - clientRect.left,
        y: this.endPoint.y - clientRect.top + this.$el.scrollTop
      };
      // 选择框属性计算
      const left = Math.min(this.startPoint.x, this.lastEndPoint.x);
      const top = Math.min(this.startPoint.y, this.lastEndPoint.y);
      const width = Math.abs(this.startPoint.x - this.lastEndPoint.x);
      const height = Math.abs(this.startPoint.y - this.lastEndPoint.y);
      this.selectionBox = {
        left,
        top,
        width,
        height
      };
      this.selectionBoxStyling = {
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`
      };
    },
    onMouseDown(event) {
      // 阻止捕获到item
      if (event.target.className !== "select-wrapper") return;
      // 忽略右键点击
      if (event.button === 2) return;
      const clientRect = this.clientRect;
      // 注册开始点
      this.mouseDown = true;
      this.startPoint = {
        x: event.pageX - clientRect.left,
        y: event.pageY - clientRect.top + this.$el.scrollTop
      };
      // 开始监听鼠标 移动，抬起 事件
      window.addEventListener("mousemove", this.onMouseMove);
      window.addEventListener("mouseup", this.onMouseUp);
    },
    onMouseMove(event) {
      if (!this.mouseDown) return;
      // 容器参数
      const clientRect = this.clientRect;
      // 外容器底部到client顶部的距离
      const clientBottom = clientRect.top + clientRect.height;
      // 滚动启动、速度 常数值
      const triggerDistance = this.triggerDistance
      // 容器顶部往下 triggerDistance px
      const clientTopDown = clientRect.top + triggerDistance
      // 容器底部往上 triggerDistance px
      const clientBottomUp = clientBottom - triggerDistance
      // 滚动方向
      if (event.pageY > clientBottomUp) {
        this.scrollDirection = true;
      }
      if (event.pageY < clientTopDown) {
        this.scrollDirection = false;
      }
      // 判断是否开启滚动
      if (event.pageY > clientTopDown && event.pageY < clientBottomUp) {
        // 中间区域 停止滚动
        cancelAnimationFrame(this.autoScrollTimer);
        this.scrollIng = false;
      } else {
        // 开启滚动
        // 在停止滚动状态 和 开启滚动区域
        const canScroll = (this.scrollDirection && this.$el.scrollTop + clientRect.height < this.minHeight) || (!this.scrollDirection && this.$el.scrollTop > 0)
        if (!this.scrollIng && canScroll) {
          this.boxAutoScroll();
        }
      }
      // 计算滚动速度
      let scrollSpeed = this.scrollSpeed;
      const speedDiff = this.scrollSpeedFast - this.scrollSpeedSlow;
      if (event.pageY <= clientTopDown) {
        if (event.pageY > clientRect.top) {
          const percent = 1- ((event.pageY - clientRect.top) / triggerDistance);
          scrollSpeed = this.scrollSpeedSlow + (percent * speedDiff);
        } else {
          scrollSpeed = this.scrollSpeedFast;
        }
      }
      if (event.pageY >= clientBottomUp) {
        if (event.pageY < clientBottom) {
          const percent = 1 - ((clientBottom - event.pageY) / triggerDistance);
          scrollSpeed = this.scrollSpeedSlow + (percent * speedDiff);
        } else {
          scrollSpeed = this.scrollSpeedFast;
        }
      }
      if (this.scrollSpeed > this.scrollSpeedFast) this.scrollSpeed = this.scrollSpeedFast;
      this.scrollSpeed = scrollSpeed;
      this.endPoint = {
        x: event.pageX,
        y: event.pageY
      };
      if (!this.scrollIng) {
        this.computeLastEndPoint();
      }
    },
    onMouseUp() {
      // 清除事件
      window.removeEventListener("mousemove", this.onMouseMove);
      window.removeEventListener("mouseup", this.onMouseUp);
      // 重置状态
      this.mouseDown = false;
      this.computeSelectedItems();
      this.startPoint = null;
      this.endPoint = null;
      this.lastEndPoint = null;
      // 可能下一次跟上一次反方向 在方向还没调整对之前，防止抖动一下
      this.scrollSpeed = 0;
      // 去除选框样式 隐藏选框
      this.selectionBoxStyling = {
        left: "0px",
        top: "0px",
        width: "0px",
        height: "0px",
        borderWidth: "0px"
      };
    },
    computeSelectedItems() {
      const self = this;
      if (!this.shiftKeyDown) {
        this.currentValue = [];
        this.resetDOM()
      }
      this.$nextTick(() => {
        this.options.forEach((item, index) => {
          const itemStyle = item.getItemStyle();
          const isChecked =
            self.selectionBox.left <= itemStyle.left + itemStyle.width &&
            self.selectionBox.left + self.selectionBox.width >=
              itemStyle.left &&
            self.selectionBox.top <= itemStyle.top + itemStyle.height &&
            self.selectionBox.top + self.selectionBox.height >= itemStyle.top;
          if (isChecked) {
            const optionIndex = self.currentValue.indexOf(item.value);
            if (optionIndex > -1) {
              self.currentValue.splice(optionIndex, 1);
              this.removeDOM(optionIndex)
            } else {
              self.currentValue.push(item.value);
              this.addDOM(item)
            }
          }
        });
        // 计算完选中元素时 再对选框大小位置数据置零初始化
        self.selectionBox = {
          left: 0,
          top: 0,
          width: 0,
          height: 0
        };
      });
    },
    clickSelect(target) {
      const self = this;
      const targeValue = target.value;
      const targetIndex = target.itemIndex;

      // 原逻辑
      // if (!self.shiftKeyDown) {
        // self.currentValue = [];
        // self.$nextTick(() => {
        //   self.currentValue.push(targeValue);
        // });
      // } else {
        // if (target.itemSelected) {
        //   const index = self.getIndex(self.currentValue, targeValue)
        //   self.currentValue.splice(index, 1);
        // } else {
        //   self.currentValue.push(targeValue);
        // }
      //}

      if (!self.shiftKeyDown) {
        const index = self.getIndex(self.currentValue, targeValue)
        self.currentValue = [];
        this.resetDOM()
        self.$nextTick(() => {
          if (index >= 0) {
            self.currentValue.splice(index, 1);
            this.removeDOM(index)
          } else {
            self.currentValue.push(targeValue);
            this.addDOM(target)
          }
        });
      } else {
        const index = self.getIndex(self.currentValue, targeValue)
        self.$nextTick(() => {
          if (index >= 0) {
            self.currentValue.splice(index, 1);
            this.removeDOM(index)
          } else {
            self.currentValue.push(targeValue);
            this.addDOM(target)
          }
        });
      }
    },
    // 监听按键
    detectKey() {
      const isWin = navigator.userAgent.indexOf("Window") > 0;
      const isMac = navigator.userAgent.indexOf("Mac OS X") > 0;
      const self = this;
      // 按  Shift_L  Control_L  command
      window.onkeydown = function(event) {
        const e = event || window.event;
        if (e && e.keyCode === 16) {
          self.shiftKeyDown = true;
        }
      };
      // 放 Shift_L  Control_L  command
      window.onkeyup = function(event) {
        const e = event || window.event;
        if (e && e.keyCode === 16) {
          self.shiftKeyDown = false;
        }
      };
    },
    // 获取某一个选项在元数据的索引
    getIndex(arr = [], val) {
      const isObject =
        Object.prototype.toString.call(val).toLowerCase() === "[object object]";
      const valueKey = this.valueKey;
      return arr.findIndex(item => {
        if (isObject) {
          return (
            getValueByPath(item, valueKey) ===
            getValueByPath(val, valueKey)
          );
        } else {
          return item === val;
        }
      });
    },
    // 布局函数
    elementLayout() {
      const marLength = this.itemMargin.length
      let addWidth, addHeight, transX, transY, wrapperPaddingY
      if (marLength === 1) {
        addWidth = this.itemMargin[0] * 2
        addHeight = this.itemMargin[0] * 2
      } else if (marLength === 2) {
        addWidth = this.itemMargin[1] * 2
        addHeight = this.itemMargin[0] * 2
      } else if (marLength === 3) {
        addWidth = this.itemMargin[1] * 2
        addHeight = this.itemMargin[0] + this.itemMargin[2]
      } else if (marLength === 4) {
        addWidth = this.itemMargin[1] + this.itemMargin[3]
        addHeight = this.itemMargin[0] + this.itemMargin[2]
      }
      // 元素位置偏移量计算
      const wrapLength = this.warpperPadding.length
      if (wrapLength === 1) {
        transX = this.warpperPadding[0]
        transY = this.warpperPadding[0]
        wrapperPaddingY = this.warpperPadding[0] * 2
      } else if (wrapLength === 2) {
        transX = this.warpperPadding[1]
        transY = this.warpperPadding[0]
        wrapperPaddingY = this.warpperPadding[0] * 2
      } else if (wrapLength === 3) {
        transX = this.warpperPadding[1]
        transY = this.warpperPadding[0]
        wrapperPaddingY = this.warpperPadding[0] + this.warpperPadding[2]
      } else if (wrapLength === 4) {
        transX = this.warpperPadding[3]
        transY = this.warpperPadding[0]
        wrapperPaddingY = this.warpperPadding[0] + this.warpperPadding[2]
      }
      addWidth = parseInt(addWidth)
      addHeight = parseInt(addHeight)
      const itemWidth = this.itemWidth + addWidth
      const itemHeight = this.itemHeight + addHeight
      // 容器宽度
      const boxWidth = this.$refs.vueDragSelect.offsetWidth;
      // 一行几个
      // const colCount = parseInt(boxWidth / itemWidth);
      const colCount = 16
      // 行基数
      let vtSite = 0;
      this.options.forEach((item, index) => {
        // 换行
        if (index && !(index % colCount)) {
          vtSite += 1;
        }
        item.$refs.vueDragSelectOption.style.top = `${vtSite * itemHeight + transY}px`;
        item.$refs.vueDragSelectOption.style.left = `${(index % colCount) *
          itemWidth + transX}px`;
      });
      // 解决撑起容器
      this.minHeight = (vtSite + 1) * itemHeight + wrapperPaddingY;
    },
    // 销毁残留item
    onOptionDestroy(index) {
      if (index > -1) {
        this.options.splice(index, 1);
      }
    },
    addDOM(item) {
      this.selectedDOMList.push(item.$slots.default[0].elm)
      this.$emit('update:selectedDOMList', this.selectedDOMList)
    },
    removeDOM(index) {
      this.selectedDOMList.splice(index, 1)
      this.$emit('update:selectedDOMList', this.selectedDOMList)
    },
    resetDOM() {
      this.$emit('update:selectedDOMList', [])
    }
  },
  beforeDestroy() {
    // 移除监听事件
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("mouseup", this.onMouseUp);
  },
  updated() {
    this.$nextTick(() => {
      this.clientRect = this.$el.getBoundingClientRect();
    })
    this.$nextTick(() => {
      // 源数据发生变化，通知到更新后，先进性排序，在进行重绘
      // Todo: 有性能问题，后期重新改写
      this.options.sort((item1, item2) => {
        return item1.itemIndex - item2.itemIndex;
      });
      this.elementLayout();
    });
  }
};
</script>

<style lang="scss" scoped>
.vue-drag-select {
  width: 100%;
  height: 100%;
  position: relative;
  user-select: none;
  overflow: hidden;
  overflow-y: visible;
  transform: translate3d(0, 0, 0);
  .select-wrapper {
    position: relative;
    user-select: none;
    padding-left: 10px;
    min-width: 100%;
    min-height: 100%;
  }
  .vue-drag-select-option {
    transition: all 0.6s ease;
    position: absolute;
  }
}
.vue-drag-select-box {
  position: absolute;
  background: rgba(0, 162, 255, 0.4);
  z-index: 10;
  border: 1px dotted rgb(0, 162, 255);
  transform: translate3d(0, 0, 0);
}
</style>