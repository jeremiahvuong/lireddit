// Import funcitonality and customs
import { __prod__ } from "./constants";
import { MikroORM } from "@mikro-orm/core";
import path from "path";

// Import entities
import { Post } from "./entities/post";
import { User } from "./entities/User";

export default {
  migrations: {
    path: path.join(__dirname, "./migrations"), // path to the folder with migrations
    glob: "!(*.d).{js,ts}", // how to match migration files (all .js and .ts files, but not .d.ts)
  },
  entities: [Post, User],
  dbName: "lireddit",
  type: "postgresql",
  debug: !__prod__,
  allowGlobalContext: true,
} as Parameters<typeof MikroORM.init>[0];
