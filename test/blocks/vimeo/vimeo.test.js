import { expect } from '@esm-bundle/chai';
import init from '../../../libs/blocks/vimeo/vimeo.js';

describe('vimeo', () => {
  it('renders embed video for vimeo link', () => {
    document.body.innerHTML = '<a href="https://vimeo.com/636596252">https://vimeo.com/636596252</a>';
    const vimeo = document.querySelector('a');
    init(vimeo);
    const iframe = document.querySelector('iframe');
    const wrapper = document.querySelector('.embed-vimeo');
    expect(wrapper).to.not.be.null;
    expect(iframe).to.exist;
  });
});
