/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import QRCode from 'qrcode';
import { P2PMessage, BallState } from './types';

export type MultiplayerRole = 'host' | 'guest' | 'none';
export type ConnectionStatus = 'disconnected' | 'creating' | 'waiting_guest' | 'connecting' | 'connected' | 'error';

export interface MultiplayerCallbacks {
  onStatusChange: (status: ConnectionStatus, message?: string) => void;
  onMessage: (msg: P2PMessage) => void;
  onPeerConnected: (role: MultiplayerRole) => void;
  onPeerDisconnected: () => void;
}

class MultiplayerEngine {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private role: MultiplayerRole = 'none';
  private status: ConnectionStatus = 'disconnected';
  private callbacks: MultiplayerCallbacks | null = null;
  private heartbeatInterval: number | null = null;

  public localOfferCode: string = '';
  public localOfferQrUrl: string = '';
  public localAnswerCode: string = '';
  public localAnswerQrUrl: string = '';

  public init(callbacks: MultiplayerCallbacks) {
    this.callbacks = callbacks;
    // BroadcastChannel allows zero-latency local testing across two browser tabs/windows
    if (typeof BroadcastChannel !== 'undefined') {
      this.broadcastChannel = new BroadcastChannel('pool_legends_local_channel');
      this.broadcastChannel.onmessage = (event) => {
        try {
          const msg = event.data as P2PMessage;
          if (msg && msg.type) {
            this.callbacks?.onMessage(msg);
          }
        } catch {
          // ignore malformed
        }
      };
    }
  }

  // Create Room as Host (Phone 1)
  public async createRoom(): Promise<{ offerCode: string; qrUrl: string }> {
    this.close();
    this.role = 'host';
    this.setStatus('creating', 'Creating offline local room...');

    try {
      // Offline direct ICE (no external internet STUN required on local Wi-Fi/Hotspot)
      const pc = new RTCPeerConnection({
        iceServers: [],
      });
      this.peerConnection = pc;

      // Create reliable ordered data channel
      const dc = pc.createDataChannel('pool_legends_p2p', {
        ordered: true,
      });
      this.setupDataChannel(dc);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Wait for local ICE candidates to gather
      await this.waitForIceGathering(pc);

      const fullOffer = pc.localDescription;
      if (!fullOffer) throw new Error('Failed to generate local SDP offer');

      // Compact JSON representation
      const compactPayload = JSON.stringify({
        t: 'offer',
        sdp: fullOffer.sdp,
      });
      this.localOfferCode = btoa(unescape(encodeURIComponent(compactPayload)));

      // Generate visual QR Code for Phone 2 to scan
      this.localOfferQrUrl = await QRCode.toDataURL(this.localOfferCode, {
        margin: 1,
        width: 320,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });

      this.setStatus('waiting_guest', 'Waiting for Friend to scan QR or enter code...');
      return { offerCode: this.localOfferCode, qrUrl: this.localOfferQrUrl };
    } catch (err: any) {
      this.setStatus('error', `Failed to create room: ${err?.message || err}`);
      throw err;
    }
  }

  // Join Room as Guest (Phone 2) by accepting Host's Offer
  public async joinRoom(hostOfferCode: string): Promise<{ answerCode: string; qrUrl: string }> {
    this.close();
    this.role = 'guest';
    this.setStatus('connecting', 'Connecting to host...');

    try {
      const decodedStr = decodeURIComponent(escape(atob(hostOfferCode.trim())));
      const parsed = JSON.parse(decodedStr);

      if (!parsed.sdp) throw new Error('Invalid room code structure');

      const pc = new RTCPeerConnection({
        iceServers: [],
      });
      this.peerConnection = pc;

      pc.ondatachannel = (event) => {
        this.setupDataChannel(event.channel);
      };

      await pc.setRemoteDescription(new RTCSessionDescription({
        type: 'offer',
        sdp: parsed.sdp,
      }));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      await this.waitForIceGathering(pc);

      const fullAnswer = pc.localDescription;
      if (!fullAnswer) throw new Error('Failed to generate local SDP answer');

      const compactAnswer = JSON.stringify({
        t: 'answer',
        sdp: fullAnswer.sdp,
      });
      this.localAnswerCode = btoa(unescape(encodeURIComponent(compactAnswer)));

      this.localAnswerQrUrl = await QRCode.toDataURL(this.localAnswerCode, {
        margin: 1,
        width: 320,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });

      this.setStatus('connecting', 'Answer generated! Show this to Host to complete link.');
      return { answerCode: this.localAnswerCode, qrUrl: this.localAnswerQrUrl };
    } catch (err: any) {
      this.setStatus('error', `Invalid room code: ${err?.message || err}`);
      throw err;
    }
  }

