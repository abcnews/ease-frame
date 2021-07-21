import './global.scss';
import App from './components/App/App.svelte';

const target = document.getElementById('app');

if (target) {
  new App({
    target,
    props: {}
  });
}
