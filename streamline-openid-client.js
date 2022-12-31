import { Issuer } from "openid-client";
let client;
export default async function getClient() {
  if (client) return client;
  const keycloakIssuer = await Issuer.discover(
    "http://localhost:8085/realms/test-realm"
  );
  const { Client } = keycloakIssuer;
  client = new Client({
    client_id: "backend",
    client_secret: "8TO7BzYwqYt98otIPI8Ba0Mx7ymRMncY",
  });
  return client;
}
