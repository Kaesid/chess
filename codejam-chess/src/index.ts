import './sass/main.scss';
import { Controller } from './classes/Controller';
//-----------------------------------------

window.onload = () => {
  const app = new Controller();
  app.start();
};
