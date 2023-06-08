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

function getItemTitle(doc, defaultTitle) {
  const title = getMetadata('breadcrumbs-title', doc);
  if (title) return title;
  const titleElt = doc.getElementsByTagName('title');
  if (!titleElt || !titleElt[0]) return defaultTitle;
  return titleElt[0].innerHTML;
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
    title: getItemTitle(doc, defaultTitle),
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
  console.log({ metadata, conf });
  return metadata === 'on' || metadata === 'true' || conf === 'on' || conf === 'true';
};

async function fromFile() {
  console.log('oh');
  if (!isEnabled()) return null;
  console.log('oh-2');
  const defaultTitle = document.location.pathname.split('/').pop();
  const title = getItemTitle(document, defaultTitle);
  const html = await getFile(document.location.pathname);
  if (!html) return null;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const breadcrumbs = fromBlock(doc);
  if (!breadcrumbs) return null;
  // add the breadcrumbs item for the current page
  const hideLastPage = getMetadata(BREADCRUMBS_HIDE_LAST) === 'on';
  if (!hideLastPage) {
    const ul = breadcrumbs.querySelector(':scope ul');
    if (!ul) return null;
    const li = createTag('li', { 'aria-current': 'page' }, title);
    ul.append(li);
  }
  return breadcrumbs;
}

async function getBreadcrumbs(element) {
  console.log(element);
  return fromBlock(element)
    || fromFile()
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
