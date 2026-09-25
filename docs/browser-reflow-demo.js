import { init } from '../packages/js/dist/index.js';

init(document);

const dialog = document.querySelector('#test-dialog');
document.querySelector('#open-test-dialog')?.addEventListener('click', () => dialog?.showModal());
for (const button of document.querySelectorAll('[data-close-dialog]')) {
  button.addEventListener('click', () => dialog?.close());
}
