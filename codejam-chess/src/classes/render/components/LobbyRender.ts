import { InjectorDOM } from '../../shared/InjectorDOM';
import { ICanvasSet, IDOM, IHTML, IHTMLSet, IInputSet, INumber, ISelect, IText } from '../../../intefaces';
import store from '../../../store';

import defaultLogo from '../../../assets/icons/favicon.png';

export class LobbyRender {
  private readonly dom: InjectorDOM;

  constructor() {
    this.dom = new InjectorDOM();
  }

  private section: IHTML = {
    content: document.createElement('section'),
    wrap: document.createElement('div'),
    handicapSelectWrap: document.createElement('div'),
    botSkillLevelSelectWrap: document.createElement('div'),
    teamSelectWrap: document.createElement('div'),
    selectGameModeWrap: document.createElement('div'),
  };

  public playerOneField: IInputSet = {
    save: document.createElement('button'),

    input: document.createElement('input'),
  };

  public playerTwoField: IInputSet = JSON.parse(JSON.stringify(this.playerOneField));

  private players: IText = {
    first: 'Player 1',
    second: 'Player 2',
  };

  public selectSet: ISelect = {
    gameMode: document.createElement('select'),
    team: document.createElement('select'),
    handicap: document.createElement('select'),
    botSkill: document.createElement('select'),
  };

  public savedSettingsIndexes: INumber = {
    gameMode: 0,
    team: 0,
    handicap: 0,
    botSkill: 0,
  };

  public avatar: IHTML = {
    content: document.createElement('div'),
    wrap: document.createElement('div'),
    field: document.createElement('div'),
    fieldWrap: document.createElement('div'),
    imageWrap: document.createElement('div'),
    buttonsWrap: document.createElement('div'),
    uploadLabel: document.createElement('label'),
  };

  public avatarFields: IHTMLSet = {
    playerOne: {
      field: document.createElement('div'),
      wrap: document.createElement('div'),
      buttonsWrap: document.createElement('div'),
    },

    playerTwo: {
      field: document.createElement('div'),
      wrap: document.createElement('div'),
      buttonsWrap: document.createElement('div'),
    },
  };

  public avatarDOM: ICanvasSet = {
    img: document.createElement('img'),
    canvas: document.createElement('canvas'),
    reset: document.createElement('button'),
    loadInput: document.createElement('input'),
    upload: document.createElement('button'),
  };

  public avatars: ICanvasSet[] = [
    JSON.parse(JSON.stringify(this.avatarDOM)),
    JSON.parse(JSON.stringify(this.avatarDOM)),
  ];

  public serverButtons: IHTML = {
    create: document.createElement('div'),
    join: document.createElement('div'),
    stop: document.createElement('div'),
    wrap: document.createElement('div'),
    createContent: document.createElement('button'),
    joinContent: document.createElement('button'),
    stopContent: document.createElement('button'),
    loader: document.createElement(`div`),
    loaderWrap: document.createElement(`div`),
  };

  public playerTwoHandicapOption: HTMLOptionElement = document.createElement('option');

  public newGameButton: HTMLButtonElement = document.createElement('button');

  public addAboutPage(): void {
    const content: IDOM = {
      tag: 'section',
      classes: 'about',
      parent: document.body,
    };

    this.section.content = this.dom.push(content);

    this.addWorkZone();
  }

  public IsLocalGame(): boolean {
    return !!(this.selectSet.gameMode.value === 'local' || !this.selectSet.gameMode.value);
  }

  public IsAIGameMode(): boolean {
    return !!(this.selectSet.gameMode.value === 'ai');
  }

  public IsServerGameMode(): boolean {
    return !!(this.selectSet.gameMode.value === 'server');
  }

  private addWorkZone(): void {
    const workZone: IDOM = {
      tag: 'div',
      classes: 'working-zone about__wrapper',
      parent: this.section.content,
    };

    this.section.wrap = this.dom.push(workZone);

    this.addSettingsForm();

    this.addAvatarsBlockWrapper();
  }

