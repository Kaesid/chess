import { IDOM, IHTML } from '../../../intefaces';
import { InjectorDOM } from '../../shared/InjectorDOM';

export class HeaderRender {
  private readonly dom: InjectorDOM;

  public section: IHTML = {
    content: document.createElement('header'),
    wrap: document.createElement('div'),
    nav: document.createElement('nav'),
    navList: document.createElement('ul'),
    navItem: document.createElement('li'),
    speedWrap: document.createElement('div'),
    checkBox: document.createElement('input'),
    yieldButton: document.createElement('div'),
    drawOfferButton: document.createElement('div'),
  };

  public navLinks: IHTML = {
    lobby: document.createElement('a'),
    replays: document.createElement('a'),
  };

  constructor() {
    this.dom = new InjectorDOM();
  }

  public addHeader(): void {
    const header: IDOM = {
      tag: 'header',
      classes: 'header',
      parent: document.body,
    };

    this.section.content = this.dom.push(header);

    this.addWorkZone();

    this.addAppHeader();
  }

  private addWorkZone(): void {
    const headerWorkingZone: IDOM = {
      tag: 'div',
      classes: 'working-zone header__wrap',
      parent: this.section.content,
    };

    this.section.wrap = this.dom.push(headerWorkingZone);

    this.addNav();
  }

  public setGameMode(): void {
    this.section.nav.classList.add('hide');

    this.addYieldButton();

    this.addDrawOfferButton();
  }

  public setGameModeOff(): void {
    this.section.nav.classList.remove('hide');

    this.section.yieldButton.remove();

    this.section.drawOfferButton.remove();
  }

  public addReplaySpeedControl(): void {
    const speedWrap: IDOM = {
      tag: 'div',
      classes: 'header__replay__speed-wrap',
      parent: this.section.wrap,
    };

    this.section.speedWrap = this.dom.push(speedWrap);

    this.addReplaySpeedControlInputs(`1`, `1X`);

    (this.section.checkBox as HTMLInputElement).checked = true;

    this.addReplaySpeedControlInputs(`2`, `2X`);

    this.addReplaySpeedControlInputs(`3`, `3X`);

    this.addReplaySpeedControlInputs(`4`, `4X`);
  }

  public addDrawOfferButtonContent(): void {
    const drawOfferButtonContent: IDOM = {
      tag: 'button',
      classes: 'register-button about__new-game__button',
      parent: this.section.drawOfferButton,
      innerText: 'Offer draw',
    };

    this.dom.push(drawOfferButtonContent);
  }

  private addNav(): void {
    const headerNav: IDOM = {
      tag: 'nav',
      classes: 'header__nav',
      parent: this.section.wrap,
    };

    this.section.nav = this.dom.push(headerNav);

    this.addNavList();
  }

  private addNavList(): void {
    const headerNavList: IDOM = {
      tag: 'ul',
      classes: 'header__nav__list',
      parent: this.section.nav,
    };

    this.section.navList = this.dom.push(headerNavList);

    this.addNavItem(1);

    this.addNavItem(2);
  }

  private addNavItem(linkNumber: number): void {
    const headerNavItem: IDOM = {
      tag: 'li',
      classes: 'header__nav__list__item',
      parent: this.section.navList,
    };

    this.section.navItem = this.dom.push(headerNavItem);

    switch (linkNumber) {
      case 1:
        this.addNavLinkAbout();

        break;
      case 2:
        this.addNavLinkReplays();

        break;
      default:
    }
  }

  private addNavLinkAbout(): void {
    const headerNavLink: IDOM = {
      tag: 'a',
      classes: 'header__nav__list__item__link',
      parent: this.section.navItem,
      innerText: 'Lobby',
      attributes: [
        {
          attribute: 'href',
          value: '#',
        },
        { attribute: 'onclick', value: `return false;` },
        {
          attribute: 'data-link',
          value: '#/Lobby/',
        },
      ],
    };

    this.navLinks.lobby = this.dom.push(headerNavLink);
  }

  private addNavLinkReplays(): void {
    const headerNavLink = {
      tag: 'a',
      classes: 'header__nav__list__item__link',
      parent: this.section.navItem,
      innerText: 'Replays',
      attributes: [
        {
          attribute: 'href',
          value: '#',
        },
        { attribute: 'onclick', value: `return false;` },
        {
          attribute: 'data-link',
          value: '#/Replays/',
        },
      ],
    };

    this.navLinks.replays = this.dom.push(headerNavLink);
  }

  private addAppHeader(): void {
    const appHeader: IDOM = {
      tag: 'h1',
      classes: 'invisible',
      parent: this.section.content,
      innerText: 'Codejam chess',
    };

    this.dom.push(appHeader);
  }

  private addYieldButton(): void {
    const headerYieldButton: IDOM = {
      tag: 'div',
      classes: 'game__stop-button',
      parent: this.section.wrap,
    };

    this.section.yieldButton = this.dom.push(headerYieldButton) as HTMLButtonElement;

    this.addYieldButtonContent();
  }

  private addReplaySpeedControlInputs(id: string, labelText: string): void {
    const speedCheckBox: IDOM = {
      tag: 'input',
      classes: 'header__replay__speed-checkbox',
      parent: this.section.speedWrap,
      attributes: [
        {
          attribute: 'type',
          value: 'radio',
        },
        {
          attribute: 'name',
          value: 'checkbox',
        },
        {
          attribute: 'id',
          value: `${id}`,
        },
      ],
    };

    this.section.checkBox = this.dom.push(speedCheckBox);

    const label: IDOM = {
      tag: 'label',
      classes: 'header__replay__speed-label',
      parent: this.section.speedWrap,
      innerText: `${labelText}`,
      attributes: [
        {
          attribute: 'for',
          value: `${id}`,
        },
      ],
    };

    this.dom.push(label);
  }

  private addYieldButtonContent(): void {
    const headerNewGameButtonContent: IDOM = {
      tag: 'button',
      classes: 'register-button about__new-game__button',
      parent: this.section.yieldButton,
      innerText: 'Yield',
    };

    this.dom.push(headerNewGameButtonContent);
  }

  private addDrawOfferButton(): void {
    const drawOfferButton: IDOM = {
      tag: 'div',
      classes: 'game__stop-button',
      parent: this.section.wrap,
    };

    this.section.drawOfferButton = this.dom.push(drawOfferButton) as HTMLButtonElement;

    this.addDrawOfferButtonContent();
  }
}
