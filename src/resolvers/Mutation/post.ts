import { Post, Prisma } from "@prisma/client";
import { Context } from "../../index";
import { canUserMutatePost } from "../../utils/canUserMutatePost";

interface PostArgs {
  post: { title?: string; content?: string };
}

interface PostPayloadType {
  userErrors: { message: string }[];
  post: Post | Prisma.Prisma__PostClient<Post> | null;
}

export const postResolvers = {
  postCreate: async (
    parent: any,
    { post }: PostArgs,
    { prisma, userInfo }: Context
  ): Promise<PostPayloadType> => {
    if (!userInfo) {
      return {
        userErrors: [{ message: "Forbidden access(unauthenticated)" }],
        post: null,
      };
    }
    const { title, content } = post;
    if (!title || !content) {
      return {
        userErrors: [
          { message: "You must provide title and a content to create a post" },
        ],
        post: null,
      };
    }

    return {
      userErrors: [],
      post: prisma.post.create({
        data: { title, content, authorId: userInfo.userId },
      }),
    };
  },
  postUpdate: async (
    _: any,
    { post, postId }: { postId: string; post: PostArgs["post"] },
    { prisma, userInfo }: Context
  ): Promise<PostPayloadType> => {
    if (!userInfo) {
      return {
        userErrors: [{ message: "Forbidden access(unauthenticated)" }],
        post: null,
      };
    }
    const error = await canUserMutatePost({
      userId: userInfo.userId,
      postId: Number(postId),
      prisma,
    });
    if (error) {
      return error;
    }
    const { title, content } = post;
    if (!title && !content) {
      return {
        userErrors: [
          { message: "You must provide title or content to update a post" },
        ],
        post: null,
      };
    }
    const existingPost = await prisma.post.findUnique({
      where: { id: Number(postId) },
    });
    if (!existingPost) {
      return {
        userErrors: [{ message: "Post doesn't exists" }],
        post: null,
      };
    }
    return {
      userErrors: [],
      post: prisma.post.update({
        data: {
          ...(title && { title }),
          ...(content && { content }),
        },
        where: { id: Number(postId) },
      }),
    };
  },
  postDelete: async (
    _: any,
    { postId }: { postId: string },
    { prisma, userInfo }: Context
  ): Promise<PostPayloadType> => {
    if (!userInfo) {
      return {
        userErrors: [{ message: "Forbidden access(unauthenticated)" }],
        post: null,
      };
    }
    const error = await canUserMutatePost({
      userId: userInfo.userId,
      postId: Number(postId),
      prisma,
    });
    if (error) {
      return error;
    }
    const post = await prisma.post.findUnique({
      where: { id: Number(postId) },
    });

    if (!post) {
      return {
        userErrors: [{ message: "Post doesn't exists" }],
        post: null,
      };
    }
    await prisma.post.delete({ where: { id: Number(postId) } });

    return {
      userErrors: [],
      post: post,
    };
  },
  postPublish: async (
    _: any,
    { postId }: { postId: string },
    { prisma, userInfo }: Context
  ): Promise<PostPayloadType> => {
    if (!userInfo) {
      return {
        userErrors: [{ message: "Forbidden access(unauthenticated)" }],
        post: null,
      };
    }
    const error = await canUserMutatePost({
      userId: userInfo.userId,
      postId: Number(postId),
      prisma,
    });
    if (error) {
      return error;
    }
    const existingPost = await prisma.post.findUnique({
      where: { id: Number(postId) },
    });
    if (!existingPost) {
      return {
        userErrors: [{ message: "Post doesn't exists" }],
        post: null,
      };
    }
    return {
      userErrors: [],
      post: prisma.post.update({
        data: {
          published: true,
        },
        where: { id: Number(postId) },
      }),
    };
  },
  postUnpublish: async (
    _: any,
    { postId }: { postId: string },
    { prisma, userInfo }: Context
  ): Promise<PostPayloadType> => {
    if (!userInfo) {
      return {
        userErrors: [{ message: "Forbidden access(unauthenticated)" }],
        post: null,
      };
    }
    const error = await canUserMutatePost({
      userId: userInfo.userId,
      postId: Number(postId),
      prisma,
    });
    if (error) {
      return error;
    }
    const existingPost = await prisma.post.findUnique({
      where: { id: Number(postId) },
    });
    if (!existingPost) {
      return {
        userErrors: [{ message: "Post doesn't exists" }],
        post: null,
      };
    }
    return {
      userErrors: [],
      post: prisma.post.update({
        data: {
          published: false,
        },
        where: { id: Number(postId) },
      }),
    };
  },
};