  private addSettingsForm(): void {
    const settingsForm: IDOM = {
      tag: 'form',
      classes: 'settings__form',
      parent: this.section.wrap,
      attributes: [
        {
          attribute: 'action',
          value: '#',
        },
        {
          attribute: 'id',
          value: 'settings-form',
        },
      ],
    };

    store.settingsForm = this.dom.push(settingsForm) as HTMLFormElement;

    this.addSelectGameModeWrap();

    this.addTeamSelectWrap();

    this.addHandicapSelectWrap();

    this.addBotSkillLevelSelectWrap();

    this.addNewGameButton();
  }

  private addSelectGameModeWrap(): void {
    const selectGameModeWrap: IDOM = {
      tag: 'div',
      classes: 'popup__form__game-mode',
      parent: store.settingsForm,
    };

    this.section.selectGameModeWrap = this.dom.push(selectGameModeWrap);

    this.addGameModeLabel();

    this.addBr(this.section.selectGameModeWrap);

    this.addGameModeSelect();
  }

  private addGameModeLabel(): void {
    const gameModeLabel: IDOM = {
      tag: 'label',
      classes: 'settings__form__label',
      parent: this.section.selectGameModeWrap,
      innerText: 'Game mode',
      attributes: [{ attribute: 'for', value: 'settings-game-mode' }],
    };

    this.dom.push(gameModeLabel);
  }

  private addGameModeSelect(): void {
    const gameModeSelect: IDOM = {
      tag: 'select',
      classes: 'settings__form__select',
      parent: this.section.selectGameModeWrap,
      attributes: [
        {
          attribute: 'name',
          value: 'game-mode',
        },
        {
          attribute: 'id',
          value: 'settings-game-mode',
        },
      ],
    };

    this.selectSet.gameMode = this.dom.push(gameModeSelect) as HTMLSelectElement;

    this.addGameModeSelectOptions();
  }

  private addGameModeSelectOptions(): void {
    let option: IDOM = {
      tag: 'option',
      parent: this.selectSet.gameMode,
      innerText: 'Player vs. Player (Local)',
      attributes: [
        {
          attribute: 'value',
          value: 'local',
        },
      ],
    };

    this.dom.push(option);

    option = {
      ...option,
      innerText: 'Player vs. AI',
      attributes: [
        {
          attribute: 'value',
          value: 'ai',
        },
      ],
    };

    this.dom.push(option);

    option = {
      ...option,
      innerText: 'Server game mode',
      attributes: [
        {
          attribute: 'value',
          value: 'server',
        },
      ],
    };

    this.dom.push(option);
  }

  private addTeamSelectWrap(): void {
    const teamSelectWrap: IDOM = {
      tag: 'div',
      classes: 'settings__form__field-size',
      parent: store.settingsForm,
    };

    this.section.teamSelectWrap = this.dom.push(teamSelectWrap);

    this.addTeamSelectLabel();

    this.addBr(this.section.teamSelectWrap);

    this.addTeamSelect();
  }

  private addTeamSelectLabel(): void {
    const fieldSizeLabel: IDOM = {
      tag: 'label',
      classes: 'settings__form__label',
      parent: this.section.teamSelectWrap,
      innerText: 'Choose your team',
      attributes: [{ attribute: 'for', value: 'settings-team' }],
    };

    this.dom.push(fieldSizeLabel);
  }

  private addTeamSelect(): void {
    const teamSelect: IDOM = {
      tag: 'select',
      classes: 'settings__form__select field-size',
      parent: this.section.teamSelectWrap,
      attributes: [
        {
          attribute: 'name',
          value: 'field-size',
        },
        {
          attribute: 'id',
          value: 'settings-team',
        },
      ],
    };

    this.selectSet.team = this.dom.push(teamSelect) as HTMLSelectElement;

    this.addTeamSelectLocalOptions();
  }

