import { Context } from "../../index";
import validator from "validator";
import { Prisma, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";
import { JWT_SIGNATURE } from "../../keys";

interface SignUpArgs {
  name: string;
  bio: string;
  credentials: {
    email: string;
    password: string;
  };
}

interface SignInArgs {
  credentials: {
    email: string;
    password: string;
  };
}

interface UserPayload {
  userErrors: {
    message: string;
  }[];
  token: string | null;
}
export const authResolvers = {
  signup: async (
    _: any,
    { credentials, bio, name }: SignUpArgs,
    { prisma }: Context
  ): Promise<UserPayload> => {
    const { email, password } = credentials;
    const isEmail = validator.isEmail(email);
    if (!isEmail) {
      return {
        userErrors: [{ message: "Invalid email" }],
        token: null,
      };
    }

    const isValidPassword = validator.isLength(password, { min: 5 });

    if (!isValidPassword) {
      return {
        userErrors: [{ message: "Invalid password" }],
        token: null,
      };
    }

    if (!name || !bio) {
      return {
        userErrors: [{ message: "Invalid name or bio" }],
        token: null,
      };
    }
    const hashedPassword = await bcrypt.hash(password, 8);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    await prisma.profile.create({ data: { bio: bio, userId: user.id } });

    const token = await JWT.sign({ userId: user.id }, JWT_SIGNATURE!, {
      expiresIn: 360000,
    });
    return {
      userErrors: [],
      token: token,
    };
  },
  signin: async (
    _: any,
    { credentials }: SignInArgs,
    { prisma }: Context
  ): Promise<UserPayload> => {
    const { email, password } = credentials;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return {
        userErrors: [{ message: "Invalid Credentials" }],
        token: null,
      };
    }
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch);
    if (!isMatch) {
      return {
        userErrors: [{ message: "Invalid Credentials" }],
        token: null,
      };
    }

    const token = await JWT.sign({ userId: user.id }, JWT_SIGNATURE!, {
      expiresIn: 360000,
    });

    return {
      userErrors: [],
      token: token,
    };
  },
};
