import { html_beautify } from 'js-beautify/js/lib/beautify-html'; // eslint-disable-line
import U from '../utils';
import Dialog from '../common/Dialog';
import Input from '../common/Input';
import Button from '../common/Button';

const SOURCE_CODE = {
  code: 'source-code',
  title: '源代码',
  content: '',
  /**
   * 允许外部向内传入操作
   * { code, label, type, action }
   * action接受参数为当前编辑器的内容，返回的是处理后的内容，重新赋给输入框
   */
  operations: [],
  action(document, callback) {
    const htmlContent = this.content;
    this.editor.setContent(U.Methods.purifyHtmlFragment(htmlContent), true);
    U.Type.isFunction(callback) && callback();
  },
  render() {
    const self = this;
    const { code, title, active, action, operations } = self;
    const prefix = `editor-modifier--${code}`;

    const wrapperElement = U.$('<div></div>');
    wrapperElement.attr('class', `editor-modifier ${prefix}${active ? ' active' : ''}`);
    wrapperElement.html(U.Methods.purifyHtmlFragment(`
      <div class="editor-modifier__main ${prefix}__main" title="${!title ? '' : title}">
        <div class="editor-modifier__title ${prefix}__title">${title}</div>
      </div>
    `));
    const titleElement = wrapperElement.select(`.${prefix}__title`);
    titleElement.on('click', () => {
      this.content = html_beautify(this.editor.getContent());
      const textareaElement = new Input({
        type: 'textarea',
        className: `${prefix}__textarea`,
        value: this.content,
        domProps: {
          autoFocus: true,
          rows: 25,
        },
        onChange(v) {
          self.content = v;
        },
      });
      const dialogContent = U.$('<div></div>');
      dialogContent.attr('class', `${prefix}__content`);
      if (operations.length > 0) {
        const listElement = U.$('<div></div>');
        listElement.attr('class', `${prefix}__tools`);
        operations.forEach((item) => {
          const { action: operationAction, ...props } = item;
          listElement.appendChild(new Button({
            ...props,
            onClick() {
              self.content = operationAction(self.content);
              textareaElement.value = self.content;
            },
          }));
        });
        dialogContent.appendChild(listElement);
      }
      dialogContent.appendChild(textareaElement);
      Dialog.show({
        title: '编辑内容',
        content: dialogContent,
        buttons: [
          {
            code: 'cancel',
            label: '取消',
            type: 'default',
          },
          {
            code: 'confirm',
            label: '确认',
            type: 'primary',
            action(close) {
              action();
              close();
            },
          },
        ],
        className: `${prefix}__dialog`,
      });
    });

    return wrapperElement.node;
  },
};

export default SOURCE_CODE;
