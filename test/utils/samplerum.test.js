/* eslint-disable no-unused-expressions */
/* global describe it */

import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';

describe('SampleRUM', () => {
  it('Collects RUM data', async () => {
    const { fetch } = window;
    window.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) });
    const { sampleRUM } = await import('../../libs/utils/samplerum.js');
    window.hlx.rum.collector = sinon.stub();
    window.hlx.rum.isSelected = true;

    // sends checkpoint beacon
    sampleRUM('test', { foo: 'bar' });
    // check the call count
    expect(window.hlx.rum.collector.callCount).to.equal(1);

    // sends cwv beacon
    sampleRUM('cwv', { foo: 'bar' });
    expect(window.hlx.rum.collector.callCount).to.equal(2);

    // test error handling
    sampleRUM('error', { foo: 'bar' });
    expect(window.hlx.rum.collector.callCount).to.equal(3);

    window.fetch = fetch;
    document.head.innerHTML = '';
  });
});
