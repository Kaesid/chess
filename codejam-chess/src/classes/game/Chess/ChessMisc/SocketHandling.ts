import { IMessage } from "../../../../intefaces";
import store from '../../../../store';
import { ChessDataHandler } from '../ChessData/ChessDataHandler';

export class SocketHandling {
  data: ChessDataHandler;

  constructor(data: ChessDataHandler) {
    this.data = data;
  }

  public openSocket(): Promise<void> {
    return new Promise(resolve => {
      if (!this.data.socket || this.data.socket.readyState !== 1) {
        if (this.data.socket?.readyState === 2) {
          this.data.socket.onclose = () => {
            this.data.socket = new WebSocket(`${store.serverUrl}`);
          };
        } else {
          this.data.socket = new WebSocket(`${store.serverUrl}`);
        }

        this.data.socket.onopen = () => {
          const connect: IMessage = {
            content: `${store.serverGameNumber}`,
            type: 'PlayerConnected',
          };

          this.data.socket?.send(JSON.stringify(connect));

          resolve();
        };
      } else {
        setTimeout(() => {
          this.openSocket();
        }, 100);
      }
    });
  }

  public closeSocket(): Promise<void> {
    return new Promise(resolve => {
      if (this.data.socket && this.data.socket.readyState === 1) {
        this.data.socket.close();

        this.data.socket.onmessage = null;
        this.data.socket.onclose = () => {
          resolve();
        };
      } else {
        resolve();
      }
    });
  }
}