  // Host accepts Guest's Answer to seal the P2P connection
  public async acceptGuestAnswer(guestAnswerCode: string): Promise<void> {
    if (!this.peerConnection) throw new Error('No active room created');

    try {
      const decodedStr = decodeURIComponent(escape(atob(guestAnswerCode.trim())));
      const parsed = JSON.parse(decodedStr);

      await this.peerConnection.setRemoteDescription(new RTCSessionDescription({
        type: 'answer',
        sdp: parsed.sdp,
      }));

      this.setStatus('connecting', 'Negotiating direct connection...');
    } catch (err: any) {
      this.setStatus('error', `Failed to accept answer: ${err?.message || err}`);
      throw err;
    }
  }

  private waitForIceGathering(pc: RTCPeerConnection): Promise<void> {
    return new Promise((resolve) => {
      if (pc.iceGatheringState === 'complete') {
        resolve();
        return;
      }

      const checkState = () => {
        if (pc.iceGatheringState === 'complete') {
          pc.removeEventListener('icegatheringstatechange', checkState);
          resolve();
        }
      };

      pc.addEventListener('icegatheringstatechange', checkState);
      // Fallback timeout after 1.5 seconds if some local candidate gathering lags
      setTimeout(() => {
        pc.removeEventListener('icegatheringstatechange', checkState);
        resolve();
      }, 1500);
    });
  }

  private setupDataChannel(channel: RTCDataChannel) {
    this.dataChannel = channel;

    channel.onopen = () => {
      this.setStatus('connected', 'Connected directly via local hotspot / Wi-Fi!');
      this.callbacks?.onPeerConnected(this.role);
      this.startHeartbeat();
    };

    channel.onclose = () => {
      this.setStatus('disconnected', 'Peer disconnected.');
      this.callbacks?.onPeerDisconnected();
      this.stopHeartbeat();
    };

    channel.onerror = (err) => {
      console.warn('DataChannel error:', err);
    };

    channel.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as P2PMessage;
        this.callbacks?.onMessage(msg);
      } catch (e) {
        console.error('Failed to parse P2P message', e);
      }
    };
  }

  public sendMessage(msg: P2PMessage) {
    const jsonStr = JSON.stringify(msg);

    // Send over WebRTC DataChannel if connected
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      try {
        this.dataChannel.send(jsonStr);
      } catch (e) {
        console.warn('Failed to send on WebRTC data channel', e);
      }
    }

    // Also mirror to BroadcastChannel for local dual tab testing
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(msg);
      } catch {
        // ignore
      }
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = window.setInterval(() => {
      if (this.dataChannel && this.dataChannel.readyState === 'open') {
        // Keep channel alive
        try {
          this.dataChannel.send(JSON.stringify({ type: 'PING', timestamp: Date.now() }));
        } catch {
          // ignore
        }
      }
    }, 5000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private setStatus(status: ConnectionStatus, message?: string) {
    this.status = status;
    this.callbacks?.onStatusChange(status, message);
  }

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  public getRole(): MultiplayerRole {
    return this.role;
  }

  public isConnected(): boolean {
    return this.status === 'connected';
  }

  public close() {
    this.stopHeartbeat();
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.role = 'none';
    this.setStatus('disconnected');
  }
}

export const multiplayer = new MultiplayerEngine();
