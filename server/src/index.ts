// Import config & customs
import "reflect-metadata";
import { __prod__ } from "./constants";
import mikroConfig from "./mikro-orm.config";
import { MyContext } from "./types";

// Import functionality
import { MikroORM } from "@mikro-orm/core";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import express from "express";
import session from "express-session";
import { createClient } from "redis";
import connectRedis from "connect-redis";
import cors from "cors";

// Import resolvers
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";

const main = async () => {
  const orm = await MikroORM.init(mikroConfig);

  // Refreshes migrations
  await orm.getMigrator().up();

  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = createClient({ legacyMode: true });

  // cors apply on all routes
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  redisClient.connect().catch(console.error);

  app.use(
    session({
      name: "qid",
      store: new RedisStore({ client: redisClient as any, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 Years
        httpOnly: true,
        sameSite: "lax", // csrf
        secure: __prod__, // only works in https in production
      },
      saveUninitialized: false,
      secret: "ighwuqigohqghqighuwoqgh",
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    plugins: [
      ApolloServerPluginLandingPageGraphQLPlayground({
        // apollo server sucks, instead use graphql playground
      }),
    ],
    context: ({ req, res }: MyContext) => ({ em: orm.em, req, res }),
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(4000, () => {
    console.log("Server started on localhost:4000");
  });
};

main().catch((err) => {
  console.log(err);
});
