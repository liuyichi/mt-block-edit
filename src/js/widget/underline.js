import U from '../utils';

/**
 * 下划线
 * @type {Object}
 */
const UNDERLINE = {
  code: 'underline',
  icon: 'underline',
  title: '下划线',
  action(document, callback) {
    document.execCommand('underline');
    this.active = !this.active;
    U.Type.isFunction(callback) && callback();
  },
  refresh(document) {
    this.active = document.queryCommandState('underline');
  },
};

export default UNDERLINE;
