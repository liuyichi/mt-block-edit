import U from '../utils';

/**
 * 有序列表
 * @type {Object}
 */
const ORDERED_LIST = {
  code: 'ordered-list',
  icon: 'ordered-list',
  title: '有序列表',
  action(document, callback) {
    document.execCommand('insertOrderedList');
    this.active = !this.active;
    U.Type.isFunction(callback) && callback();
  },
  refresh(document) {
    this.active = document.queryCommandState('insertOrderedList');
  },
};

export default ORDERED_LIST;
