import U from '../utils';
import Config from './config';

function Button(props = {}) {
  const { type = 'default', label, size = '', onClick, className, domProps = {} } = props;
  const basePrefix = `${Config.prefixCls}-button`;
  const el = U.$('<button></button>');
  el.attr('class', `${basePrefix}${size ? ` button-${size}` : ''} ${type} ${className}`);
  el.html(label);
  el.on('click', onClick);
  Object.keys(domProps).forEach((item) => {
    el.attr(item, domProps[item]);
  });
  return el;
}

export default Button;
