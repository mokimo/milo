import { expect } from '@esm-bundle/chai';
import init from '../../../libs/blocks/tiktok/tiktok.js';

describe('tiktok', () => {
  it('renders embed video for tiktok link', () => {
    document.body.innerHTML = '<a href="https://www.tiktok.com/@adobe/video/7171880842296347946">https://www.tiktok.com/@adobe/video/7171880842296347946</a>';
    const tiktok = document.querySelector('a');
    init(tiktok);
    const blockquote = document.querySelector('.tiktok-embed');
    expect(blockquote).to.not.be.null;
  });
});
