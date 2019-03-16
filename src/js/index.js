import 'normalize.css';
import DefaultOptions from './default-options';
import Widget from './widget';
import Modifier from './common/Modifier';
import U from './utils';
import CONSTANTS from './constants';

import IFrameStyle from '../css/iframe-style';

import '../font/style.css';
import '../css/index.scss';

/**
 * 编辑器的构造函数
 * TODO 转换为ES6写法
 * @constructor
 */
function Editor(options) {
  const self = this;
  // 编辑器自身的属性
  const initOptions = { ...DefaultOptions, ...options };
  const basePrefix = `${initOptions.prefixCls}-editor`;
  let instance = null;
  let window = null;
  let placeholder = null;
  let showPlaceholder = false;
  Object.defineProperties(this, {
    basePrefix: {
      get() {
        return basePrefix;
      },
    },
    // 选项，配置界面功能
    options: {
      get() {
        return initOptions;
      },
    },
    // 编辑器 DOM对象
    instance: {
      get() {
        return instance;
      },
      set(v) {
        instance = v;
        // 赋值操作只能被调用一次
        Object.defineProperty(self, 'instance', {
          set: undefined,
          configurable: false,
        });
      },
      configurable: true,
    },
    // 窗口 DOM对象，.document可获取文档对象
    window: {
      get() {
        return window;
      },
      set(v) {
        window = v;
        // 赋值操作只能被调用一次
        Object.defineProperty(self, 'window', {
          set: undefined,
          configurable: false,
        });
      },
      configurable: true,
    },
    // placeholder DOM对象
    placeholder: {
      get() {
        return placeholder;
      },
      set(v) {
        placeholder = v;
        // 赋值操作只能被调用一次
        Object.defineProperty(self, 'placeholder', {
          set: undefined,
          configurable: false,
        });
      },
      configurable: true,
    },
    // 是否显示 placeholder
    showPlaceholder: {
      set(v) {
        showPlaceholder = v;
        if (self.placeholder) {
          if (v) {
            self.placeholder.removeClass('hide');
          } else {
            self.placeholder.addClass('hide');
          }
        }
      },
      get() {
        return showPlaceholder;
      },
    },
    // 修饰器实例
    modifier: {
      value: {},
    },
    // 事件监听器
    event: {
      value: {},
    },
  });
  // 默认触发change
  this.triggerChange = true;
  // 初始化
  this.init();
}

