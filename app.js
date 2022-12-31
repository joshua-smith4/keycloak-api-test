import Fastify from "fastify";
import { Issuer } from "openid-client";
import getClient from "./streamline-openid-client";
import fp from "fastify-plugin";

// cache client
(async () => await getClient())();

export default function build(opts = {}) {
  const bearer_regex = /^[B|b]earer (?<token>.+)$/;
  const app = Fastify(opts);
  app.register(
    fp(async (instance, opts, done) => {
      const client = await getClient();
      instance.decorate("oidc", { client });
      done();
    })
  );
  app.decorateRequest("token", "");
  app.addHook("preHandler", (request, reply, done) => {
    const auth_header = request?.headers?.authorization;
    if (!auth_header) {
      done();
      return;
    }
    const matches = auth_header.match(bearer_regex);
    if (!matches) {
      done();
      return;
    }
    request["token"] = matches.groups.token;
    done();
  });
  app.get("/", async (request, reply) => {
    const client = await getClient();
    const userinfo = await app.oidc.client.requestResource(
      "http://localhost:3001/premium",
      request.token
    );
    console.log("body to string", userinfo.body.toString());
    const { headers } = request;
    return { body: userinfo.body };
  });
  app.get("/premium", async (request, reply) => {
    return { yeah: 1 };
  });
  return app;
}
