import { Mongo } from 'meteor/mongo';

export const Products = new Mongo.Collection('products');
export const Stocks = new Mongo.Collection('stocks');
