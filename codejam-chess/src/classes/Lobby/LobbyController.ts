import { IMessage, ISubmitEvent } from '../../intefaces';
import store, { goToGamePage } from '../../store';
import { Render } from '../render/Render';
import { ImageHandler } from '../shared/ImageHandler';
import { Validation } from '../shared/Validation';

export class LobbyController {
  private render: Render;

  public playerOneAvatar: ImageHandler;

  public playerTwoAvatar: ImageHandler;

  public playerOneName: Validation | undefined;

  public playerTwoName: Validation | undefined;

  private socket: WebSocket | undefined;

  private isLookingForMatch = false;

  private isPlayerHosting = false;

  constructor(render: Render) {
    this.render = render;

    this.playerOneAvatar = new ImageHandler();

    this.playerTwoAvatar = new ImageHandler();
  }

  public async loadLogic(): Promise<void> {
    await this.resetData();

    this.setHandlers();
  }

  public setAvatarsData(): void {
    this.playerOneAvatar.canvasURL = this.render.game.replayData.whiteAvatar;

    this.playerTwoAvatar.canvasURL = this.render.game.replayData.blackAvatar;
  }

  private async resetData(): Promise<void> {
    if (this.render.lobby.IsServerGameMode()) {
      await this.closeSocket();

      await this.openSocket();
    }

    this.render.game.isReplayMode = false;

    this.isLookingForMatch = false;

    this.isPlayerHosting = false;
  }

  private setHandlers(): void {
    this.setAvatarsConrol();

    this.setInputsControl();

    this.loadSettingsState();

    this.setSettingsControl();
  }

  private setSettingsControl(): void {
    this.render.lobby.selectSet.gameMode.onchange = e => this.changeGameMode(e);

    store.settingsForm.onsubmit = e => this.submitSettings(e);
  }

  private async submitSettings(e: Event): Promise<void> {
    e.preventDefault();

    const event = e as unknown as ISubmitEvent;

    const button = (event.submitter as unknown as HTMLElement).parentElement;

    this.saveSettingsState();

    switch (button) {
      case this.render.lobby.newGameButton:
        goToGamePage();
        break;

      case this.render.lobby.serverButtons.create:
        await this.setConnectionToServerMode();

        this.createServerGame();
        break;

      case this.render.lobby.serverButtons.join:
        await this.setConnectionToServerMode();

        this.joinServerGame();
        break;

      case this.render.lobby.serverButtons.stop:
        this.setServerStopButtonAction();
        break;
      default:
        break;
    }
  }

  private async setConnectionToServerMode(): Promise<void> {
    this.deactivateInteractiveElements();

    await this.closeSocket();

    await this.openSocket();
  }

  private setServerStopButtonAction(): void {
    this.informServerOnLeaving();

    this.showServerButtons();

    this.activateInteractiveElements();
  }

  private deactivateInteractiveElements(): void {
    this.render.lobby.selectSet.gameMode.classList.add(`inactive`);

    this.render.lobby.selectSet.handicap.classList.add(`inactive`);

    this.render.header.section.content.classList.add(`inactive`);
  }

  private activateInteractiveElements(): void {
    this.render.lobby.selectSet.gameMode.classList.remove(`inactive`);

    this.render.lobby.selectSet.handicap.classList.remove(`inactive`);

    this.render.header.section.content.classList.remove(`inactive`);
  }

  private informServerOnLeaving(): void {
    if (this.isLookingForMatch) {
      this.isLookingForMatch = false;

      const msg: IMessage = {
        content: ``,
        type: 'leavingQueue',
      };

      (this.socket as WebSocket).send(JSON.stringify(msg));
    }

    if (this.isPlayerHosting) {
      this.isPlayerHosting = false;

      const msg: IMessage = {
        content: ``,
        type: 'leavingHost',
      };

      (this.socket as WebSocket).send(JSON.stringify(msg));
    }
  }

  private openSocket(): Promise<void> {
    return new Promise(resolve => {
      const maxServerResponseTime = 14000;

      const { create, join, stop } = this.render.lobby.serverButtons;

      if (this.socket) {
        this.socket.onmessage = null;
      }

      if (!this.socket || this.socket.readyState !== 1) {
        if (this.socket?.readyState === 2) {
          this.socket.onclose = () => {
            this.socket = new WebSocket(`${store.serverUrl}`);
            create.classList.add('inactive');
            join.classList.add('inactive');
          };
        } else {
          this.socket = new WebSocket(`${store.serverUrl}`);
          create.classList.add('inactive');
          join.classList.add('inactive');
        }

        setTimeout(() => {
          create.classList.remove('inactive');
          join.classList.remove('inactive');
          stop.classList.remove('inactive');
        }, maxServerResponseTime);

        this.socket.onopen = () => {
          resolve();
        };
      } else {
        resolve();
      }
    });
  }

