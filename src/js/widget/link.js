import U from '../utils';

/**
 * 链接
 * @type {Object}
 */
const LINK = {
  code: 'link',
  icon: 'link',
  title: '插入链接',
  text: '',
  href: '',
  action(document, callback) {
    if (this.text && this.href) {
      // FIXME 测试下IE，chrome光标回不去，safari/FF正常
      document.execCommand('insertHTML', false,
        `<a href="${this.href}" target="_blank">${this.text}</a>`);
      this.text = '';
      this.href = '';
      U.Type.isFunction(callback) && callback();
    }
  },
  render() {
    const { code, icon, title, active } = this;
    const prefix = `editor-modifier--${code}`;

    const wrapperElement = U.$('<div></div>');
    wrapperElement.attr('class', `editor-modifier ${prefix}${active ? ' active' : ''}`);
    wrapperElement.html(U.Methods.purifyHtmlFragment(`
      <div class="editor-modifier__main ${prefix}__main" title="${!title ? '' : title}">
         <div class="editor-modifier__icon ${prefix}__icon block-editor-icon-${icon}"></div>
      </div>
      <div class="editor-modifier__dropdown ${prefix}__dropdown hide">
         <div class="${prefix}__content">
            <div class="${prefix}__field text-field">
               <div class="${prefix}__label">文本内容</div>
               <div class="${prefix}__input">
                  <input type="text" class="${prefix}__text-input" />
               </div>
            </div>
            <div class="${prefix}__field href-field">
               <div class="${prefix}__label">链接地址</div>
               <div class="${prefix}__input">
                  <input type="text" class="${prefix}__address-input" />
               </div>
            </div>
         </div>
         <div class="${prefix}__operation">
            <button class="${prefix}__btn cancel-btn">取消</button>
            <button class="${prefix}__btn confirm-btn">确定</button>
         </div>
      </div>
    `));

    const dropdownElement = wrapperElement.lastChild();
    const textFieldElement = wrapperElement.select(`.${prefix}__field.text-field`);
    const iconElement = wrapperElement.select(`.${prefix}__icon`);
    const textInputElement = wrapperElement.select(`.${prefix}__text-input`);
    const addressInputElement = wrapperElement.select(`.${prefix}__address-input`);
    const cancelBtnElement = wrapperElement.select(`.${prefix}__btn.cancel-btn`);
    const confirmBtnElement = wrapperElement.select(`.${prefix}__btn.confirm-btn`);
    const toggleActive = () => {
      this.active = !dropdownElement.containsClass('hide');
    };
    iconElement.on('click', () => {
      dropdownElement.toggleClass('hide');
      toggleActive();
      // 当显示下拉时，判断当前是否有选中文字，如果有，则存储内容并隐藏文本内容的填入
      if (!dropdownElement.containsClass('hide')) {
        const document = this.editor.window.document;
        const selection = document.getSelection();
        if (!selection.isCollapsed) {
          // 获取当前选区内容
          this.text = document.getSelection().getRangeAt(0).toString();
          textFieldElement.addClass('hide');
          addressInputElement.focus();
        } else {
          textFieldElement.removeClass('hide');
          textInputElement.focus();
        }
      }
    });
    cancelBtnElement.on('click', () => {
      dropdownElement.addClass('hide');
      toggleActive();
    });
    confirmBtnElement.on('click', () => {
      this.text = this.text || textInputElement.val();
      this.href = addressInputElement.val();
      this.trigger('action');
      textInputElement.val('');
      addressInputElement.val('');
      dropdownElement.addClass('hide');
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
};

export default LINK;