  private addTeamSelectLocalOptions(): void {
    let option: IDOM = {
      tag: 'option',
      parent: this.selectSet.team,
      innerText: 'Random',
      attributes: [
        {
          attribute: 'value',
          value: 'random',
        },
      ],
    };

    this.dom.push(option);

    option = {
      ...option,
      innerText: 'Player 1 - white, Player 2 - black',
      attributes: [
        {
          attribute: 'value',
          value: 'white',
        },
      ],
    };

    this.dom.push(option);

    option = {
      ...option,
      innerText: 'Player 1 - black, Player 2 - white',
      attributes: [
        {
          attribute: 'value',
          value: 'black',
        },
      ],
    };

    this.dom.push(option);
  }

  private addHandicapSelectWrap(): void {
    const handicapSelectWrap: IDOM = {
      tag: 'div',
      classes: 'settings__form__field-size',
      parent: store.settingsForm,
    };

    this.section.handicapSelectWrap = this.dom.push(handicapSelectWrap);

    this.addHandicapSelectLabel();

    this.addBr(this.section.handicapSelectWrap);

    this.addHandicapSelect();
  }

  addHandicapSelectLabel(): void {
    const handicapLabel: IDOM = {
      tag: 'label',
      classes: 'settings__form__label',
      parent: this.section.handicapSelectWrap,
      innerText: 'Choose handicap',
      attributes: [{ attribute: 'for', value: 'settings-handicap' }],
    };

    this.dom.push(handicapLabel);
  }

  addHandicapSelect(): void {
    const handicapSelect: IDOM = {
      tag: 'select',
      classes: 'settings__form__select',
      parent: this.section.handicapSelectWrap,
      attributes: [
        {
          attribute: 'name',
          value: 'field-handicap',
        },
        {
          attribute: 'id',
          value: 'settings-handicap',
        },
      ],
    };

    this.selectSet.handicap = this.dom.push(handicapSelect) as HTMLSelectElement;

    this.addHandicapSelectOptions();
  }

  addHandicapSelectOptions(): void {
    let option: IDOM = {
      tag: 'option',
      parent: this.selectSet.handicap,
      innerText: 'None',
      attributes: [
        {
          attribute: 'value',
          value: '',
        },
      ],
    };

    this.dom.push(option);

    option = {
      ...option,
      innerText: 'Player 1 start without Queen',
      attributes: [
        {
          attribute: 'value',
          value: '1 queen',
        },
      ],
    };

    this.dom.push(option);

    option = {
      ...option,
      innerText: 'Player 2 start without Queen(disabled in server game)',
      attributes: [
        {
          attribute: 'value',
          value: '2 queen',
        },
      ],
    };

    this.playerTwoHandicapOption = this.dom.push(option) as HTMLOptionElement;
  }

  private addBotSkillLevelSelectWrap(): void {
    const botSkillLevelSelectWrap: IDOM = {
      tag: 'div',
      classes: 'settings__form__field-size',
      parent: store.settingsForm,
    };

    this.section.botSkillLevelSelectWrap = this.dom.push(botSkillLevelSelectWrap);

    this.addBotSkillLevelLabel();

    this.addBr(this.section.botSkillLevelSelectWrap);

    this.addBotSkillLevelSelect();
  }

  addBotSkillLevelLabel(): void {
    const botSkillLevelLabel: IDOM = {
      tag: 'label',
      classes: 'settings__form__label',
      parent: this.section.botSkillLevelSelectWrap,
      innerText: 'Choose AI level',
      attributes: [{ attribute: 'for', value: 'settings-bot-level' }],
    };

    this.dom.push(botSkillLevelLabel);
  }

  addBotSkillLevelSelect(): void {
    const botSkillLevelSelect: IDOM = {
      tag: 'select',
      classes: 'settings__form__select',
      parent: this.section.botSkillLevelSelectWrap,
      attributes: [
        {
          attribute: 'name',
          value: 'field-bot-level',
        },
        {
          attribute: 'id',
          value: 'settings-bot-level',
        },
      ],
    };

    this.selectSet.botSkill = this.dom.push(botSkillLevelSelect) as HTMLSelectElement;

    this.selectSet.botSkill.disabled = true;

    this.addBotSkillLevelSelectOptions();
  }

