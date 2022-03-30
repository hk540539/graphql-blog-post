import { gql } from "apollo-server";

export const typeDefs = gql`
  type Query {
    hello: String!
  }

  type Post{
    User
  }

  type User{
    Profile
    [Post]
  }

  type profile{
    User
  }
`;
