const apiUrl = (() => {
    // Ajusta este puerto si tu API está expuesto en otro binding.
    const apiPort = '84';

    // Si no hay window (SSR/tests), dejamos relativo.
    if (typeof window === 'undefined') return '/api';

    // Si estamos navegando en el mismo puerto del API, usamos mismo origen.
    if (window.location.port === apiPort) return '/api';

    // Si el front está en otro puerto, apuntamos al mismo host pero al puerto del API.
    return `${window.location.protocol}//${window.location.hostname}:${apiPort}/api`;
})();

export const environment = {
    production: true,
    /**
     * En producción NO se usa proxy del dev-server.
     * Soporta despliegue en IIS con frontend y API en el mismo host pero distintos puertos.
     */
    apiUrl
};