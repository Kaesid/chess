import store from '../../store';

export function convertTimeToString(number: number): string {
  return number > 9 ? String(number) : `0${number}`;
}

export function showTime(minutesNum: number, secondsNum: number): void {
  const minutes = convertTimeToString(minutesNum);

  const seconds = convertTimeToString(secondsNum);

  store.timerElem.innerText = `${minutes}:${seconds}`;
}

export class Timer {
  private timer: NodeJS.Timeout | undefined;

  private secCounter = 0;

  private minCounter = 0;

  private second = 1000;

  private currentSpeed = 0;

  private isTimerPaused = false;

  public setIncrementTimer(): void {
    this.resetTime();

    this.secCounter++;

    this.runTimer();
  }

  public runTimer(): void {
    if (this.isTimerPaused && store.isTimerCanRestart) {
      this.currentSpeed = store.replayTimeSpeed;

      this.timer = setInterval(() => this.incrementTimer(), this.second / this.currentSpeed);

      this.isTimerPaused = false;
    }
  }

  public pauseTimer(): void {
    this.isTimerPaused = true;

    clearInterval(this.timer as NodeJS.Timeout);
  }

  public resetTime(): void {
    this.secCounter = 0;

    this.minCounter = 0;

    this.pauseTimer();
  }

  public timerRestartCheck(): void {
    if (store.replayTimeSpeed !== this.currentSpeed && !store.isAnimationInProgress) {
      this.pauseTimer();

      this.runTimer();
    }
  }

  private incrementTimer(): void {
    if (this.secCounter === 60) {
      this.secCounter = 0;

      this.minCounter++;
    }

    showTime(this.minCounter, this.secCounter);

    this.secCounter++;

    this.timerRestartCheck();
  }
}