  private closeSocket(): Promise<void> {
    return new Promise(resolve => {
      const maxActiveServerResponseTime = 2000;

      const {stop} = this.render.lobby.serverButtons;

      if (this.socket) {
        this.socket.onmessage = null;
      }

      if (this.socket && this.socket.readyState === 1) {
        this.socket.close();

        stop.classList.add('inactive');

        setTimeout(() => {
          stop.classList.remove('inactive');
        }, maxActiveServerResponseTime);

        this.socket.onclose = () => {
          resolve();
        };
      } else {
        resolve();
      }
    });
  }

  private createServerGame(): void {
    this.isPlayerHosting = true;

    this.showCancelButton();

    this.getPlayerOneName();

    this.listenSocketMessage();

    this.sendSocketDataOnCreate();
  }

  private joinServerGame(): void {
    this.isLookingForMatch = true;

    this.showCancelButton();

    this.getPlayerOneName();

    this.listenSocketMessage();

    this.sendSocketDataOnJoin();
  }

  private listenSocketMessage(): void {
    (this.socket as WebSocket).onmessage = async event => {
      const msg: IMessage = JSON.parse(event.data);

      this.setOpponentData(msg);

      this.sendPlayerData(msg);
    };
  }

  private sendPlayerData(msg: IMessage): void {
    if (msg.type === `MatchFound`) {
      store.serverGameNumber = +msg.content;

      this.render.lobby.serverButtons.stop.classList.add(`inactive`);

      this.sendPlayerName();

      this.sendPlayerHandicap();

      this.sendPlayerTeamData();

      this.sendPlayerAvatar();
    }
  }

  private sendPlayerAvatar(): void {
    const response = {
      content: `${this.playerOneAvatar.canvasURL}`,
      type: 'playerAvatar',
    };

    (this.socket as WebSocket).send(JSON.stringify(response));
  }

  private sendPlayerTeamData(): void {
    if (this.isPlayerHosting) {
      const dice = Math.trunc(Math.random() * 2);

      this.render.isPlayerWhiteServer = Boolean(dice);

      const response = {
        content: `${dice}`,
        type: 'gameTeamData',
      };

      (this.socket as WebSocket).send(JSON.stringify(response));
    }
  }

  private sendPlayerHandicap(): void {
    const response = {
      content: `${this.render.lobby.selectSet.handicap.value}`,
      type: 'oppHandicap',
    };

    (this.socket as WebSocket).send(JSON.stringify(response));
  }

  private sendPlayerName(): void {
    const response: IMessage = {
      content: `${store.playerOneName}`,
      type: 'playerName',
    };

    (this.socket as WebSocket).send(JSON.stringify(response));
  }

  private setOpponentData(msg: IMessage): void {
    if (msg.type === `playerName`) {
      store.playerTwoName = msg.content;
    }

    this.setOpponentTeam(msg);

    this.setOpponentHandicap(msg);

    this.setOpponentAvatar(msg);
  }

  private setOpponentHandicap(msg: IMessage): void {
    if (msg.type === `oppHandicap`) {
      this.render.netEnemyHandicap = msg.content;
    }
  }

  private setOpponentTeam(msg: IMessage): void {
    if (msg.type === `gameTeamData` && this.isLookingForMatch) {
      this.render.isPlayerWhiteServer = !+msg.content;
    }
  }

  private setOpponentAvatar(msg: IMessage): void {
    if (msg.type === `playerAvatar`) {
      this.playerTwoAvatar.canvasURL = msg.content;

      if (this.isLookingForMatch) {
        this.isLookingForMatch = false;

        const data: IMessage = {
          content: ``,
          type: 'leavingQueue',
        };

        (this.socket as WebSocket).send(JSON.stringify(data));
      }

      if (this.isPlayerHosting) {
        this.isPlayerHosting = false;

        const data: IMessage = {
          content: ``,
          type: 'leavingHost',
        };

        (this.socket as WebSocket).send(JSON.stringify(data));
      }

      goToGamePage();
    }
  }

  private sendSocketDataOnJoin(): void {
    const msg: IMessage = {
      content: `${store.playerOneName}`,
      type: 'joinQueue',
    };

    (this.socket as WebSocket).send(JSON.stringify(msg));
  }

  private sendSocketDataOnCreate(): void {
    const msg: IMessage = {
      content: `${store.playerOneName}`,
      type: 'createGame',
    };

    (this.socket as WebSocket).send(JSON.stringify(msg));
  }

  private getPlayerOneName(): void {
    if (this.render.lobby.playerOneField.input.value) {
      store.playerOneName = this.render.lobby.playerOneField.input.value;
    } else {
      store.playerOneName = this.render.lobby.playerOneField.input.placeholder;
    }
  }

  private changeGameMode(e: Event): void {
    const select = e.target as HTMLSelectElement;

    this.handleGameMode(select.value);
  }

  private handleGameMode(mode: string): void {
    switch (mode) {
      case `local`:
        this.setLocalGame();
        break;
      case `ai`:
        this.setAiGame();
        break;
      case `server`:
        this.setServerGame();
        break;
      default:
    }
  }

