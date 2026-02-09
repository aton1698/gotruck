import setFavicon from '../utils/set-favicon';
import { later } from '@ember/runloop';

/**
 * Fija el favicon del tab a /images/icon.png (console/public/images/icon.png)
 * al cargar la app, para que no se reemplace por el icon_url del brand.
 * Se vuelve a aplicar más tarde por si un addon lo cambia de forma asíncrona.
 */
export function initialize() {
    setFavicon();
    later(setFavicon, 800);
}

export default {
    initialize,
};
