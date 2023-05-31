import { expect } from '@esm-bundle/chai';
import init from '../../../libs/blocks/twitter/twitter.js';

describe('twitter', () => {
  it('renders embed tweet for twitter link', () => {
    document.body.innerHTML = '<a></a><a href="https://twitter.com/AdobePrint/status/1555212165346254848?s=20&t=5y2vpznI_ZwECs0l_hc1mw">https://twitter.com/AdobePrint/status/1555212165346254848?s=20&amp;t=5y2vpznI_ZwECs0l_hc1mw</a>';
    const twitter = document.querySelector('a');
    init(twitter);
    const blockquote = document.querySelector('.twitter-tweet');
    const wrapper = document.querySelector('.embed-twitter');
    expect(blockquote).to.not.be.null;
    expect(wrapper).to.not.be.null;
  });
});
