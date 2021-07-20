import './global.scss';
import App from './components/App/App.svelte';

new App({
  target: document.getElementById('app'),
  props: {
    // debugTextInputValue: 'https://www.abc.net.au/news/2021-07-15/13446364'
  }
});
