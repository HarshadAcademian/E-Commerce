import gql from 'graphql-tag';

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    role: String
    cart: Cart
    orders: [Order]
  }

  type Category {
    id: ID!
    name: String!
    products: [Product]
  }

  type Product {
    id: ID!
    name: String!
    description: String
    price: Float!
    stock: Int!
    imageUrl: String
    category: Category
  }

  type Cart {
    id: ID!
    user: User!
    items: [CartItem]
  }

  type CartItem {
    id: ID!
    cart: Cart
    product: Product
    quantity: Int!
  }

  type Order {
    id: ID!
    user: User!
    total: Float!
    items: [OrderItem]
  }

  type OrderItem {
    id: ID!
    order: Order
    product: Product
    quantity: Int!
    price: Float!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    users: [User]
    categories: [Category]
    products: [Product]
    cart: Cart
    orders: [Order]
  }

  type Mutation {
    registerUser(name: String!, email: String!, password: String!, role: String): User
    login(email: String!, password: String!): AuthPayload

    addCategory(name: String!): Category
    addProduct(
      name: String!
      description: String
      price: Float!
      stock: Int!
      imageUrl: String
      categoryId: Int!
    ): Product

    updateProductStock(productId: ID!, quantity: Int!): Product

    addToCart(productId: ID!, quantity: Int!): Cart
    removeFromCart(productId: ID!): Cart
    updateCartItem(productId: ID!, quantity: Int!): Cart
    placeOrder: Order
  }
`;

export default typeDefs;
