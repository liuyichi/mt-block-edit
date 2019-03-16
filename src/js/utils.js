/**
 * 通用方法
 */
function isString(arg) {
  return typeof arg === 'string';
}

function isObject(arg) {
  const type = typeof arg;
  return !!arg && (type === 'object' || type === 'function');
}

function isArray(arg) {
  return Object.prototype.toString.call(arg) === '[object Array]';
}

function isFunction(arg) {
  return isObject(arg) && Object.prototype.toString.call(arg) === '[object Function]';
}

function isEmpty(arg) {
  // TODO: 扩展
  return arg == null;
}

function isElement(arg) {
  // 是否是DOM元素结点
  return isObject(arg) && arg.nodeType === Node.ELEMENT_NODE;
}

/**
 * 去除字符串模板编写的html片段的空白符
 * 避免inline-block之间产生间距
 * @param html
 */
function purifyHtmlFragment(html) {
  return html.replace(/[\s]+(?=<)/g, '');
}

/**
 * 首字母大写
 * @param str
 * @returns {string}
 */
function capitalizeFirstLetter(str) {
  return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
}

/**
 * rgba转hex
 * @param {*} rgb
 */
function rgbToHex(rgb) {
  const result = /^rgba?\((\d+), ?(\d+), ?(\d+)(, ?(\d+))?\)$/.exec(rgb);
  if (result) {
    const [, r, g, b] = result;
    return `#${[r, g, b].map(c => Number(c).toString(16)).join('')}`;
  }
  return null;
}

/**
 * 只支持单元素创建
 * @param selector
 * @param parent
 * @constructor
 */
function DOMElement(selector, parent = document) {
  if (isString(selector) && selector.length > 0) {
    // 如果是<div>[^<]*</div>或者<img />这种形式
    const result = /^<([0-9a-zA-Z]+)(>[^<]*<\/\1>|.*\/>)/.exec(selector);
    if (result) {
      if (['style'].includes(result[1])) {
        // style等标签会被DOMParser跳过
        const div = document.createElement('div');
        div.innerHTML = selector;
        this.node = div.children[0];
      } else {
        // 不使用innerHTML方法是因为DOMParser不会产生对img等资源的请求
        const parser = new DOMParser();
        const doc = parser.parseFromString(selector, 'text/html');
        this.node = doc.body.children[0];
      }
    } else {
      // 如果是#id, .class的选择器
      this.node = (parent || document).querySelector(selector);
    }
  } else if (isElement(selector)) {
    this.node = selector;
  }
}
DOMElement.prototype = {
  constructor: DOMElement,
  addClass(className) {
    this.node.classList.add(className);
    return this;
  },
  removeClass(className) {
    this.node.classList.remove(className);
    return this;
  },
  toggleClass(className) {
    this.node.classList.toggle(className);
    return this;
  },
  containsClass(className) {
    return this.node.classList.contains(className);
  },
  select(selector) {
    return new DOMElement(selector, this.node);
  },
  selectAll(selector) {
    return Array.from(this.node.querySelectorAll(selector))
      .map(item => new DOMElement(item));
  },
  attr(k, v) {
    if (v === undefined) {
      return this.node.getAttribute(k);
    }
    this.node.setAttribute(k, v);
    return this;
  },
  css(k, v) {
    if (v === undefined) {
      return window.getComputedStyle(this.node).getPropertyValue(k);
    }
    this.node.style[k] = v;
    return this;
  },
  html(v) {
    if (v === undefined) {
      return this.node.innerHTML;
    }
    this.node.innerHTML = v;
    return this;
  },
  val(v) {
    if (v === undefined) {
      return this.node.value;
    }
    this.node.value = v;
    return this;
  },
  firstChild() {
    return new DOMElement(this.node.firstElementChild);
  },
  lastChild() {
    return new DOMElement(this.node.lastElementChild);
  },
  contains(node) {
    return this.node.contains(node);
  },
  appendChild(nodeOrElement) {
    let node = nodeOrElement;
    if (nodeOrElement instanceof DOMElement) {
      node = nodeOrElement.node;
    }
    this.node.appendChild(node);
    return node;
  },
  removeChild(nodeOrElement) {
    let node = nodeOrElement;
    if (nodeOrElement instanceof DOMElement) {
      node = nodeOrElement.node;
    }
    this.node.removeChild(node);
    return node;
  },
  on(type, fn) {
    this.node.addEventListener(type, fn);
  },
  off(type, fn) {
    this.node.removeEventListener(type, fn);
  },
  focus() {
    this.node.focus();
  },
  click() {
    this.node.click();
  },
};

function $(selector, parent) {
  return new DOMElement(selector, parent);
}
$.DOMElement = DOMElement;

export default {
  Type: {
    isString,
    isObject,
    isArray,
    isFunction,
    isEmpty,
    isElement,
  },
  $,
  Methods: {
    purifyHtmlFragment,
    capitalizeFirstLetter,
    rgbToHex,
  },
};
