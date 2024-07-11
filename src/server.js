const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const mongoose = require('mongoose');

const app = express();

// MongoDB connection setup
mongoose.connect('mongodb+srv://happykatiyar0:kFSp7J042v2jEGf5@cluster0.hzrtosb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/taskmanager', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Mongoose schema and model setup
const taskSchema = new mongoose.Schema({
  name: String,
  link: String,
  revisionPrimary: Boolean,
  revisionSecondary: Boolean,
});

const Task = mongoose.model('Task', taskSchema);

// GraphQL schema
const typeDefs = gql`
  type Task {
    id: ID!
    name: String!
    link: String!
    revisionPrimary: Boolean!
    revisionSecondary: Boolean!
  }

  type Query {
    tasks: [Task]
  }

  type Mutation {
    addTask(name: String!, link: String!): Task
    editTask(id: ID!, name: String!, link: String!): Task
    deleteTask(id: ID!): Task
    updateTask(id: ID!, revisionPrimary: Boolean, revisionSecondary: Boolean): Task
  }
`;

// GraphQL resolvers
const resolvers = {
  Query: {
    tasks: async () => {
      try {
        return await Task.find();
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    addTask: async (_, { name, link }) => {
      try {
        const task = new Task({ name, link, revisionPrimary: false, revisionSecondary: false });
        await task.save();
        return task;
      } catch (err) {
        throw new Error(err);
      }
    },
    editTask: async (_, { id, name, link }) => {
      try {
        return await Task.findByIdAndUpdate(id, { name, link }, { new: true });
      } catch (err) {
        throw new Error(err);
      }
    },
    deleteTask: async (_, { id }) => {
      try {
        return await Task.findByIdAndDelete(id);
      } catch (err) {
        throw new Error(err);
      }
    },
    updateTask: async (_, { id, revisionPrimary, revisionSecondary }) => {
      try {
        const task = await Task.findById(id);
        if (revisionPrimary !== undefined) task.revisionPrimary = revisionPrimary;
        if (revisionSecondary !== undefined) task.revisionSecondary = revisionSecondary;
        await task.save();
        return task;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

async function startServer() {
  await server.start();
  server.applyMiddleware({ app });
}

startServer().then(() => {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
});
