import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Products, Stocks } from './collections.js';

// This demo deliberately leaves the write methods open so anyone can try the
// SSR refresh, so every argument is validated and bounded here. Whatever these
// write ends up in a pre-rendered <head>, which is why lib/escape.js exists.
const ShortText = Match.Where((value) => {
  check(value, String);
  return value.length > 0 && value.length <= 300;
});

Meteor.methods({
  // Get product by slug (one-time fetch, not reactive)
  async 'products.getBySlug'(slug) {
    check(slug, String);
    return await Products.findOneAsync({ slug });
  },

  // Update product description (SSR — needs page refresh to see change)
  async 'products.updateDescription'(slug, newDescription) {
    check(slug, String);
    check(newDescription, ShortText);
    return await Products.updateAsync({ slug }, { $set: { description: newDescription } });
  },

  // Update product price (SSR — needs page refresh to see change)
  async 'products.updatePrice'(slug, newPrice) {
    check(slug, String);
    check(newPrice, Match.OneOf(String, Number));
    const price = Number(newPrice);
    if (!Number.isFinite(price) || price < 0) {
      throw new Meteor.Error('invalid-price', 'Price must be a non-negative number.');
    }
    return await Products.updateAsync({ slug }, { $set: { price } });
  },

  // Update stock quantity (Meteor reactive — updates instantly via DDP)
  async 'stocks.updateQuantity'(productSlug, newQuantity) {
    check(productSlug, String);
    check(newQuantity, Match.OneOf(String, Number));
    const quantity = Number(newQuantity);
    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new Meteor.Error('invalid-quantity', 'Quantity must be a non-negative integer.');
    }
    return await Stocks.updateAsync({ productSlug }, { $set: { quantity } });
  },
});
