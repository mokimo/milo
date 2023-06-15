import { expect } from '@esm-bundle/chai';
import breadcrumbs from '../../../../libs/blocks/global-navigation/features/breadcrumbs/breadcrumbs.js';
import { toFragment } from '../../../../libs/blocks/global-navigation/utilities/utilities.js';

export const breadcrumbMock = () => toFragment`
  <div class="breadcrumbs">
    <div>
      <div>
        <ul>
          <li><a href="http://www.google.com/">1-from-page</a></li>
          <li><a href="http://www.adobe.com/">Actors</a></li>
          <li>Players</li>
        </ul>
      </div>
    </div>
  </div>
`;

export const assertBreadcrumb = ({ breadcrumb, length }) => {
  expect(breadcrumb.querySelector('nav')).to.exist;
  expect(breadcrumb.querySelector('ul').children.length).to.equal(length);
  expect(
    breadcrumb.querySelector('ul li:last-of-type').getAttribute('aria-current'),
  ).to.equal('page');
};
const { fetch } = window;
describe('breadcrumbs', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    window.fetch = fetch;
  });

  it('should create a breadcrumb from markup', async () => {
    const breadcrumb = await breadcrumbs(breadcrumbMock());
    assertBreadcrumb({ breadcrumb, length: 4 });
  });

  it('should hide the last item', async () => {
    document.head.innerHTML = '<meta name="breadcrumbs-hide-current-page" content="on">';
    const breadcrumb = await breadcrumbs(breadcrumbMock());
    assertBreadcrumb({ breadcrumb, length: 3 });
  });

  it('should hide multiple items', async () => {
    document.head.innerHTML = '<meta name="breadcrumbs-hidden-entries" content="Actors,Players">';
    const breadcrumb = await breadcrumbs(breadcrumbMock());
    assertBreadcrumb({ breadcrumb, length: 2 });
  });

  it('should hide multiple items with spaces and wrong capitalization', async () => {
    document.head.innerHTML = '<meta name="breadcrumbs-hidden-entries" content="ActOrs, PlaYers">';
    const breadcrumb = await breadcrumbs(breadcrumbMock());
    assertBreadcrumb({ breadcrumb, length: 2 });
  });

  it("should use a custom page title if it's set", async () => {
    document.head.innerHTML = '<meta name="breadcrumbs-page-title" content="Custom Title">';
    const breadcrumb = await breadcrumbs(breadcrumbMock());
    assertBreadcrumb({ breadcrumb, length: 4 });
    expect(breadcrumb.querySelector('ul li:last-of-type').innerText.trim()).to.equal('Custom Title');
  });

  it('should create a breadcrumb SEO element', async () => {
    await breadcrumbs(breadcrumbMock());
    const script = document.querySelector('script');
    expect(script).to.exist;
    expect(script.type).to.equal('application/ld+json');
    expect(JSON.parse(script.innerHTML)).to.deep.equal(
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: '1-from-page',
            item: 'http://www.google.com/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Actors',
            item: 'http://www.adobe.com/',
          },
          { '@type': 'ListItem', position: 3, name: 'Players' },
          { '@type': 'ListItem', position: 4, name: '\n        \n      ' },
        ],
      },
    );
  });

  it("should not create a breadcrumb SEO element if it's disabled", async () => {
    document.head.innerHTML = '<meta name="breadcrumb-seo" content="off">';
    await breadcrumbs(breadcrumbMock());
    expect(document.querySelector('script')).to.not.exist;
  });
});