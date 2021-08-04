import { IDOM, IHTML, IText } from '../../../intefaces';
import { InjectorDOM } from '../../shared/InjectorDOM';
import store, { goToLobby, goToReplaysPage } from '../../../store';

export class PopupRender {
  private readonly dom: InjectorDOM;

  public navButtons: IHTML = {
    header: document.createElement('h3'),
    lobby: document.createElement('div'),
    lobbyContent: document.createElement('button'),
    replay: document.createElement('div'),
    replayContent: document.createElement('div'),
  };

  private popup: IHTML = {
    headerContainer: document.createElement('div'),
    form: document.createElement('form'),
    stats: document.createElement('div'),
    formButtonsContainer: document.createElement('div'),
  };

  results: IText = {};

  constructor() {
    this.dom = new InjectorDOM();
  }

  public addEndgamePopup(results: IText): void {
    const endgamePopup: IDOM = {
      tag: 'section',
      classes: 'popup endgame-popup',
      parent: document.body,
    };

    this.results = results;

    store.popup = this.dom.push(endgamePopup);

    this.addEndgamePopupHeader();

    this.addEndgamePopupStats();

    this.addEndgamePopupNavButtons();

    this.setEndGameListeners();
  }

  public addDrawOfferPopup(offer: IText, isOfferSended = false): void {
    const endgamePopup: IDOM = {
      tag: 'section',
      classes: 'popup endgame-popup draw-offer',
      parent: document.body,
    };

    store.popup = this.dom.push(endgamePopup);

    this.addEndgamePopupNavButtons();

    if (!isOfferSended) {
      this.navButtons.header.innerText = `${offer.to}, ${offer.from} sugesting draw. Do you agree?`;

      this.navButtons.replayContent.innerText = `Yes`;

      this.navButtons.lobbyContent.innerText = `No`;
    } else {
      this.navButtons.header.innerText = `Waiting for response...`;

      this.navButtons.replay.remove();

      this.navButtons.lobby.remove();
    }
  }

  private setEndGameListeners(): void {
    this.navButtons.lobby.onclick = () => goToLobby();

    this.navButtons.replay.onclick = () => goToReplaysPage();
  }

  private addEndgamePopupHeader(): void {
    const popupHeaderContainer: IDOM = {
      tag: `div`,
      classes: `popup__header-container`,
      parent: store.popup,
    };

    this.popup.headerContainer = this.dom.push(popupHeaderContainer);

    this.addPopupHeader();
  }

  private addPopupHeader(): void {
    const popupHeader: IDOM = {
      tag: `h2`,
      classes: `popup__header`,
      parent: this.popup.headerContainer,
      innerText: 'Game finished.',
    };

    this.dom.push(popupHeader);
  }

  private addEndgamePopupButtons(): void {
    const popupFormButtonsContainer: IDOM = {
      tag: 'div',
      classes: 'popup__form__buttons-wrapper',
      parent: this.popup.form,
    };

    this.popup.formButtonsContainer = this.dom.push(popupFormButtonsContainer);

    this.addPopupLobbyButton();

    this.addGoToReplaysButton();
  }

  private addGoToReplaysButton(): void {
    const replayButton: IDOM = {
      tag: 'div',
      classes: 'popup__form__submit',
      parent: this.popup.formButtonsContainer,
    };

    this.navButtons.replay = this.dom.push(replayButton) as HTMLDivElement;

    this.addGoToReplaysButtonContent();
  }

  private addGoToReplaysButtonContent(): void {
    const popupReplaysButton: IDOM = {
      tag: 'button',
      classes: 'register-button',
      parent: this.navButtons.replay,
      innerText: 'Replays',
    };

    this.navButtons.replayContent = this.dom.push(popupReplaysButton);
  }

  private addPopupLobbyButton(): void {
    const popupLobbyButton: IDOM = {
      tag: 'div',
      classes: 'popup__cancel-button__wrapper',
      parent: this.popup.formButtonsContainer,
    };

    this.navButtons.lobby = this.dom.push(popupLobbyButton) as HTMLDivElement;

    this.addPopupLobbyButtonContent();
  }

  private addPopupLobbyButtonContent(): void {
    const popupLobbyButtonContent: IDOM = {
      tag: 'button',
      classes: 'register-button popup__form__cancel',
      parent: this.navButtons.lobby,
      innerText: 'Lobby',
    };

    this.navButtons.lobbyContent = this.dom.push(popupLobbyButtonContent);
  }

  private addEndgamePopupStats(): void {
    const popupStats: IDOM = {
      tag: 'div',
      classes: 'popup__stats',
      parent: store.popup,
    };

    this.popup.stats = this.dom.push(popupStats);

    this.addEndgamePopupStatsContent();
  }

  private addEndgamePopupStatsContent(): void {
    const popupWinner: IDOM = {
      tag: 'p',
      classes: 'popup__stats__item',
      parent: this.popup.stats,
      innerText: `${this.results.winner}`,
    };

    const popupWinBy: IDOM = {
      ...popupWinner,
      innerText: `${this.results.winBy}`,
    };

    const popupTime: IDOM = {
      ...popupWinner,
      innerText: `Match is over in ${this.results.time}.`,
    };

    this.dom.push(popupWinner);

    this.dom.push(popupWinBy);

    this.dom.push(popupTime);
  }

  private addEndgamePopupNavButtons(): void {
    const popupNavButtons: IDOM = {
      tag: 'div',
      classes: 'popup__nav-buttons',
      parent: store.popup,
    };

    this.popup.form = this.dom.push(popupNavButtons);

    this.addEndgamePopupNavButtonsHeader();

    this.addEndgamePopupButtons();

    this.popup.formButtonsContainer?.classList.add('endgame-popup__button-container');
  }

  private addEndgamePopupNavButtonsHeader(): void {
    const popupNavButtonsHeader: IDOM = {
      tag: 'h3',
      classes: 'popup__nav-buttons__header',
      parent: this.popup.form,
      innerText: `Do you want to view replay?`,
    };

    this.navButtons.header = this.dom.push(popupNavButtonsHeader);
  }
}
