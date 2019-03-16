import U from '../utils';
import Config from './config';
import Button from './Button';

const Dialog = {
  getContainer() {
    return document.body;
  },
  show(config = {}) {
    const { title, content, buttons, className } = config;
    const basePrefix = `${Config.prefixCls}-dialog`;
    const wrapperElement = U.$('<div></div>');
    wrapperElement.attr('class', `${basePrefix} ${className}`);
    wrapperElement.html(U.Methods.purifyHtmlFragment(`
      <div class="${basePrefix}__body">
        <div class="${basePrefix}__title">${title}</div>
        <div class="${basePrefix}__content"></div>
        <div class="${basePrefix}__operation"></div>
      </div>
    `));
    const contentElement = wrapperElement.select(`.${basePrefix}__content`);
    if (content instanceof U.$.DOMElement) {
      contentElement.appendChild(content);
    } else {
      contentElement.html(content);
    }
    const operationElement = wrapperElement.select(`.${basePrefix}__operation`);
    (buttons || []).forEach((item) => {
      const { code, label, action, type } = item;
      operationElement.appendChild(new Button({
        type,
        label,
        className: `${code}-btn`,
        onClick: U.Type.isFunction(action) ?
          action.bind(this, this.close.bind(this)) : this.close.bind(this),
      }));
    });
    this.instance = this.getContainer().appendChild(wrapperElement.node);
    return this.instance;
  },
  close() {
    this.getContainer().removeChild(this.instance);
  },
};

export default Dialog;
