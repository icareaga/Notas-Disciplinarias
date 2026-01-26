export const environment = {
    production: false,
    /**
     * En desarrollo apuntamos a `/api` y Angular hace proxy hacia el backend
     * local (ver `proxy.conf.json`). Esto evita CORS y permite usar https://localhost:7199.
     */
    apiUrl: "/api"
};