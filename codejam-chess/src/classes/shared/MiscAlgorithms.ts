export class MiscAlgorithms {
  private location = ``;

  private correctFormat = ``;

  public checkAdress(pageName: string, userInput: string): boolean {
    this.location = `#/${pageName}/`;

    this.correctFormat = userInput;

    if (userInput[userInput.length - 1] !== '/') {
      this.correctFormat = `${userInput}/`;
    }

    if (this.location.toLowerCase() === this.correctFormat.toLowerCase()) {
      return true;
    } 
    return false;
    
  }
}
