import { gql } from "apollo-server";

export const typeDefs = gql`
  type Query {
    hello: String!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    createdAt: String!
    published: Boolean!
    user: User!
  }

  type User {
    id: ID!
    name: String
    email: String!
    createdAt: String!
    profile: Profile!
    post: [Post!]!
  }

  type profile {
    id: ID!
    bio: String!
    user: User!
  }
`;
