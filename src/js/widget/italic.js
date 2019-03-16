import U from '../utils';

/**
 * 斜体
 * @type {Object}
 */
const ITALIC = {
  code: 'italic',
  icon: 'italic',
  title: '斜体',
  action(document, callback) {
    document.execCommand('italic');
    this.active = !this.active;
    U.Type.isFunction(callback) && callback();
  },
  refresh(document) {
    this.active = document.queryCommandState('italic');
  },
};

export default ITALIC;
