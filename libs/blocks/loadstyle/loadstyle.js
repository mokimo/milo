import { loadStyle, getConfig } from '../../utils/utils.js';

export default function init() {
  const { miloLibs } = getConfig();
  loadStyle(`${miloLibs}/blocks/loadstyle/external.css`);
  document.getElementsByClassName('loadstyle')[0].innerHTML = 'this will get styled by loadStyle. ';
  console.log('el');
}
