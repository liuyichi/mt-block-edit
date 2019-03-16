import U from '../utils';

/**
 * 无序列表
 * @type {Object}
 */
const UNORDERED_LIST = {
  code: 'unordered-list',
  icon: 'unordered-list',
  title: '无序列表',
  action(document, callback) {
    document.execCommand('insertUnorderedList');
    this.active = !this.active;
    U.Type.isFunction(callback) && callback();
  },
  refresh(document) {
    this.active = document.queryCommandState('insertUnorderedList');
  },
};

export default UNORDERED_LIST;
