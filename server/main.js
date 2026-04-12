import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Products, Stocks } from '../lib/collections.js';
import '../lib/templates.html';
import '../lib/routes.js';
import '../lib/methods.js';

// Publish all stocks for reactive updates
Meteor.publish('allStocks', function () {
  return Stocks.find();
});

// Publish all products for client-side display
Meteor.publish('allProducts', function () {
  return Products.find();
});

// Seed data
Meteor.startup(async () => {
  const count = await Products.find().countAsync();
  if (count === 0) {
    const products = [
      {
        slug: 'oak-chair',
        title: 'Oak Chair',
        description: 'Handcrafted solid oak chair with oil finish. Comfort and elegance for your dining room.',
        price: 149,
        image: 'https://placehold.co/600x400/e8d5b7/333?text=Oak+Chair',
      },
      {
        slug: 'walnut-table',
        title: 'Walnut Table',
        description: 'Solid walnut farmhouse table, seats 6. Thick 3cm top with turned legs.',
        price: 899,
        image: 'https://placehold.co/600x400/8B7355/fff?text=Walnut+Table',
      },
      {
        slug: 'copper-lamp',
        title: 'Copper Lamp',
        description: 'Brushed copper desk lamp with linen shade. Warm lighting and retro design.',
        price: 89,
        image: 'https://placehold.co/600x400/B87333/fff?text=Copper+Lamp',
      },
      {
        slug: 'pine-shelf',
        title: 'Pine Shelf',
        description: 'Natural pine wall shelf, 3 tiers. Perfect for books and decorative objects.',
        price: 65,
        image: 'https://placehold.co/600x400/DEB887/333?text=Pine+Shelf',
      },
      {
        slug: 'leather-armchair',
        title: 'Leather Armchair',
        description: 'Full-grain cognac leather club chair. Deep seat, wide armrests.',
        price: 1250,
        image: 'https://placehold.co/600x400/8B4513/fff?text=Leather+Armchair',
      },
    ];

    for (const p of products) {
      await Products.insertAsync(p);
      await Stocks.insertAsync({
        productSlug: p.slug,
        productTitle: p.title,
        quantity: Math.floor(Math.random() * 50) + 5,
      });
    }
    console.log('[Demo] Seeded 5 products + stocks');
  }

  console.log('[Demo] Server started');
});
