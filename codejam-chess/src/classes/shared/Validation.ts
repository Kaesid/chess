import { IInputSet } from '../../intefaces';
import store from '../../store';

export class Validation {
  private readonly input: HTMLInputElement = document.createElement('input');

  private save: HTMLButtonElement = document.createElement('button');

  constructor({ input, save }: IInputSet) {
    Object.assign(this, { input, save });

    this.setHandlers();
  }

  private setHandlers(): void {
    this.save.onclick = () => this.checkName();

    this.input.addEventListener('keydown', e => this.preventEnterEvent(e));
  }

  private checkName(): void {
    if (!this.input.value.length) {
      this.input.value = this.input.placeholder;
    }

    this.saveName();
  }

  private saveName(): void {
    if (this.input.placeholder === 'Player 1') {
      store.playerOneName = this.input.value;
    } else {
      store.playerTwoName = this.input.value;
    }
  }

  private preventEnterEvent(e: Event): void {
    const event = e as KeyboardEvent;

    if (event.key === 'Enter') {
      event.preventDefault();
      this.checkName();
    }
  }
}
