const DEFAULT_BACKEND_URL = "https://whiteboard-be-dvh7.onrender.com";

function normalizeBaseUrl(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getBackendBaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_WHITEBOARD_BE_URL ?? DEFAULT_BACKEND_URL;
  return normalizeBaseUrl(value);
}

export function getBackendAuthToken(): string | undefined {
  const token = process.env.NEXT_PUBLIC_WHITEBOARD_BE_AUTH_TOKEN;
  return token && token.length > 0 ? token : undefined;
}

export function getRoomsApiUrl(): string {
  return `${getBackendBaseUrl()}/rooms`;
}

export function buildRoomWsUrl(roomId: string): string {
  const base = new URL(getBackendBaseUrl());
  const wsProtocol = base.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = new URL("/ws", base);
  wsUrl.protocol = wsProtocol;
  wsUrl.searchParams.set("roomId", roomId);

  const token = getBackendAuthToken();
  if (token) {
    wsUrl.searchParams.set("token", token);
  }

  return wsUrl.toString();
}
