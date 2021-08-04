import { ICanvasSet } from '../../intefaces';

export class ImageHandler {
  private image: HTMLImageElement = document.createElement('img');

  canvasURL = '';

  img: HTMLImageElement = document.createElement('img');

  canvas: HTMLCanvasElement = document.createElement('canvas');

  upload: HTMLElement = document.createElement('div');

  loadInput: HTMLInputElement = document.createElement('input');

  reset: HTMLButtonElement = document.createElement('button');

  lastImage: HTMLImageElement | null = null;

  handleAvatarLoad({ img, canvas, upload, loadInput, reset }: ICanvasSet): void {
    Object.assign(this, { img, canvas, upload, loadInput, reset });

    this.setHandlers();

    if (!this.lastImage) {
      this.imageToCanvas(this.img);
    } else {
      this.imageToCanvas(this.lastImage);
    }
  }

  private setHandlers(): void {
    this.upload.onchange = () => this.imageLoad();

    this.reset.onclick = () => this.imageToCanvas(this.img);
  }

  private imageLoad(): void {
    const reader = new FileReader();

    reader.onload = () => {
      this.image.src = reader.result as string;

      this.imageToCanvas(this.image);
    };

    if (this.loadInput.files) {
      const file = this.loadInput?.files[0];

      reader.readAsDataURL(file as Blob);
    }
  }

  private imageToCanvas(image: HTMLImageElement): void {
    const ctx = this.canvas.getContext('2d');

    const img = new Image();

    img.src = image.src;

    img.onload = () => {
      const link = document.createElement('a');

      this.canvas.width = img.width;
      this.canvas.height = img.height;

      img.setAttribute('crossOrigin', 'anonymous');

      (ctx as CanvasRenderingContext2D).drawImage(img, 0, 0);

      link.download = 'temp.png';

      this.canvasURL = this.canvas.toDataURL('image/png', 1);

      this.loadInput.value = '';

      this.lastImage = img;
    };
  }
}
