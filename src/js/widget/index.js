import BOLD from './bold';
import ITALIC from './italic';
import UNDERLINE from './underline';
import STRIKE_THROUGH from './strike-through';
import FORE_COLOR from './fore-color';
import BACK_COLOR from './back-color';
import HEADING from './heading';
import ORDERED_LIST from './ordered-list';
import UNORDERED_LIST from './unordered-list';
import LINK from './link';
import IMAGE from './image';
import DISPLAY_MODE_SWITCHER from './display-mode-switcher';
import SOURCE_CODE from './source-code';
import ALIGN_LEFT from './align-left';
import ALIGN_CENTER from './align-center';
import ALIGN_RIGHT from './align-right';

const widget = {};

function extract(module) {
  Object.keys(module).forEach((item) => {
    widget[module[item].code] = module[item];
  });
}
extract({
  BOLD,
  ITALIC,
  UNDERLINE,
  STRIKE_THROUGH,
  FORE_COLOR,
  BACK_COLOR,
  HEADING,
  ORDERED_LIST,
  UNORDERED_LIST,
  LINK,
  IMAGE,
  DISPLAY_MODE_SWITCHER,
  SOURCE_CODE,
  ALIGN_LEFT,
  ALIGN_CENTER,
  ALIGN_RIGHT,
});

export default widget;
