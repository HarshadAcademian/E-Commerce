import { ApolloServer } from 'apollo-server';
import jwt from 'jsonwebtoken';
import typeDefs from './graphql/typeDefs/index.js';
import resolvers from './graphql/resolvers/index.js';
import db from './models/index.js';

const SECRET_KEY = 'supersecretkey123'; // 👉 Use dotenv in real apps

// Apollo context function to extract user from token
const context = async ({ req }) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  let userId = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      userId = decoded.userId;
    } catch (err) {
      console.warn('⚠️ Invalid token:', err.message);
    }
  }

  return { userId };
};

// Start the Apollo Server
const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('📦 Database connected.');

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context,
    });

    const { url } = await server.listen({ port: 4000 });
    console.log(`🚀 Server ready at ${url}`);
  } catch (err) {
    console.error('❌ Error starting server:', err);
  }
};

startServer();
