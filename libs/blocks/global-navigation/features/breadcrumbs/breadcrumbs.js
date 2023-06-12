import { createTag, getConfig, getMetadata } from '../../../../utils/utils.js';
import { toFragment } from '../../utilities/utilities.js';

const BREADCRUMBS_HIDE_LAST = 'breadcrumbs-hide-last';

function getParent(path) {
  if (!path || path.length === 0 || path === '/') {
    return null;
  }
  const elements = path.split('/').filter((n) => n);
  elements.pop();
  if (elements.length === 0) {
    return '/';
  }
  return `/${elements.join('/')}`;
}

function getTitle(defaultTitle) {
  return getMetadata('breadcrumbs-title', document)
  || document.getElementsByTagName('title')[0]?.innerHTML
  || defaultTitle;
}

async function getItem(path) {
  if (path === null) return null;
  const defaultTitle = path.split('/').pop();
  const defaultItem = {
    path,
    title: defaultTitle,
  };
  const res = await fetch(path);
  if (!res.ok) return defaultItem;
  const html = await res.text();
  if (!html) return defaultItem;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  if (!doc) return defaultItem;
  const hideInNav = getMetadata('breadcrumbs-hide-page', doc) === 'on';
  const hideLastPage = getMetadata(BREADCRUMBS_HIDE_LAST, doc) === 'on';
  return {
    path,
    title: getTitle(defaultTitle),
    hideInNav,
    hideLastPage,
  };
}

async function getItems(pagePath) {
  const items = [];
  let path = pagePath;
  while (path !== null) {
    // eslint-disable-next-line no-await-in-loop
    const item = await getItem(path);
    if (item) items.push(item);
    path = getParent(path);
  }
  items.reverse();
  return items;
}

async function fromUrl(pagePath) {
  console.log({ pagePath });
  const items = await getItems(pagePath);
  if (!items || items.length === 0) return null;
  const ul = createTag('ul');
  const last = items.length - 1;
  items.forEach((item, idx) => {
    if (item.hideInNav) return;
    const li = createTag('li');
    if (idx === last) {
      if (!item.hideLastPage) {
        li.textContent = `${item.title}`;
        li.setAttribute('aria-current', 'page');
      }
    } else {
      const a = createTag('a', { href: item.path });
      a.textContent = `${item.title}`;
      li.append(a);
    }
    ul.append(li);
  });
  return createTag('nav', { class: 'breadcrumbs', 'aria-label': 'Breadcrumb' }, ul);
}

async function getFile(path) {
  const parent = getParent(path);
  if (!parent) return null;
  const prefix = (parent === '/') ? '' : parent;
  const resp = await fetch(`${prefix}/breadcrumbs.plain.html`);
  if (resp.ok) return resp.text();
  return getFile(parent);
}

const setBreadcrumbSEO = (breadcrumb) => {
  const seoEnabled = getMetadata('breadcrumb-seo') !== 'off';
  if (!seoEnabled || !breadcrumb) return;
  const breadcrumbSEO = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [] };
  const items = breadcrumb.querySelectorAll('ul > li');
  items.forEach((item, idx) => {
    const link = item.querySelector('a');
    breadcrumbSEO.itemListElement.push({
      '@type': 'ListItem',
      position: idx + 1,
      name: link ? link.innerHTML : item.innerHTML,
      item: link?.href,
    });
  });
  const script = toFragment`<script type="application/ld+json">${JSON.stringify(breadcrumbSEO)}</script>`;
  document.head.append(script);
};

function fromBlock(element) {
  if (!element) return null;
  const ul = element.querySelector('ul');
  ul.querySelector(':scope li:last-of-type')?.setAttribute('aria-current', 'page');
  return toFragment`<div class="feds-breadcrumbs-wrapper"><nav class="feds-breadcrumbs" aria-label="Breadcrumb">${ul}</nav></div>`;
}
const isEnabled = () => {
  const metadata = getMetadata('breadcrumbs')?.toLowerCase();
  const conf = getConfig().breadcrumbs;
  // TODO, metadata = off takes precedence
  if (metadata === 'off') return false;
  // TODO removed metadata === 'true && conf === 'true'
  return metadata === 'on' || conf === 'on';
};

// page metadata: breadcrumbs-hide-last = on
// hide the last item
const hideLastEntry = ({ breadcrumbs, title }) => {
  const ul = breadcrumbs.querySelector('ul');
  if (!ul || getMetadata(BREADCRUMBS_HIDE_LAST) === 'on') return;
  ul.querySelector('[aria-current="page"]')?.removeAttribute('aria-current');
  ul.append(toFragment`<li aria-current="page">${title}</li>`);
};

async function fromFile() {
  if (!isEnabled()) return null;

  const html = await getFile(document.location.pathname);
  console.log(html);
  if (!html) return null;

  const defaultTitle = document.location.pathname.split('/').pop();
  const title = getTitle(defaultTitle);
  const breadcrumbs = fromBlock(new DOMParser().parseFromString(html, 'text/html'));
  hideLastEntry({ breadcrumbs, title });
  return breadcrumbs;
}

async function getBreadcrumbs(element) {
  console.log({ element });
  return fromBlock(element) // CHECKED
    || fromFile() // CHECKED
    || fromUrl(document.location.pathname);

  const breadcrumbsMetadata = getMetadata('breadcrumbs')?.toLowerCase();
  if (breadcrumbsMetadata === 'on' || breadcrumbsMetadata === 'true') {
    return await getBreadcrumbsFromFile()
      || await getBreadcrumbsFromUrl(document.location.pathname)
      || null;
  }
  if (breadcrumbsMetadata === 'off' || breadcrumbsMetadata === 'false') {
    return null;
  }
  const breadcrumbsConf = getConfig().breadcrumbs;
  if (breadcrumbsConf === 'on' || breadcrumbsConf === 'true') {
    return await getBreadcrumbsFromFile()
      || await getBreadcrumbsFromUrl(document.location.pathname)
      || null;
  }
  return null;
}

export default async function init(element) {
  const breadcrumbsEl = await getBreadcrumbs(element);
  setBreadcrumbSEO(breadcrumbsEl);
  return breadcrumbsEl;
}

// decorateBreadcrumbs = () => {
//   this.setBreadcrumbSEO();
//   const parent = this.el.querySelector('.breadcrumbs');
//   if (parent) {
//     const ul = parent.querySelector('ul');
//     if (ul) {
//       ul.querySelector('li:last-of-type')?.setAttribute('aria-current', 'page');
//       this.elements.breadcrumbsWrapper = toFragment`<div class="feds-breadcrumbs-wrapper">
//           <nav class="feds-breadcrumbs" aria-label="Breadcrumb">${ul}</nav>
//         </div>`;
//       parent.remove();
//       return this.elements.breadcrumbsWrapper;
//     }
//   }

//   return null;
// };
