const { gql } = require('apollo-server');

const typeDefs = gql`
  scalar DateTime

  type User {
    id: ID!
    email: String!
    name: String
    createdAt: DateTime!
  }

  type Product {
    id: ID!
    name: String!
    description: String
    priceCents: Int!
    sku: String!
    inventory: Int!
    imageUrl: String
  }

  type CartItem {
    id: ID!
    product: Product!
    quantity: Int!
  }

  type Cart {
    id: ID!
    userId: ID!
    items: [CartItem!]!
    updatedAt: DateTime!
  }

  type OrderItem {
    id: ID!
    name: String!
    priceCents: Int!
    quantity: Int!
  }

  type Order {
    id: ID!
    userId: ID!
    totalCents: Int!
    status: String!
    items: [OrderItem!]!
    createdAt: DateTime!
  }

  type Query {
    products(search: String, skip: Int, take: Int): [Product!]!
    product(id: ID!): Product
    cart(userId: ID!): Cart
    orders(userId: ID!): [Order!]!
    order(id: ID!): Order
  }

  input AddToCartInput {
    productId: ID!
    quantity: Int!
    userId: ID!
  }

  type Mutation {
    addToCart(input: AddToCartInput!): Cart!
    removeFromCart(itemId: ID!): Cart!
    checkout(userId: ID!): Order!
  }
`;

module.exports = typeDefs;
