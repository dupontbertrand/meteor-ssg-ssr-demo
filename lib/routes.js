import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Products } from './collections.js';

// =============================================
// Home — normal Meteor (no SSG/SSR)
// =============================================

FlowRouter.route('/', {
  name: 'home',
  action() {
    this.render('mainLayout', 'home');
  },
});

// =============================================
// SSG — About & Contact (rendered once at startup)
// =============================================

FlowRouter.route('/about', {
  name: 'about',
  static: 'ssg',
  template: 'about',
  staticData() {
    return {
      title: 'About MyShop',
      description: 'MyShop is an artisan furniture store founded in 2020. We curate handcrafted furniture and decor made by skilled craftspeople. Every piece is unique.',
    };
  },
  staticHead() {
    return '<title>About | MyShop</title>' +
      '<meta name="description" content="MyShop — handcrafted artisan furniture store.">' +
      '<meta property="og:title" content="About MyShop">' +
      '<meta property="og:description" content="Handcrafted artisan furniture since 2020.">';
  },
  action() {
    this.render('mainLayout', 'about');
  },
});

FlowRouter.route('/contact', {
  name: 'contact',
  static: 'ssg',
  template: 'contact',
  staticData() {
    return {
      title: 'Contact Us',
      email: 'Email: hello@myshop.com',
      phone: 'Phone: +1 (555) 123-4567',
      address: 'Address: 42 Craftsman Lane, Brooklyn, NY 11201',
    };
  },
  staticHead() {
    return '<title>Contact | MyShop</title>' +
      '<meta name="description" content="Contact MyShop — email, phone, address.">' +
      '<meta property="og:title" content="Contact MyShop">';
  },
  action() {
    this.render('mainLayout', 'contact');
  },
});

// =============================================
// SSR — Product pages (rendered at each request)
// =============================================

FlowRouter.route('/articles/:slug', {
  name: 'productPage',
  static: 'ssr',
  template: 'productPage',
  async staticData(params) {
    return await Products.findOneAsync({ slug: params.slug });
  },
  async staticHead(params) {
    const p = await Products.findOneAsync({ slug: params.slug });
    if (!p) return '<title>Product not found | MyShop</title>';
    return `<title>${p.title} — $${p.price} | MyShop</title>` +
      `<meta name="description" content="${p.description}">` +
      `<meta property="og:title" content="${p.title}">` +
      `<meta property="og:description" content="${p.description}">` +
      `<meta property="og:image" content="${p.image}">`;
  },
  action() {
    this.render('mainLayout', 'productPage');
  },
});

// =============================================
// Meteor Reactive — Stocks (normal DDP)
// =============================================

FlowRouter.route('/stocks', {
  name: 'stocks',
  action() {
    this.render('mainLayout', 'stocksPage');
  },
});

// =============================================
// 404
// =============================================

FlowRouter.route('*', {
  name: 'notFound',
  action() {
    this.render('mainLayout', 'notFound');
  },
});
