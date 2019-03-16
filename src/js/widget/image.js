import U from '../utils';
import CONSTANTS from '../constants';

/**
 * 图片
 * @type {Object}
 */
const IMAGE = {
  code: 'image',
  icon: 'image',
  title: '插入图片',
  file: null,
  multiple: false,
  accept: '.png,.jpg,.jpeg,.gif,.bmp',
  action(document, callback) {
    if (this.file) {
      // 如果当前块是个空块或列表元素，则先插入临时结点
      const selection = document.getSelection();
      const { anchorNode, focusNode, isCollapsed } = selection;
      // 加个key在上传多个图片后能替换到对应的位置
      const key = Date.now();
      if (anchorNode === focusNode && isCollapsed
        && (anchorNode.nodeName.toLowerCase() === 'li'
        || !!anchorNode.nodeValue)) {
        // 这里如果使用 insertParagraph 命令
        // 如果是有内容的li，会换行在新的li标签里加img；如果是没内容的li，会替换ul/ol为div标签，并在之下加img
        // 现在要求无论如何都换新行添加img
        document.execCommand('insertHTML', false, CONSTANTS.DEFAULT_HTML);
      }
      // 再插入loading图片
      document.execCommand('insertHTML', false,
        `<img class="temporary-image" data-key="${key}" src=${CONSTANTS.LOADING_IMAGE} />`);

      // 最后插入换行
      document.execCommand('insertParagraph');
      U.Type.isFunction(callback) && callback();
      if (U.Type.isFunction(this.onUpload)) {
        this.onUpload(this.file).then((res) => {
          const temporaryImage = document.querySelector(`[data-key="${key}"]`);
          temporaryImage.removeAttribute('class');
          temporaryImage.removeAttribute('data-key');
          // 替换图片外链
          temporaryImage.src = res;
        });
      } else {
        // FIXME 如果没有传入onUpload，则本地显示
        const reader = new window.FileReader();
        reader.onloadend = () => {
          const temporaryImage = document.querySelector(`[data-key="${key}"]`);
          temporaryImage.removeAttribute('class');
          temporaryImage.removeAttribute('data-key');
          // 替换图片外链
          temporaryImage.src = reader.result;
        };
        reader.readAsDataURL(this.file);
      }
    }
  },
  render() {
    const { code, icon, title, active, multiple, accept } = this;
    const prefix = `editor-modifier--${code}`;

    const wrapperElement = U.$('<div></div>');
    wrapperElement.attr('class', `editor-modifier ${prefix}${active ? ' active' : ''}`);
    wrapperElement.html(U.Methods.purifyHtmlFragment(`
      <div class="editor-modifier__main ${prefix}__main" title="${!title ? '' : title}">
         <div class="editor-modifier__icon ${prefix}__icon block-editor-icon-${icon}"></div>
      </div>
      <input type="file"
             class="${prefix}__input"
             ${multiple ? 'multiple="multiple"' : ''}
             accept=${accept} />
    `));

    const iconElement = wrapperElement.select(`.${prefix}__icon`);
    const inputElement = wrapperElement.select(`.${prefix}__input`);
    iconElement.on('click', () => {
      inputElement.click();
    });
    inputElement.on('change', () => {
      const file = inputElement.node.files[0];

      // 校验类型
      const fileName = file.name;
      const acceptedFileType = accept.slice(1).split(',.');

      if (acceptedFileType.includes(/.+\.(.+)/.exec(fileName)[1])) {
        this.file = file;
        this.trigger('action');
      } else {
        // FIXME 校验失败怎么处理，处理错误的方式可以由外部传入
        this.trigger('error', { message: '文件类型不匹配' });
      }
      inputElement.val(null);
    });
    return wrapperElement.node;
  },
};

export default IMAGE;
