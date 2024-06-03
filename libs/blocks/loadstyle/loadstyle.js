import { loadStyle } from '../../utils/utils';

export default function init(el) {
  el.innerHTML = 'this will get styled by loadStyle but too late. ';
  console.log('el');
}
