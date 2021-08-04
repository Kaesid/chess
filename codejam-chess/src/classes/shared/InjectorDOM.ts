import { IAttributes, IDOM } from '../../intefaces';

export class InjectorDOM {
  private element: HTMLElement = document.createElement('div');

  private createTag(elementTag: string): void {
    this.element = document.createElement(`${elementTag}`);
  }

  private addClasses(classNames: string): void {
    classNames.split(' ').forEach(element => this.element.classList.add(`${element}`));
  }

  private setAttributes(attributes: IAttributes[]): void {
    attributes.forEach(elem => this.element.setAttribute(elem.attribute, elem.value));
  }

  private setInnerText(innerText: string): void {
    this.element.innerText = innerText;
  }

  push({ tag, classes, parent, attributes, innerText }: IDOM): HTMLElement {
    this.createTag(tag);

    parent.appendChild(this.element);

    if (classes) {
      this.addClasses(classes);
    }

    if (attributes) {
      this.setAttributes(attributes);
    }

    if (innerText) {
      this.setInnerText(innerText);
    }

    return this.element;
  }

  unshift({ tag, classes, parent, attributes, innerText }: IDOM): HTMLElement {
    this.createTag(tag);

    parent.insertBefore(this.element, parent.firstChild);

    if (classes) {
      this.addClasses(classes);
    }

    if (attributes) {
      this.setAttributes(attributes);
    }

    if (innerText) {
      this.setInnerText(innerText);
    }

    return this.element;
  }
}
