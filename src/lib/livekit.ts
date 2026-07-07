import { AccessToken } from "livekit-server-sdk";

const apiKey = process.env.LIVEKIT_API_KEY!;
const apiSecret = process.env.LIVEKIT_API_SECRET!;

export async function createStreamerToken(identity: string, roomName: string): Promise<string> {
  const at = new AccessToken(apiKey, apiSecret, {
    identity,
    ttl: "24h",
  });
  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
  });
  return at.toJwt();
}

export async function createViewerToken(identity: string, roomName: string): Promise<string> {
  const at = new AccessToken(apiKey, apiSecret, {
    identity,
    ttl: "6h",
  });
  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: false,
    canSubscribe: true,
  });
  return at.toJwt();
}

export async function createIngressToken(identity: string): Promise<string> {
  const at = new AccessToken(apiKey, apiSecret, {
    identity,
    ttl: "24h",
  });
  at.addGrant({
    roomCreate: true,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    ingressAdmin: true,
  });
  return at.toJwt();
}
