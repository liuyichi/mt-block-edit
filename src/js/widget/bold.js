import U from '../utils';

/**
 * 粗体
 * @type {Object}
 */
const BOLD = {
  code: 'bold',
  icon: 'bold',
  title: '粗体',
  action(document, callback) {
    document.execCommand('bold');
    this.active = !this.active;
    U.Type.isFunction(callback) && callback();
  },
  refresh(document) {
    this.active = document.queryCommandState('bold');
  },
};

export default BOLD;
