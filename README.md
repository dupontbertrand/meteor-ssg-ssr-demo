# Meteor SSG / SSR Demo

A demo Meteor 3.4 + Blaze app showcasing **three rendering modes** side by side:

| Mode | Pages | Behavior |
|------|-------|----------|
| **SSG** (Static Site Generation) | `/about`, `/contact` | Rendered once at server startup. Cached permanently. |
| **SSR** (Server-Side Rendering) | `/articles/:slug` | Rendered at **each request** with fresh data from MongoDB. |
| **Meteor Reactive (DDP)** | `/stocks` | Standard Meteor real-time updates. No page refresh needed. |

## Why?

Meteor is an SPA framework — the initial HTML sent to the browser is empty, content is rendered client-side via JavaScript. This is a problem for **SEO**: crawlers see a blank page.

This demo shows how Meteor can now serve **real HTML content** in the initial response, using a new `static-render` package that hooks into the existing Meteor boilerplate pipeline.

## The Demo

### SSR — Product pages (`/articles/oak-chair`)

The page is split in two:

- **Left side**: the public product page — title, image, price, description. This HTML is **in the initial server response** (check with `View Source` or `F12 > Elements`).
- **Right side**: an admin panel to edit the product description and price.

**Try it**: edit the description, click Save, then **refresh the page** (F5). The left side shows the updated content. The `<title>` tag and `<meta>` tags also update.

### SSG — Static pages (`/about`, `/contact`)

Pre-rendered once at startup. The HTML is in the initial response. No admin panel — these pages never change without a server restart.

### Meteor Reactive — Stocks (`/stocks`)

Standard Meteor DDP reactivity. Change a stock value on the right side — the left side updates **instantly**, no refresh needed. This demonstrates the contrast with SSR where a refresh is required.

## How It Works

### Route configuration

```js
// SSG — rendered once at startup, cached
FlowRouter.route('/about', {
  static: 'ssg',
  template: 'about',
  staticData() {
    return { title: 'About MyShop', description: '...' };
  },
  staticHead() {
    return '<title>About | MyShop</title><meta property="og:title" content="About MyShop">';
  },
});

// SSR — rendered at each request with fresh MongoDB data
FlowRouter.route('/articles/:slug', {
  static: 'ssr',
  template: 'productPage',
  async staticData(params) {
    return await Products.findOneAsync({ slug: params.slug });
  },
  async staticHead(params) {
    const p = await Products.findOneAsync({ slug: params.slug });
    return `<title>${p.title} — $${p.price} | MyShop</title>`;
  },
});

// Normal Meteor — no server rendering
FlowRouter.route('/stocks', { ... });
```

### Server entry point

Templates and routes must be explicitly imported in `server/main.js` so they are available server-side:

```js
import '../lib/templates.html';
import '../lib/routes.js';
```

### What happens at startup

```
[Demo] Seeded 5 products + stocks
[Demo] Server started
[StaticRender] 2 SSG pages pre-rendered, 1 SSR routes registered
```

- SSG pages (`/about`, `/contact`) are rendered and cached.
- SSR route (`/articles/:slug`) is registered for on-the-fly rendering.

## SEO Output

Every SSR product page includes full SEO metadata in the **initial HTML response**:

```html
<title>Oak Chair — $149 | MyShop</title>
<meta name="description" content="Handcrafted solid oak chair with oil finish...">
<meta property="og:title" content="Oak Chair">
<meta property="og:description" content="Handcrafted solid oak chair...">
<meta property="og:image" content="https://placehold.co/600x400/e8d5b7/333?text=Oak+Chair">
```

Crawlers (Google, social media) see this content without executing JavaScript.

## Architecture

### Modified Blaze packages (in `packages/`)

The standard Blaze template compiler only compiles `.html` files for the client. These modified packages make templates available on the server too:

| Package | Change |
|---------|--------|
| `templating-compiler` | Removed `archMatching: 'web'` — compiles for all architectures |
| `templating-tools` | `generateBodyJS` wrapped with `Meteor.isClient` |
| `caching-html-compiler` | Body attrs wrapped with `Meteor.isClient` |
| `templating-runtime` | `Template` exported to server, DOM code guarded |
| `templating` | `Template` exported to server |

### New package: `static-render`

The rendering engine. Provides:

- `Blaze.toHTML()` / `Blaze.toHTMLWithData()` on the server (already works — the Blaze View expansion path is DOM-free)
- SSG: pre-renders pages at startup, serves from cache
- SSR: renders at each request with fresh data, injects into Meteor's boilerplate via `req.dynamicBody` / `req.dynamicHead`
- Graceful error handling with clear messages for client-only APIs used in templates
- Auto-discovery of routes via `FlowRouter._routes`

### Unchanged packages

`blaze`, `htmljs`, `spacebars`, `webapp`, `flow-router-extra` — no modifications needed.

## Setup

```bash
git clone <this-repo>
cd ssg-ssr-demo
meteor npm install
meteor run
```

Open http://localhost:3000

## Products in the demo

| Product | Slug | Price |
|---------|------|-------|
| Oak Chair | `oak-chair` | $149 |
| Walnut Table | `walnut-table` | $899 |
| Copper Lamp | `copper-lamp` | $89 |
| Pine Shelf | `pine-shelf` | $65 |
| Leather Armchair | `leather-armchair` | $1,250 |

## Requirements

- Meteor 3.4+
- No rspack (classic Meteor build — rspack doesn't support `.html` imports server-side yet)
