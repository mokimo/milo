import { expect } from '@esm-bundle/chai';
import init from '../../../libs/blocks/youtube/youtube.js';

describe('twitter', () => {
  it('Renders an iframe for both types of youtube links', async () => {
    document.body.innerHTML = '<a></a><a href="https://www.youtube.com/embed/LWJCbruwNC0">Youtube Embed Link</a><a href="https://www.youtu.be/LWJCbruwNC0">Youtube Share Link</a>';
    const youtube = document.querySelectorAll('a');
    youtube.forEach(async (link) => init(link));
    expect(document.querySelectorAll('iframe').length).to.equal(2);
  });
});
