import U from '../utils';

/**
 * 显示模式切换器
 * 普通 | 全屏
 * @type {Object}
 */
const AVAILABLE_MODE = {
  normal: {
    icon: 'expand',
    title: '全屏',
  },
  full_screen: {
    icon: 'compress',
    title: '退出全屏',
  },
};
const DISPLAY_MODE_SWITCHER = {
  code: 'display-mode-switcher',
  icon: AVAILABLE_MODE.normal.icon,
  title: AVAILABLE_MODE.normal.title,
  action(document, callback) {
    const insEl = U.$(this.editor.instance);
    if (insEl.containsClass('full-screen')) {
      insEl.removeClass('full-screen');
      this.icon = AVAILABLE_MODE.normal.icon;
      this.title = AVAILABLE_MODE.normal.title;
    } else {
      insEl.addClass('full-screen');
      this.icon = AVAILABLE_MODE.full_screen.icon;
      this.title = AVAILABLE_MODE.full_screen.title;
    }
    U.Type.isFunction(callback) && callback();
  },
};

export default DISPLAY_MODE_SWITCHER;
