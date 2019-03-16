import U from '../utils';
import CONSTANTS from '../constants';

const DEFAULT_HEADING = {
  tag: 'p',
  text: '正文',
};
let heading = DEFAULT_HEADING;
const HEADING = {
  code: 'heading',
  icon: '正文',
  get heading() {
    return heading;
  },
  set heading(v) {
    heading = v;
    const textElement = U.$(this.instance).select('[class*=__text]');
    textElement.html(v.text);
  },
  action(document, callback) {
    // chrome不支持首参为heading
    document.execCommand('formatBlock', false, `<${this.heading.tag}>`);
    U.Type.isFunction(callback) && callback();
  },
  render() {
    const self = this;
    const { code, icon, title, active } = self;
    const prefix = `editor-modifier--${code}`;

    // 先定义dom结构，后定义事件注册
    const wrapperElement = U.$('<div></div>');
    wrapperElement.attr('class', `editor-modifier ${prefix}${active ? ' active' : ''}`);
    let headingListHTML = '';
    CONSTANTS.HEADINGS.forEach((item) => {
      const { tag, text } = item;
      headingListHTML += (`
        <li class="${prefix}__heading-item"
            data-text="${text}"
            data-tag="${tag}">
          <${tag}>${text}</${tag}>
        </li>
      `);
    });
    wrapperElement.html(U.Methods.purifyHtmlFragment(`
      <div class="editor-modifier__main ${prefix}__main" title="${!title ? '' : title}">
        <div class="${prefix}__content">
            <div class="${prefix}__text">${icon}</div>
        </div>
        <div class="${prefix}__dropdown-btn">
            <div class="${prefix}__triangle"></div>
        </div>
      </div>
      <div class="editor-modifier__dropdown ${prefix}__dropdown hide">
        <ul class="${prefix}__heading-list">${headingListHTML}</ul>
      </div>
    `));
    const dropdownElement = wrapperElement.lastChild();
    const toggleActive = () => {
      this.active = !dropdownElement.containsClass('hide');
    };
    const mainElement = wrapperElement.select(`.${prefix}__main`);
    mainElement.on('click', () => {
      dropdownElement.toggleClass('hide');
      toggleActive();
    });

    const textElement = wrapperElement.select(`.${prefix}__text`);
    const headingItemElements = wrapperElement.selectAll(`.${prefix}__heading-item`);
    headingItemElements.forEach((item) => {
      item.on('click', (e) => {
        const { dataset: { tag, text } } = e.currentTarget;
        this.heading = {
          tag,
          text,
        };
        textElement.html(text);
        dropdownElement.addClass('hide');
        toggleActive();
        this.trigger('action');
      });
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
    const tag = document.queryCommandValue('formatBlock');
    const result = CONSTANTS.HEADINGS.find(item => item.tag === tag);
    if (result) {
      this.heading = result;
    } else {
      this.heading = CONSTANTS.HEADINGS.find(item => item.tag === 'p');
    }
  },
};

export default HEADING;
