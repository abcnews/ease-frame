import type { ImportedProject } from './constants';
import './global.scss';
import App from './components/App/App.svelte';

const target = document.getElementById('app');

if (target) {
  const [baseURL, urlParamsString] = window.location.href.split('?');
  const searchParams = new URLSearchParams(urlParamsString);
  const importedProject = searchParams.has('v')
    ? ({
        videoReference: searchParams.get('v'),
        timesMS: (searchParams.get('t') || '').split('-').map(x => +x),
        background: searchParams.get('b'),
        inset: searchParams.get('i'),
        orientation: searchParams.get('o')
      } as ImportedProject)
    : undefined;

  history.replaceState(null, '', baseURL);

  new App({
    target,
    props: {
      importedProject
    }
  });
}
