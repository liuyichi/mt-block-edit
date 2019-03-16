import U from '../utils';

/**
 * 删除线
 * @type {Object}
 */
const STRIKE_THROUGH = {
  code: 'strike-through',
  icon: 'strike-through',
  title: '删除线',
  action(document, callback) {
    document.execCommand('strikeThrough');
    this.active = !this.active;
    U.Type.isFunction(callback) && callback();
  },
  refresh(document) {
    this.active = document.queryCommandState('strikeThrough');
  },
};

export default STRIKE_THROUGH;
