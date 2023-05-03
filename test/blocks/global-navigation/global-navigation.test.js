/* eslint-disable no-restricted-syntax */
import { expect } from '@esm-bundle/chai';
import { readFile, sendKeys, setViewport } from '@web/test-runner-commands';
import { createFullGlobalNavigation } from './utilities/test-utilities.js';

describe('global navigation', () => {
  it('should render the navigation', () => {
    const nav = createFullGlobalNavigation();
    expect(document.querySelector('global-navigation')).to.exist;
  });
});
