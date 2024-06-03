import { loadStyle } from '../../utils/utils.js';

export default function init() {
  loadStyle('https://metadata-differ--milo--mokimo.aem.page/libs/blocks/loadstyle/external.css');
  document.getElementsByClassName('loadstyle')[0].innerHTML = 'this will get styled by loadStyle. ';
  console.log('el');
}
