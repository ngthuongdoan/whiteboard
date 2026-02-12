import { createDecoder, readVarUint, readVarUint8Array } from "lib0/decoding";
import { createEncoder, toUint8Array, writeVarUint, writeVarUint8Array } from "lib0/encoding";
import { Awareness } from "y-protocols/awareness";
import * as awarenessProtocol from "y-protocols/awareness";
import * as syncProtocol from "y-protocols/sync";
import * as Y from "yjs";

const MESSAGE_SYNC = 0;
const MESSAGE_AWARENESS = 1;

export type ConnectionState = "disconnected" | "connecting" | "connected";

export interface RealtimeClientOptions {
  doc: Y.Doc;
  awareness: Awareness;
  roomWsUrl: string;
  reconnectDelayMs?: number;
  onConnectionStateChange?: (state: ConnectionState) => void;
}

export class RealtimeClient {
  private readonly doc: Y.Doc;
  private readonly awareness: Awareness;
  private readonly roomWsUrl: string;
  private readonly reconnectDelayMs: number;
  private readonly onConnectionStateChange?: (state: ConnectionState) => void;
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private closedByUser = false;

  constructor(options: RealtimeClientOptions) {
    this.doc = options.doc;
    this.awareness = options.awareness;
    this.roomWsUrl = options.roomWsUrl;
    this.reconnectDelayMs = options.reconnectDelayMs ?? 1500;
    this.onConnectionStateChange = options.onConnectionStateChange;
    this.bindDoc();
    this.bindAwareness();
  }

  connect() {
    if (this.closedByUser || this.ws) {
      return;
    }

    this.onConnectionStateChange?.("connecting");
    const ws = new WebSocket(this.roomWsUrl);
    ws.binaryType = "arraybuffer";
    this.ws = ws;

    ws.onopen = () => {
      this.onConnectionStateChange?.("connected");
      this.sendSyncStep1();
      this.sendAwarenessUpdate(Array.from(this.awareness.getStates().keys()));
    };

    ws.onmessage = (event) => {
      const data = event.data;
      if (!(data instanceof ArrayBuffer)) {
        return;
      }

      const message = new Uint8Array(data);
      const decoder = createDecoder(message);
      const messageType = readVarUint(decoder);

      if (messageType === MESSAGE_SYNC) {
        const replyEncoder = createEncoder();
        writeVarUint(replyEncoder, MESSAGE_SYNC);
        syncProtocol.readSyncMessage(decoder, replyEncoder, this.doc, this);
        const reply = toUint8Array(replyEncoder);
        if (reply.byteLength > 1) {
          this.send(reply);
        }
        return;
      }

      if (messageType === MESSAGE_AWARENESS) {
        const payload = readVarUint8Array(decoder);
        awarenessProtocol.applyAwarenessUpdate(this.awareness, payload, this);
      }
    };

    ws.onclose = () => {
      this.ws = null;
      this.onConnectionStateChange?.("disconnected");
      if (!this.closedByUser) {
        this.reconnectTimer = setTimeout(() => {
          this.reconnectTimer = null;
          this.connect();
        }, this.reconnectDelayMs);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }

  disconnect() {
    this.closedByUser = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.awareness.destroy();
    this.doc.destroy();
    this.onConnectionStateChange?.("disconnected");
  }

  private bindDoc() {
    this.doc.on("update", (update: Uint8Array, origin: unknown) => {
      if (origin === this) {
        return;
      }
      const encoder = createEncoder();
      writeVarUint(encoder, MESSAGE_SYNC);
      syncProtocol.writeUpdate(encoder, update);
      this.send(toUint8Array(encoder));
    });
  }

  private bindAwareness() {
    this.awareness.on(
      "update",
      (
        { added, updated, removed }: { added: number[]; updated: number[]; removed: number[] },
        origin: unknown,
      ) => {
        if (origin === this) {
          return;
        }
        const changed = [...added, ...updated, ...removed];
        this.sendAwarenessUpdate(changed);
      },
    );
  }

  private sendSyncStep1() {
    const encoder = createEncoder();
    writeVarUint(encoder, MESSAGE_SYNC);
    syncProtocol.writeSyncStep1(encoder, this.doc);
    this.send(toUint8Array(encoder));
  }

  private sendAwarenessUpdate(clientIds: number[]) {
    if (clientIds.length === 0) {
      return;
    }
    const update = awarenessProtocol.encodeAwarenessUpdate(this.awareness, clientIds);
    const encoder = createEncoder();
    writeVarUint(encoder, MESSAGE_AWARENESS);
    writeVarUint8Array(encoder, update);
    this.send(toUint8Array(encoder));
  }

  private send(payload: Uint8Array) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }
    this.ws.send(payload);
  }
}

