import U from '../utils';

/**
 * 粗体
 * @type {Object}
 */
const ALIGN_LEFT = {
  code: 'align-left',
  icon: 'align-left',
  title: '左对齐',
  action(document, callback) {
    const selection = document.getSelection();
    const { anchorNode } = selection;
    let targetNode = anchorNode;
    // 找到首个不是文本结点且父节点是body的结点
    while (targetNode.parentNode !== document.body
      || !U.Type.isElement(targetNode)) {
      targetNode = targetNode.parentNode;
    }
    U.$(targetNode).css('text-align', this.active ? '' : 'left');
    this.active = !this.active;
    U.Type.isFunction(callback) && callback();
  },
  refresh(document) {
    const selection = document.getSelection();
    const { anchorNode } = selection;
    let targetNode = anchorNode;
    // 找到首个不是文本结点且父节点是body的结点
    while (!U.Type.isElement(targetNode)
      || targetNode.parentNode !== document.body) {
      targetNode = targetNode.parentNode;
    }
    const alignValue = U.$(targetNode).css('text-align');
    this.active = alignValue === 'left';
  },
};

export default ALIGN_LEFT;
