import { Context } from "../../index";

interface SignUpArgs {
  email: string;
  name: string;
  password: string;
  bio: string;
}
export const authResolvers = {
  signup: (_: any, {}: SignUpArgs, { prisma }: Context) => {},
};
