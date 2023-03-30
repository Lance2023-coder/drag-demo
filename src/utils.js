/*
 * @Author: zhuotuo
 * @Date: 2023-03-30 08:44:27
 * @LastEditors: zhuotuo
 * @LastEditTime: 2023-03-30 11:06:32
 * @Description: 
 */
export const getValueByPath = function(object, prop) {
  prop = prop || '';
  const paths = prop.split('.');
  let current = object;
  let result = null;
  for (let i = 0, j = paths.length; i < j; i++) {
    const path = paths[i];
    if (!current) break;

    if (i === j - 1) {
      result = current[path];
      break;
    }
    current = current[path];
  }
  return result;
};


export const initRequestAnimationFrame = function () {
  var lastTime = 0;
  var vendors = ['webkit', 'moz'];
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||    // Webkit中此取消方法的名字变了
      window[vendors[x] + 'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (callback) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
      var id = window.setTimeout(function () {
        callback(currTime + timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function (id) {
      clearTimeout(id);
    };
  }
}

export const ContextMenu = function (options) {
  // 唯一实例
  let instance;

  // 创建实例方法
  function createMenu() {
    const ul = document.createElement("ul");
    ul.classList.add("custom-context-menu");
    const { menus } = options;
    if (menus && menus.length > 0) {
      for (let menu of menus) {
        const li = document.createElement("li");
        li.textContent = menu.name;
        li.onclick = menu.onClick;
        ul.appendChild(li);
      }
    }
    const body = document.querySelector("body");
    body.appendChild(ul);
    return ul;
  }

  return {
    // 获取实例的唯一方式
    getInstance: function () {
      if (!instance) {
        instance = createMenu();
      }
      return instance;
    },
  };
}