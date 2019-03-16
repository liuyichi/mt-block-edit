import U from '../utils';
import CONSTANTS from '../constants';

/**
 * 文字颜色
 * @type {Object}
 */
const DEFAULT_COLOR = '#666';
let color = DEFAULT_COLOR;
const FORE_COLOR = {
  code: 'fore-color',
  icon: 'fore-color',
  title: '文字颜色',
  set color(v) {
    color = v;
    const activeColorElement = U.$(this.instance).select('[class*=active-color]');
    activeColorElement.css('backgroundColor', v);
  },
  get color() {
    return color;
  },
  action(document, callback) {
    document.execCommand('foreColor', false, this.color);
    U.Type.isFunction(callback) && callback();
  },
  render() {
    const self = this;
    const { code, icon, title, active } = self;
    const prefix = `editor-modifier--${code}`;

    // 先定义dom结构，后定义事件注册
    const wrapperElement = U.$('<div></div>');
    wrapperElement.attr('class', `editor-modifier ${prefix}${active ? ' active' : ''}`);
    let colorListHTML = '';
    CONSTANTS.AVAILABLE_COLORS.forEach((item) => {
      colorListHTML += (`
        <li class="${prefix}__color-item"
            style="background:${item}"
            data-color="${item}"></li>
      `);
    });
    wrapperElement.html(U.Methods.purifyHtmlFragment(`
      <div class="editor-modifier__main ${prefix}__main" title="${!title ? '' : title}">
         <div class="${prefix}__content">
            <div class="${prefix}__icon block-editor-icon-${icon}"></div>
            <div class="${prefix}__active-color"
                 style="background-color:${color}"></div>
         </div>
         <div class="${prefix}__dropdown-btn">
            <div class="${prefix}__triangle"></div>
         </div>
      </div>
      <div class="editor-modifier__dropdown ${prefix}__dropdown hide">
         <ul class="${prefix}__color-list">${colorListHTML}</ul>
      </div>
    `));

    const dropdownElement = wrapperElement.lastChild();
    const toggleActive = () => {
      this.active = !dropdownElement.containsClass('hide');
    };
    const contentElement = wrapperElement.select(`.${prefix}__content`);
    contentElement.on('click', () => {
      dropdownElement.addClass('hide');
      toggleActive();
      this.trigger('action');
    });

    const colorItemElements = wrapperElement.selectAll(`.${prefix}__color-item`);
    colorItemElements.forEach((item) => {
      item.on('click', (e) => {
        this.color = e.currentTarget.dataset.color;
        dropdownElement.addClass('hide');
        toggleActive();
        this.trigger('action');
      });
    });

    const dropdownBtnElement = wrapperElement.select(`.${prefix}__dropdown-btn`);
    dropdownBtnElement.on('click', () => {
      dropdownElement.toggleClass('hide');
      toggleActive();
    });

    // 单击外部隐藏下拉
    [window, this.editor.window].forEach((item) => {
      item.addEventListener('click', (e) => {
        if (!dropdownElement.containsClass('hide')
          && !wrapperElement.contains(e.target)) {
          dropdownElement.addClass('hide');
          toggleActive();
        }
      });
    });

    return wrapperElement.node;
  },
  refresh(document) {
    const foreColor = document.queryCommandValue('foreColor');
    this.color = U.Methods.rgbToHex(foreColor);
  },
};

export default FORE_COLOR;
