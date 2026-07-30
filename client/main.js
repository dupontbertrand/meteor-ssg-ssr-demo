import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Products, Stocks } from '../lib/collections.js';

import './main.html';
import '../lib/templates.html';
import '../lib/routes.js';
import '../lib/methods.js';

// main.html carries no static <title>, because static-render appends
// staticHead() output after the app's <head> rather than merging into it — a
// static title would come first and browsers would show it instead of the
// pre-rendered one. Titles are therefore owned here for every route, which is
// also what keeps them correct across client-side navigation.
const TITLES = {
  home: 'MyShop',
  about: 'About | MyShop',
  contact: 'Contact | MyShop',
  stocks: 'Stocks | MyShop',
  notFound: 'Not found | MyShop',
};

FlowRouter.triggers.enter([(context) => {
  const title = TITLES[context.route.name];
  // productPage sets its own title once the product has loaded.
  if (title) document.title = title;
}]);

// Remove SSR/SSG pre-rendered content once the client takes over.
Meteor.startup(() => {
  document.querySelectorAll('[data-static-render]').forEach(el => el.remove());
});

// =============================================
// Product page (SSR)
// The public side (left) shows data fetched ONCE via method call,
// NOT via reactive subscription, so it doesn't update on save.
// The admin side (right) uses the same one-time data for form defaults.
// =============================================

Template.productPage.onCreated(function () {
  this.product = new ReactiveVar(null);

  // Re-fetch when slug param changes (client-side navigation)
  this.autorun(() => {
    const slug = FlowRouter.getParam('slug');
    if (slug) {
      Meteor.callAsync('products.getBySlug', slug).then(product => {
        this.product.set(product);
        // Update browser tab title on client-side navigation
        if (product) {
          document.title = `${product.title} — $${product.price} | MyShop`;
        }
      });
    }
  });
});

Template.productPage.helpers({
  title() {
    return Template.instance().product.get()?.title;
  },
  description() {
    return Template.instance().product.get()?.description;
  },
  price() {
    return Template.instance().product.get()?.price;
  },
  image() {
    return Template.instance().product.get()?.image;
  },
});

// =============================================
// Product admin panel — own one-time fetch for form defaults
// =============================================

Template.productAdmin.onCreated(function () {
  this.product = new ReactiveVar(null);

  this.autorun(() => {
    const slug = FlowRouter.getParam('slug');
    if (slug) {
      Meteor.callAsync('products.getBySlug', slug).then(product => {
        this.product.set(product);
      });
    }
  });
});

Template.productAdmin.helpers({
  adminDescription() {
    return Template.instance().product.get()?.description || '';
  },
  adminPrice() {
    return Template.instance().product.get()?.price || '';
  },
});

Template.productAdmin.events({
  async 'click .btn-save'(event, instance) {
    const slug = FlowRouter.getParam('slug');
    const newDescription = instance.find('.input-description').value;
    const newPrice = instance.find('.input-price').value;
    const status = instance.find('.save-status');

    // The methods validate their arguments, so a save can genuinely fail —
    // report that instead of announcing success unconditionally.
    try {
      await Meteor.callAsync('products.updateDescription', slug, newDescription);
      await Meteor.callAsync('products.updatePrice', slug, Number(newPrice));
    } catch (e) {
      status.textContent = `Could not save: ${e.reason || e.message}`;
      status.classList.add('visible');
      return;
    }

    status.textContent = 'Saved! Refresh the page (F5) to see the change on the public side.';
    status.classList.add('visible');
    setTimeout(() => status.classList.remove('visible'), 5000);
  },
});

// =============================================
// Stocks page (Meteor reactive) — real-time via DDP
// =============================================

Template.stocksPage.onCreated(function () {
  this.subscribe('allStocks');
});

Template.stocksPage.helpers({
  stocks() {
    return Stocks.find({}, { sort: { productTitle: 1 } });
  },
  stockStatus(quantity) {
    if (quantity <= 0) return 'Out of stock';
    if (quantity < 10) return 'Critical';
    if (quantity < 25) return 'Low';
    return 'OK';
  },
  stockClass(quantity) {
    if (quantity <= 0) return 'stock-rupture';
    if (quantity < 10) return 'stock-critique';
    if (quantity < 25) return 'stock-bas';
    return 'stock-ok';
  },
});

Template.stocksPage.events({
  async 'change .input-stock'(event) {
    const slug = event.currentTarget.dataset.slug;
    const newQty = event.currentTarget.value;
    try {
      await Meteor.callAsync('stocks.updateQuantity', slug, Number(newQty));
    } catch (e) {
      // eslint-disable-next-line no-alert
      console.error('[Demo] stock update rejected:', e.reason || e.message);
    }
  },
});