  addBotSkillLevelSelectOptions(): void {
    let option: IDOM = {
      tag: 'option',
      parent: this.selectSet.botSkill,
      innerText: 'basic AI, current turn awareness',
      attributes: [
        {
          attribute: 'value',
          value: 'basic',
        },
      ],
    };

    this.dom.push(option);

    option = {
      ...option,
      innerText: 'normal AI, 2 turns awareness',
      attributes: [
        {
          attribute: 'value',
          value: 'advance',
        },
      ],
    };

    this.dom.push(option);
  }

  private addBr(parent: HTMLElement): void {
    const br: IDOM = {
      tag: 'br',
      parent,
    };

    this.dom.push(br);
  }

  addLoaderWrap(): void {
    const loaderWrap: IDOM = {
      tag: 'div',
      classes: 'about__loader-wrap',
      parent: store.settingsForm,
    };

    this.serverButtons.loaderWrap = this.dom.push(loaderWrap);
    this.addLoader();
  }

  addLoader(): void {
    const loader: IDOM = {
      tag: 'div',
      classes: 'lds-hourglass',
      parent: this.serverButtons.loaderWrap,
    };

    this.serverButtons.loader = this.dom.push(loader);
  }

  addServerGameButtonsWrap(): void {
    const serverGameButtonsWrap: IDOM = {
      tag: 'div',
      classes: 'about__new-game',
      parent: store.settingsForm,
    };

    this.serverButtons.wrap = this.dom.push(serverGameButtonsWrap);

    this.addServerGameButtons();
  }

  addServerGameButtons(): void {
    const serverGameButtonsWrap: IDOM = {
      tag: 'div',
      classes: 'about__server',
      parent: this.serverButtons.wrap,
    };

    this.serverButtons.create = this.dom.push(serverGameButtonsWrap);

    this.serverButtons.join = this.dom.push(serverGameButtonsWrap);

    this.addGameButtonsContent();
  }

  addGameButtonsContent(): void {
    const serverGameButtonCreate: IDOM = {
      tag: 'button',
      classes: 'register-button about__new-game__server-button',
      parent: this.serverButtons.create,
      innerText: `Create new game`,
    };

    const serverGameButtonJoin: IDOM = {
      ...serverGameButtonCreate,
      parent: this.serverButtons.join,
      innerText: `Join to someone`,
    };

    this.serverButtons.createContent = this.dom.push(serverGameButtonCreate);

    this.serverButtons.joinContent = this.dom.push(serverGameButtonJoin);
  }

  addServerCancelButton(): void {
    const stopGameButton: IDOM = {
      tag: 'div',
      classes: 'about__new-game',
      parent: store.settingsForm,
    };

    this.serverButtons.stop = this.dom.push(stopGameButton);

    this.addServerCancelButtonContent();
  }

  addServerCancelButtonContent(): void {
    const ServerCancelButtonContent: IDOM = {
      tag: 'button',
      classes: 'register-button about__form__cancel',
      parent: this.serverButtons.stop,
      innerText: 'Cancel',
      attributes: [
        {
          attribute: 'type',
          value: 'submit',
        },
      ],
    };
    this.dom.push(ServerCancelButtonContent);
  }

  addNewGameButton(): void {
    const newGameButton: IDOM = {
      tag: 'div',
      classes: 'about__new-game',
      parent: store.settingsForm,
    };

    this.newGameButton = this.dom.push(newGameButton) as HTMLButtonElement;

    this.addNewGameButtonContent();
  }

  private addNewGameButtonContent(): void {
    const newGameButtonContent: IDOM = {
      tag: 'button',
      classes: 'register-button about__new-game__button',
      parent: this.newGameButton,
      innerText: 'Start',
      attributes: [
        {
          attribute: 'type',
          value: 'submit',
        },
      ],
    };

    this.dom.push(newGameButtonContent);
  }

  private addAvatarsBlockWrapper(): void {
    const popupFormWrapper: IDOM = {
      tag: `div`,
      classes: `about__form-wrapper`,
      parent: this.section.wrap,
    };

    this.avatar.content = this.dom.push(popupFormWrapper);
    this.addAvatarsWindows();
  }

