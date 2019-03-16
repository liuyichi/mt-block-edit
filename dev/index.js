import Editor from '../src/js/index';
import './index.scss';
const editor = new Editor({
  // wrapper: '#container',
  wrapper: document.querySelector('#container'),
  menu: [
    ['heading', 'bold', 'italic', 'underline', 'strike-through', 'fore-color', 'back-color'],
    ['ordered-list', 'unordered-list'],
    ['align-left', 'align-center', 'align-right'],
    ['link', {
      code: 'image',
      onUpload: async (file) => {
        console.log(file);
        await new Promise((res) => { setTimeout(res, 2000); });
        const res = await window.fetch('/image/upload');
        return (await res.json()).url;
      },
    }],
    ['display-mode-switcher', {
      code: 'source-code',
      operations: [
        {
          code: 'clear-inline-style',
          label: '清除行内样式',
          type: 'default',
          size: 'small',
          action(content) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(content, 'text/html');
            const clearInlineStyle = (node) => {
              node.removeAttribute('style');
              if (node.hasChildNodes()) { // 这个计算会包括TextNode
                Array.from(node.children).forEach(item => clearInlineStyle(item));
              }
            };
            clearInlineStyle(doc.body);
            return doc.body.innerHTML;
          },
        },
      ],
    }],
  ],
  content: '<p style="margin-top:10px">富文本编辑器的内容</p><p>Lorem ipsum dolor sit amet.</p>',
  // content: '<h1 style="margin-top:10px">标题</h1><p>仅展示下列内容</p><ul><li>列表</li><li>图片</li></ul><p></p><p><br></p>',
  // content: '<h1><br/></h1>',
  // content: '',
  placeholder: '请输入任意字符串...',
});
const onFocus = () => {
  console.log('focus callback');
};
const onBlur = () => {
  console.log('blur callback');
};
editor.on('focus', onFocus);
editor.on('focus', onFocus);
editor.on('blur', onBlur);
editor.on('change', (content) => {
  console.log('change callback', content);
});
editor.on('keypress', () => {
  console.log('keypress callback');
});
editor.on('keydown', () => {
  console.log('keydown callback');
});
editor.on('error', (msg) => {
  console.error(msg);
});

document.getElementById('submit').onclick = () => {
  console.log(editor.getContent());
  editor.off('blur', onBlur);
};

window.editor = editor;