  private setLocalGame(): void {
    this.hideServerButtons();

    this.setLocalGameSettings();
  }

  private setAiGame(): void {
    this.hideServerButtons();
    this.setAIGameSettings();
  }

  private setServerGame(): void {
    this.showServerButtons();

    this.setSeverGameSettings();
  }

  private showCancelButton(): void {
    this.render.lobby.serverButtons.wrap.remove();

    this.render.lobby.addServerCancelButton();

    this.render.lobby.addLoaderWrap();

    this.render.lobby.avatar.content.classList.add('inactive');
  }

  private showServerButtons(): void {
    this.render.lobby.serverButtons.stop.remove();

    this.render.lobby.serverButtons.loader.remove();

    this.render.lobby.newGameButton.remove();

    this.render.lobby.serverButtons.wrap.remove();

    this.render.lobby.addServerGameButtonsWrap();

    this.render.lobby.avatar.content.classList.remove('inactive');
  }

  private hideServerButtons(): void {
    this.render.lobby.serverButtons.stop.remove();

    this.render.lobby.newGameButton.remove();

    this.render.lobby.serverButtons.wrap.remove();

    this.render.lobby.addNewGameButton();

    this.render.lobby.avatar.content.classList.remove('inactive');
  }

  private setLocalGameSettings(): void {
    this.setLocalGameSelectState();

    this.setPlayerTwoActive();
  }

  private setAIGameSettings(): void {
    this.setAIGameSelectState();

    this.render.lobby.playerTwoField.input.value = 'AI';

    store.playerTwoName = 'AI';

    this.setPlayerTwoInactive();
  }

  private setSeverGameSettings(): void {
    this.setServerGameSelectState();

    this.render.lobby.playerTwoField.input.value = 'Awaiting player';

    this.setPlayerTwoInactive();
  }

  private loadSettingsState(): void {
    const { gameMode, team, handicap, botSkill } = this.render.lobby.savedSettingsIndexes;

    this.render.lobby.selectSet.gameMode.selectedIndex = gameMode;

    this.render.lobby.selectSet.team.selectedIndex = team;

    this.render.lobby.selectSet.handicap.selectedIndex = handicap;

    this.render.lobby.selectSet.botSkill.selectedIndex = botSkill;

    this.handleGameMode(this.render.lobby.selectSet.gameMode.value);
  }

  private saveSettingsState(): void {
    this.render.lobby.savedSettingsIndexes.gameMode = this.render.lobby.selectSet.gameMode.selectedIndex;

    this.render.lobby.savedSettingsIndexes.team = this.render.lobby.selectSet.team.selectedIndex;

    this.render.lobby.savedSettingsIndexes.handicap = this.render.lobby.selectSet.handicap.selectedIndex;

    this.render.lobby.savedSettingsIndexes.botSkill = this.render.lobby.selectSet.botSkill.selectedIndex;
  }

  private setPlayerTwoActive(): void {
    store.playerTwoName = '';

    this.render.lobby.playerTwoField.input.value = '';

    this.render.lobby.playerTwoField.input.classList.remove('inactive');

    this.render.lobby.playerTwoField.save.classList.remove('inactive');

    this.render.lobby.avatar.fieldWrap.classList.remove('inactive');
  }

  private setPlayerTwoInactive(): void {
    this.render.lobby.avatars[1].reset.click();

    this.render.lobby.playerTwoField.input.classList.add('inactive');

    this.render.lobby.playerTwoField.save.classList.add('inactive');

    this.render.lobby.avatar.fieldWrap.classList.add('inactive');
  }

  private setLocalGameSelectState(): void {
    this.render.lobby.selectSet.botSkill.disabled = true;

    this.render.lobby.selectSet.team.disabled = false;

    this.render.lobby.playerTwoHandicapOption.disabled = false;
  }

  private setAIGameSelectState(): void {
    this.render.lobby.selectSet.botSkill.disabled = false;

    this.render.lobby.selectSet.team.disabled = false;

    this.render.lobby.playerTwoHandicapOption.disabled = false;
  }

  private setServerGameSelectState(): void {
    this.render.lobby.selectSet.botSkill.disabled = true;

    this.render.lobby.selectSet.team.disabled = true;

    this.render.lobby.playerTwoHandicapOption.disabled = true;

    this.render.lobby.selectSet.handicap.selectedIndex = 0;

    this.render.lobby.selectSet.team.selectedIndex = 0;
  }

  private setInputsControl(): void {
    this.playerOneName = new Validation(this.render.lobby.playerOneField);

    this.playerTwoName = new Validation(this.render.lobby.playerTwoField);
  }

  private setAvatarsConrol(): void {
    const firstAvatarControlElements = this.render.lobby.avatars[0];

    this.playerOneAvatar.handleAvatarLoad(firstAvatarControlElements);

    const secondAvatarControlElements = this.render.lobby.avatars[1];

    this.playerTwoAvatar.handleAvatarLoad(secondAvatarControlElements);
  }
}