Editor.prototype = {
  constructor: Editor,
  // 初始化操作
  /**
   * 初始化编辑器
   */
  init() {
    const { wrapper, content, placeholder } = this.options;
    const { basePrefix } = this;
    const wrapperElement = U.$(wrapper);
    wrapperElement.addClass(`${basePrefix}-wrapper`);
    wrapperElement.html(U.Methods.purifyHtmlFragment(`
      <div class="${basePrefix}">
         <div class="${basePrefix}__toolbar"></div>
         <div class="${basePrefix}__placeholder hide"></div>
      </div>
    `));
    // 默认提示区，在iframe之外，不影响iframe内部编辑模式
    if (U.Type.isString(placeholder) && placeholder.length > 0) {
      this.placeholder = wrapperElement.select(`.${basePrefix}__placeholder`);
      this.placeholder.html(placeholder);
      if (content.length === 0) {
        this.showPlaceholder = true;
      }
    }

    // 采用如下方式添加iframe，因为FF必须在onload之后才能获取相应信息
    const iframeElement = U.$('<iframe></iframe>');
    iframeElement.attr('class', `${basePrefix}__text-iframe`);
    iframeElement.on('load', () => {
      this.window = iframeElement.node.contentWindow;
      const iFrameDocument = this.window.document;
      /**
       * IE6-10，该值大写
       * https://developer.mozilla.org/zh-CN/docs/Web/API/Document/designMode
       * @type {string}
       */
      iFrameDocument.designMode = 'On';
      // 去除语法检查，Safari
      iFrameDocument.body.setAttribute('spellcheck', false);
      const cssStyleElement = U.$('<style></style>');
      cssStyleElement.attr('type', 'text/css');
      cssStyleElement.html(IFrameStyle);
      iFrameDocument.head.appendChild(cssStyleElement.node);
      // 初始化工具栏，在iframe被载入后，方便绑定window
      const toolbarElement = wrapperElement.select(`.${basePrefix}__toolbar`);
      this.initToolbar(toolbarElement);
      // 内容在工具栏之后初始化，需要工具提供处理方式
      iFrameDocument.body.innerHTML = this.initContent(content);
      // 定位光标
      this.moveCaretToEnd();
      this.on('keydown', this.onKeyDown.bind(this));
      this.on('keyup', this.onKeyUp.bind(this));
      this.on('mouseup', this.onMouseUp.bind(this));
      /**
       * 监听DOM树变化，异步调用
       * https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver
       * @type {MutationObserver}
       */
      const mo = new MutationObserver(() => {
        const isEmpty = this.isEmpty();
        this.togglePlaceholder(isEmpty);
        if (this.triggerChange) {
          U.Type.isFunction(this.event.onChange)
            && this.event.onChange(this.getContent());
        }
        this.triggerChange = true;
      });
      mo.observe(iFrameDocument.body, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });
      this.instance = wrapperElement.firstChild().node;
    });
    wrapperElement.select(`.${basePrefix}`).appendChild(iframeElement);
  },
  /**
   * 初始化工具栏
   */
  initToolbar(toolbarElement) {
    const { menu } = this.options;
    const { basePrefix } = this;
    const generateMenuItem = (el) => {
      // 修饰器的配置
      // 如果传入字符串则直接从内置库里找
      // 否则判断传入配置的code是否在内置库里，如果在则用传入的自定义配置覆盖默认配置
      // 如果不在则直接当做自定义配置
      let config = el;
      if (U.Type.isString(el)) {
        config = Widget[el];
      } else if (U.Type.isObject(el) && Widget[el.code]) {
        config = {
          ...Widget[el.code],
          ...el,
        };
      }
      if (config && U.Type.isObject(config)) {
        const modifier = new Modifier(config);
        const { code, action } = modifier;
        // 修饰器挂在editor的状态上
        this.modifier[code] = modifier;
        // 把editor挂在修饰器上
        modifier.editor = this;
        // 在修饰器上注册事件，由修饰器内部决定何时触发行为
        modifier.on('action', () => {
          U.Type.isFunction(action) && action(this.window.document, () => {
            // 修改了文本内容后，需要重新获取焦点，并刷新修饰器状态
            this.focus();
            this.refreshModifier();
          });
        });
        modifier.on('error', (...args) => {
          this.event.onError(...args);
        });
        const liElement = U.$('<li></li>');
        liElement.attr('class', `${basePrefix}__menu-item menu-item--${code}`);
        liElement.appendChild(modifier.render());
        return liElement;
      }
      return null;
    };
    const menuElement = U.$('<div></div>');
    menuElement.attr('class', `${basePrefix}__menu`);
    menu.forEach((item) => {
      const submenuListElement = U.$('<ul></ul>');
      submenuListElement.attr('class', `${basePrefix}__submenu-list`);
      if (U.Type.isArray(item)) {
        item.forEach((code) => {
          const el = generateMenuItem(code);
          el && submenuListElement.appendChild(el);
        });
      } else {
        const el = generateMenuItem(item);
        el && submenuListElement.appendChild(el);
      }
      menuElement.appendChild(submenuListElement);
    });
    toolbarElement.appendChild(menuElement);
  },
  /**
   * 初始化内容
   * @param {*} content
   */
  initContent(content) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content || '', 'text/html');
    Object.keys(this.modifier).forEach((item) => {
      this.modifier[item].init(this.window.document, doc);
    });
    return doc.body.innerHTML || CONSTANTS.DEFAULT_HTML;
  },

  /**
   * 按键时
   * 做一些特殊处理
   * @param ev
   */
  onKeyDown(ev) {
    switch (ev.key) {
      case 'Backspace':
        // 单击删除键且在已没有内容的情况下，阻止默认行为
        if (this.isEmpty()) {
          ev.preventDefault();
        }
        break;
      default:
    }
  },
  /**
   * 按键松开时dom和光标才完成变化，继而可以处理修饰器的高亮
   * @param {*} ev
   */
  onKeyUp(ev) {
    switch (ev.key) {
      // 如果操作方向键 | 回车键 | 删除键
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'Backspace':
      case 'Delete':
      case 'Enter':
        this.refreshModifier();
        break;
      default:
    }
  },
  /**
   * 放开鼠标时
   * @param {*} args
   */
  onMouseUp() {
    this.refreshModifier();
  },
  togglePlaceholder(show) {
    if (!this.showPlaceholder && show) {
      this.showPlaceholder = true;
    } else if (this.showPlaceholder && !show) {
      this.showPlaceholder = false;
    }
  },
  /**
   * 当前是否没内容
   * @returns {boolean}
   */
  isEmpty() {
    // FIXME 整理一下判断顺序
    let inList = false;
    const document = this.window.document;
    const selection = document.getSelection();
    const { anchorNode, focusNode, isCollapsed } = selection;
    if (anchorNode === focusNode && isCollapsed) {
      let currentNode = anchorNode;
      while (currentNode !== document.body) {
        currentNode = currentNode.parentNode;
        if (['ol', 'ul'].includes(currentNode.nodeName.toLowerCase())) {
          inList = true;
          break;
        }
      }
    }

    return !inList && document.body.children.length === 1 && !document.body.textContent;
  },
  /**
   * 将光标位置定位在文本末尾
   */
  moveCaretToEnd() {
    const { document } = this.window;
    const selection = document.getSelection();
    const range = document.createRange();
    let { lastChild } = document.body;
    let startOffset = 1;
    // 如果最后一个结点不是默认行，则新增
    // FIXME 处理不合规范的html片段
    if (lastChild && (lastChild.nodeType !== Node.ELEMENT_NODE ||
      lastChild.outerHTML.toLowerCase() !== CONSTANTS.DEFAULT_HTML)) {
      const div = U.$('<div></div>');
      div.html(CONSTANTS.DEFAULT_HTML);
      const firstChildNode = div.firstChild().node;
      lastChild = firstChildNode;
      startOffset = 0;
      document.body.appendChild(firstChildNode);
    }
    range.setStart(lastChild, startOffset);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    this.focus();
    this.refreshModifier();
  },
  refreshModifier() {
    Object.keys(this.modifier).forEach((item) => {
      const modifier = this.modifier[item];
      U.Type.isFunction(modifier.refresh)
        && modifier.refresh(this.window.document);
    });
  },

  /**
   * 输入框聚焦
   */
  focus() {
    // for FF
    this.window.focus();
    // for Chrome/Safari/IE11
    this.window.document.body.focus();
  },
  /**
   * 获取当前文本内容
   * FIXME 需要处理成标准的html片段
   * @returns {string}
   */
  getContent() {
    return this.window.document.body.innerHTML;
  },
  /**
   * 设置文本内容
   * FIXME 标准化，是否需要额外的处理
   * @param {*} content
   * @param {*} triggerChange 是否触发onChange
   */
  setContent(content, triggerChange) {
    this.triggerChange = !!triggerChange;
    this.window.document.body.innerHTML = this.initContent(content);
    this.moveCaretToEnd();
  },
  /**
   * 注册事件
   */
  on(type, fn) {
    // 处理特殊事件
    switch (type) {
      case 'change': // 当文本内容发生改变时
      case 'error': // 当发生报错时
        this.event[`on${U.Methods.capitalizeFirstLetter(type)}`] = fn;
        break;
      default:
        window.addEventListener(type, fn);
    }
  },
  /**
   * 取消监听
   */
  off(type, fn) {
    switch (type) {
      case 'change':
        this.event[`on${U.Methods.capitalizeFirstLetter(type)}`] = undefined;
        break;
      default:
        this.window.document.body.removeEventListener(type, fn);
    }
  },
  /**
   * 从DOM结构中销毁
   */
  destroy() {
    const wrapperNode = this.instance.parentNode;
    const wrapperParentNode = wrapperNode.parentNode;
    wrapperParentNode && wrapperParentNode.removeChild(wrapperNode);
  },
};

export default Editor;
