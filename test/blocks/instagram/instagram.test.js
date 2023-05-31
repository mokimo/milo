import { expect } from '@esm-bundle/chai';
import init from '../../../libs/blocks/instagram/instagram.js';

describe('instagram', () => {
  it('renders embed post for instagram link', () => {
    document.body.innerHTML = '<a></a><a href="https://www.instagram.com/p/Cl1xhZuvN8N/?utm_source=ig_web_button_share_sheet">https://www.instagram.com/p/Cl1xhZuvN8N/?utm_source=ig_web_button_share_sheet</a>';
    const instagram = document.querySelector('a');
    init(instagram);
    const blockquote = document.querySelector('.instagram-media');
    const wrapper = document.querySelector('.embed-instagram');
    expect(blockquote).to.not.be.null;
    expect(wrapper).to.not.be.null;
  });
});