  private addAvatarsWindowsFields(): void {
    const popupFormField: IDOM = {
      tag: 'div',
      classes: 'about__form__field',
      parent: this.avatar.wrap,
    };

    this.avatarFields.playerOne.field = this.dom.push(popupFormField);

    this.avatarFields.playerTwo.field = this.dom.push(popupFormField);

    const popupFormFieldWrap: IDOM = {
      tag: 'div',
      classes: 'about__form__field__wrap',
      parent: this.avatarFields.playerOne.field,
    };

    this.addAvatarsWindowsField(this.avatarFields.playerOne.field, 0);

    this.addAvatarsWindowsField(this.avatarFields.playerTwo.field, 1);

    this.avatarFields.playerOne.wrap = this.dom.push(popupFormFieldWrap);

    this.avatarFields.playerTwo.wrap = this.dom.push({
      ...popupFormFieldWrap,
      parent: this.avatarFields.playerTwo.field,
    });

    this.addNameInputs();

    this.addNameIputsButtonsWrap();
  }

  private addAvatarsWindows(): void {
    const popupForm: IDOM = {
      tag: `div`,
      classes: `about__form`,
      parent: this.avatar.content,
    };

    this.avatar.wrap = this.dom.push(popupForm);

    this.addAvatarsWindowsFields();
  }

  private addAvatarsWindowsField(parentHTML: HTMLElement, index: number): void {
    const avatarField: IDOM = {
      tag: `div`,
      classes: `about__avatar`,
      parent: parentHTML,
    };

    this.avatar.field = this.dom.push(avatarField);

    this.addAvatarWrap(index);
  }

  private addAvatarWrap(index: number): void {
    const avatarWrap: IDOM = {
      tag: `div`,
      classes: `about__avatar__wrap`,
      parent: this.avatar.field,
    };

    this.avatar.fieldWrap = this.dom.push(avatarWrap);

    this.addAvatarImageContainer(index);

    this.addAvatarButtons(index);
  }

  private addAvatarImageContainer(index: number): void {
    const avatarImageContainer: IDOM = {
      tag: `div`,
      classes: `about__avatar__image`,
      parent: this.avatar.fieldWrap,
    };

    this.avatar.imagedWrap = this.dom.push(avatarImageContainer);

    this.addAvatardefaultImage(index);

    this.addAvatarCanvas(index);
  }

  private addAvatardefaultImage(index: number): void {
    const avatarDefaultImage: IDOM = {
      tag: `img`,
      classes: `about__avatar__image__img`,
      parent: this.avatar.imagedWrap,
      attributes: [
        {
          attribute: `src`,
          value: `${defaultLogo}`,
        },
        {
          attribute: `alt`,
          value: `Default logo`,
        },
      ],
    };

    this.avatars[index].img = this.dom.push(avatarDefaultImage) as HTMLImageElement;
  }

  private addAvatarCanvas(index: number): void {
    const avatarCanvas: IDOM = {
      tag: `canvas`,
      classes: `about__avatar__image__canvas`,
      parent: this.avatar.imagedWrap,
    };

    this.avatars[index].canvas = this.dom.push(avatarCanvas) as HTMLCanvasElement;
  }

  private addAvatarButtons(index: number): void {
    const avatarButtons: IDOM = {
      tag: `div`,
      classes: `about__avatar__button-container`,
      parent: this.avatar.fieldWrap,
    };

    this.avatar.buttonsWrap = this.dom.push(avatarButtons);

    this.addAvatarResetButton(index);

    this.addAvatarLoadButton(index);
  }

  private addAvatarResetButton(index: number): void {
    const avatarResetButton: IDOM = {
      tag: `div`,
      classes: `about__avatar__reset-button`,
      parent: this.avatar.buttonsWrap,
    };

    this.avatars[index].reset = this.dom.push(avatarResetButton) as HTMLButtonElement;

    this.addAvatarResetButtonContent(index);
  }

  private addAvatarResetButtonContent(index: number): void {
    const avatarResetButtonContent: IDOM = {
      tag: `button`,
      classes: `reset-button`,
      parent: this.avatars[index].reset,
      innerText: 'Reset',
      attributes: [
        {
          attribute: 'onclick',
          value: 'return false;',
        },
      ],
    };

    this.dom.push(avatarResetButtonContent);
  }

