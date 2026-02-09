/**
 * Fuerza el favicon del tab del navegador a /images/icon.png (icono de la app).
 * Se llama al cargar la consola para que no se reemplace por el icon_url del brand.
 */
export default function setFavicon() {
    const href = '/images/icon.png';
    if (typeof document === 'undefined' || !document.head) return;

    const selectors = [
        'link[rel="icon"]',
        'link[rel="shortcut icon"]',
        'link[rel="apple-touch-icon"]',
    ];

    selectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((link) => {
            link.setAttribute('href', href);
        });
    });

    // Si no existe ningún link rel=icon, crear uno
    if (!document.querySelector('link[rel="icon"]')) {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/png';
        link.href = href;
        document.head.appendChild(link);
    }
}
