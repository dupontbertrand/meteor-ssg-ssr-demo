import { Meteor } from 'meteor/meteor';
import { Products, Stocks } from './collections.js';

Meteor.methods({
  // Update product description (SSR — needs page refresh to see change)
  async 'products.updateDescription'(slug, newDescription) {
    return await Products.updateAsync({ slug }, { $set: { description: newDescription } });
  },

  // Update product price (SSR — needs page refresh to see change)
  async 'products.updatePrice'(slug, newPrice) {
    return await Products.updateAsync({ slug }, { $set: { price: Number(newPrice) } });
  },

  // Update stock quantity (Meteor reactive — updates instantly via DDP)
  async 'stocks.updateQuantity'(productSlug, newQuantity) {
    return await Stocks.updateAsync(
      { productSlug },
      { $set: { quantity: Number(newQuantity) } }
    );
  },
});