  private addAvatarLoadButton(index: number): void {
    const avatarLoadButton: IDOM = {
      tag: `div`,
      classes: `about__avatar__apply-button`,
      parent: this.avatar.buttonsWrap,
    };

    this.avatars[index].upload = this.dom.push(avatarLoadButton) as HTMLButtonElement;

    this.addAvatarLoadButtonLabel(index);
  }

  private addAvatarLoadButtonLabel(index: number): void {
    const avatarLoadButtonLabel: IDOM = {
      tag: `label`,
      classes: `apply-label`,
      parent: this.avatars[index].upload,
      innerText: 'Upload',
      attributes: [
        {
          attribute: `for`,
          value: `btnInput`,
        },
      ],
    };

    this.avatar.uploadLabel = this.dom.push(avatarLoadButtonLabel);

    this.addAvatarLoadButtonInput(index);
  }

  private addAvatarLoadButtonInput(index: number): void {
    const avatarLoadButtonInput: IDOM = {
      tag: `input`,
      classes: `apply-button`,
      parent: this.avatar.uploadLabel,
      innerText: 'Upload',
      attributes: [
        {
          attribute: `id`,
          value: `btnInput`,
        },
        {
          attribute: `name`,
          value: `upload`,
        },
        {
          attribute: `type`,
          value: `file`,
        },
        {
          attribute: `placeholder`,
          value: `Load picture`,
        },
      ],
    };

    this.avatars[index].loadInput = this.dom.push(avatarLoadButtonInput) as HTMLInputElement;
  }

  private addNameIputsButtonsWrap(): void {
    const popupFormFieldLabelWrap: IDOM = {
      tag: 'div',
      classes: 'about__form__field__buttons-wrap',
      parent: this.avatarFields.playerOne.wrap,
    };

    this.avatarFields.playerOne.buttonsWrap = this.dom.push(popupFormFieldLabelWrap);

    this.avatarFields.playerTwo.buttonsWrap = this.dom.push({
      ...popupFormFieldLabelWrap,
      parent: this.avatarFields.playerTwo.wrap,
    });

    this.addInputNameButtons();
  }

  private addInputNameButtons(): void {
    const formField1Ok: IDOM = {
      tag: 'button',
      classes: 'about__form__field__button-ok',
      parent: this.avatarFields.playerOne.buttonsWrap,
      innerText: '',
      attributes: [
        {
          attribute: 'onclick',
          value: 'return false',
        },
      ],
    };

    const formField2Ok: IDOM = {
      ...formField1Ok,
      parent: this.avatarFields.playerTwo.buttonsWrap,
    };

    this.playerOneField.save = this.dom.push(formField1Ok) as HTMLButtonElement;

    this.playerTwoField.save = this.dom.push(formField2Ok) as HTMLButtonElement;
  }

  private addNameInputs(): void {
    const popupInputName1: IDOM = {
      tag: 'input',
      classes: 'about__form__field__input',
      parent: this.avatarFields.playerOne.wrap,

      attributes: [
        {
          attribute: 'type',
          value: 'text',
        },
        { attribute: 'maxlength', value: '30' },
        { attribute: 'placeholder', value: 'Player 1' },
        { attribute: 'value', value: `${store.playerOneName}` },
      ],
    };

    const popupInputName2: IDOM = {
      ...popupInputName1,
      parent: this.avatarFields.playerTwo.wrap,
      innerText: `${this.players.second}`,
      attributes: [
        {
          attribute: 'type',
          value: 'text',
        },
        { attribute: 'maxlength', value: '30' },
        { attribute: 'placeholder', value: 'Player 2' },
        { attribute: 'value', value: `${store.playerTwoName}` },
      ],
    };

    this.playerOneField.input = this.dom.push(popupInputName1) as HTMLInputElement;

    this.playerTwoField.input = this.dom.push(popupInputName2) as HTMLInputElement;
  }
}
