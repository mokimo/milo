import { getConfig, getMetadata } from '../../../../utils/utils.js';
import { toFragment, lanaLog } from '../../utilities/utilities.js';

const metadata = {
  seo: 'breadcrumb-seo',
  fromFile: 'breadcrumbs-from-file',
  hideCurrent: 'breadcrumbs-hide-current-page',
  hiddenEntries: 'breadcrumbs-hidden-entries',
  pageTitle: 'breadcrumbs-page-title',
};

function getParent(path) {
  if (!path || path.length === 0 || path === '/') return null;
  const elements = path.split('/').filter((n) => n);
  elements.pop();
  return elements.length === 0 ? '/' : `/${elements.join('/')}`;
}

async function getFile(path) {
  const parent = getParent(path);
  if (!parent) return null;
  const prefix = parent === '/' ? '' : parent;
  const resp = await fetch(`${prefix}/breadcrumbs.plain.html`);
  if (resp.ok) return resp.text();
  return getFile(parent);
}

const setBreadcrumbSEO = (breadcrumb) => {
  const seoDisabled = getMetadata(metadata.seo) === 'off';
  if (seoDisabled || !breadcrumb) return;
  const breadcrumbSEO = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [],
  };
  const items = breadcrumb.querySelectorAll('ul > li');
  // TODO, remove invisible paths from SEO element?
  items.forEach((item, idx) => {
    const link = item.querySelector('a');
    breadcrumbSEO.itemListElement.push({
      '@type': 'ListItem',
      position: idx + 1,
      name: link ? link.innerHTML : item.innerHTML,
      item: link?.href,
    });
  });
  const script = toFragment`<script type="application/ld+json">${JSON.stringify(
    breadcrumbSEO,
  )}</script>`;
  document.head.append(script);
};

const removeHiddenEntries = ({ ul }) => {
  // hide-page,other-hidden-page => ['hide-page', 'other-hidden-page']
  const hiddenEntries = getMetadata(metadata.hiddenEntries)
    ?.toLowerCase()
    .replaceAll(' ', '')
    .split(',') || [];
  ul.querySelectorAll('li').forEach(
    (li) => hiddenEntries.includes(li.innerText?.toLowerCase().trim()) && li.remove(),
  );
};

const createBreadcrumbs = (element) => {
  if (!element) return null;
  const ul = element.querySelector('ul');

  if (getMetadata(metadata.hideCurrent) !== 'on') {
    ul.append(toFragment`
      <li>
        ${getMetadata(metadata.pageTitle) || document.title}
      </li>
    `);
  }

  removeHiddenEntries({ ul });
  const breadcrumbs = toFragment`
    <div class="feds-breadcrumbs-wrapper">
      <nav class="feds-breadcrumbs" aria-label="Breadcrumb">${ul}</nav>
    </div>
  `;
  ul.querySelector('li:last-of-type')?.setAttribute('aria-current', 'page');
  return breadcrumbs;
};

const fromFile = async () => {
  if ((getMetadata(metadata.fromFile) || getConfig()[metadata.fromFile]) !== 'on') return null;
  const html = await getFile(document.location.pathname);
  if (!html) return null;
  return createBreadcrumbs(new DOMParser().parseFromString(html, 'text/html'));
};

const fromUrl = () => {
  const list = toFragment`<ul></ul>`;
  const paths = document.location.pathname.split('/').filter((n) => n);
  for (let i = 0; i < paths.length; i += 1) {
    list.append(toFragment`
      <li>
        <a href="/${paths.slice(0, i + 1).join('/')}">${paths[i]}</a>
      </li>
    `);
  }
  return createBreadcrumbs(toFragment`<div>${list}</div>`);
};

export default async function init(element) {
  try {
    const breadcrumbsEl = createBreadcrumbs(element) || (await fromFile()) || fromUrl();
    setBreadcrumbSEO(breadcrumbsEl);
    return breadcrumbsEl;
  } catch (e) {
    lanaLog({ e, message: 'GNAV breadcrumbs failed rendering' });
    return null;
  }
}
