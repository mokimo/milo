import { expect } from '@esm-bundle/chai';
import init from '../../../libs/blocks/slideshare/slideshare.js';

describe('slideshare', () => {
  it('renders embed for slideshare link', () => {
    document.body.innerHTML = '<a></a><a href="https://www.slideshare.net/slideshow/embed_code/key/z7jDceGX088IiB">https://www.slideshare.net/slideshow/embed_code/key/z7jDceGX088IiB</a>';
    const slideshare = document.querySelector('a');
    init(slideshare);
    const iframe = document.querySelector('iframe');
    const div = document.querySelector('#slideshare');
    expect(iframe).to.exist;
    expect(div).to.exist;
  });
});
