import U from '../utils';
import Config from './config';

function Input(props = {}) {
  const { type, size = '', onChange, value, className, domProps = {} } = props;
  const basePrefix = `${Config.prefixCls}-input`;
  const wrapperEl = U.$('<div></div>');
  wrapperEl.attr('class', `${basePrefix}${size ? ` input-${size}` : ''} ${className}`);
  let el;
  let v = value;
  switch (type) {
    case 'textarea':
      el = U.$('<textarea></textarea>');
      wrapperEl.addClass(`${basePrefix}-${type}`);
      el.html(v);
      break;
    default:
      el = U.$('<input />');
      el.attr('type', 'text');
      el.attr('value', v);
  }
  el.on('input', (ev) => {
    const { value: newV } = ev.target;
    v = newV;
    onChange(v, ev);
  });
  Object.keys(domProps).forEach((item) => {
    el.attr(item, domProps[item]);
  });
  wrapperEl.appendChild(el);
  Object.defineProperty(wrapperEl, 'value', {
    set(newV) {
      v = newV;
      switch (type) {
        case 'textarea':
          el.html(v);
          break;
        default:
          el.attr('value', v);
      }
    },
    get() {
      return v;
    },
  });
  return wrapperEl;
}

export default Input;
