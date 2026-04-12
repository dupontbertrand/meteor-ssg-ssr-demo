import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Products, Stocks } from '../lib/collections.js';

import './main.html';
import '../lib/templates.html';
import '../lib/routes.js';
import '../lib/methods.js';

// =============================================
// Product page (SSR) — admin panel events
// =============================================

Template.productPage.onCreated(function () {
  this.subscribe('allProducts');
});

Template.productPage.helpers({
  title() { return this.title || Products.findOne({ slug: FlowRouter.getParam('slug') })?.title; },
  description() { return this.description || Products.findOne({ slug: FlowRouter.getParam('slug') })?.description; },
  price() { return this.price || Products.findOne({ slug: FlowRouter.getParam('slug') })?.price; },
  image() { return this.image || Products.findOne({ slug: FlowRouter.getParam('slug') })?.image; },
});

Template.productPage.events({
  'click .btn-save'(event, instance) {
    const slug = FlowRouter.getParam('slug');
    const newDescription = instance.find('.input-description').value;
    const newPrice = instance.find('.input-price').value;

    Meteor.call('products.updateDescription', slug, newDescription);
    Meteor.call('products.updatePrice', slug, Number(newPrice));

    const status = instance.find('.save-status');
    status.textContent = 'Saved! Refresh the page (F5) to see the change on the public side.';
    status.classList.add('visible');
    setTimeout(() => status.classList.remove('visible'), 5000);
  },
});

// =============================================
// Stocks page (Meteor reactive) — subscriptions & helpers
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
  'change .input-stock'(event) {
    const slug = event.currentTarget.dataset.slug;
    const newQty = event.currentTarget.value;
    Meteor.call('stocks.updateQuantity', slug, Number(newQty));
  },
});
