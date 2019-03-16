import U from '../utils';

/**
 * 修饰功能
 * @param config
 * @constructor
 */
function Modifier(config) {
  const self = this;
  let icon = config.icon;
  let title = config.title;
  // 配置属性
  Object.keys(config).forEach((prop) => {
    const descriptor = Object.getOwnPropertyDescriptor(config, prop);
    switch (prop) {
      case 'code': // 标识符，设定了即不可更改
        Object.defineProperty(self, prop, {
          get() {
            return config[prop];
          },
        });
        break;
      case 'icon': // 图标，字符串 | DOM Node
        delete descriptor.value;
        delete descriptor.writable;
        // 外部可以覆盖内部的Getter/Setter
        Object.defineProperty(self, prop, Object.assign(
          {
            set(v) {
              const oldVal = icon;
              icon = v;
              if (U.Type.isString(v)) {
                const iconEl = U.$(this.instance).select('.editor-modifier__icon');
                iconEl.attr('class', iconEl.attr('class').replace(oldVal, v));
              } else {
                this.instance.replaceChild(v, this.instance.children[0]);
              }
            },
            get() {
              return icon;
            },
          }, descriptor),
        );
        break;
      case 'title': // 鼠标hover时的title
        delete descriptor.value;
        delete descriptor.writable;
        // 外部可以覆盖内部的Getter/Setter
        Object.defineProperty(self, prop, Object.assign(
          {
            set(v) {
              title = v;
              U.$(this.instance).attr('title', v);
            },
            get() {
              return title;
            },
          }, descriptor,
        ));
        break;
      case 'action':
        // 驱动编辑器改变行为的封装
        Object.defineProperty(self, prop, {
          get() {
            return (...args) => {
              config[prop].apply(self, args);
            };
          },
        });
        break;
      case 'render':
        // 如果有传入render函数，则接手渲染DOM的工作
        if (U.Type.isFunction(config[prop])) {
          Object.defineProperty(self, 'render', {
            get() {
              return () => {
                self.instance = config[prop].bind(self)();
                return self.instance;
              };
            },
          });
        }
        break;
      default: // 其他属性不做处理，直接放在实例上
        // 处理修饰器传入
        Object.defineProperty(self, prop, descriptor);
    }
  });
  // 私有属性
  let instance = null;
  let active = false;
  const listeners = {};
  Object.defineProperties(self, {
    // 当前激活状态
    active: {
      get() {
        return active;
      },
      set(v) {
        active = v;
        this.trigger('active', v);
        if (v && !self.instance.classList.contains('active')) {
          self.instance.classList.add('active');
        } else if (!v && self.instance.classList.contains('active')) {
          self.instance.classList.remove('active');
        }
      },
    },
    // 菜单项实例
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
    // 监听器集合
    listeners: {
      get() {
        return listeners;
      },
    },
  });
}

Object.assign(Modifier.prototype, {
  render() {
    const { code, icon, title, active } = this;
    const wrapperElement = U.$('<div></div>');
    wrapperElement.attr('class', `editor-modifier editor-modifier--${code}${active ? ' active' : ''}`);
    !!title && wrapperElement.attr('title', title);
    let iconElement = icon;
    if (U.Type.isString(icon)) {
      iconElement = U.$('<div></div>');
      iconElement.attr('class', `editor-modifier__icon block-editor-icon-${icon}`);
    }
    if (!U.Type.isEmpty(iconElement)) {
      wrapperElement.appendChild(iconElement);
    } else if (!U.Type.isEmpty(title)) {
      const titleElement = U.$('<div></div>');
      titleElement.attr('class', 'editor-modifier__title');
      titleElement.html(title);
      wrapperElement.appendChild(titleElement);
    }
    wrapperElement.on('click', () => {
      this.trigger('action');
    });
    // 作为可覆盖的属性，返回值应该是一个通用的类型
    this.instance = wrapperElement.node;
    return this.instance;
  },
  /**
   * 注册事件
   * @param {*} type
   */
  on(type, fn) {
    const listenerList = this.listeners[type] || [];
    if (!listenerList.includes(fn)) {
      listenerList.push(fn);
      this.listeners[type] = listenerList;
    }
  },
  /**
   * 触发事件
   * @param {*} type
   */
  trigger(type, ...args) {
    const self = this;
    (this.listeners[type] || []).forEach((fn) => {
      U.Type.isFunction(fn) && fn.apply(self, args);
    });
  },
  init() {},
});

export default Modifier;
