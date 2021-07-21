import './global.scss';
import App from './components/App/App.svelte';

const target = document.getElementById('app');

if (target) {
  new App({
    target,
    props: {
      // debugTextInputValue: 'https://www.abc.net.au/news/2021-07-15/13446364'
    }
  });
}
