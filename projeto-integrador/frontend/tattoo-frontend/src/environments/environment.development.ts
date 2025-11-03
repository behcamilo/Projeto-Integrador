export const environment = {
    production: false,
    // O proxy irá interceptar todas as chamadas que começam com /api/tattoo
    // e redirecioná-las internamente para o backend.
    apiUrl: 'http://localhost:8000/api/tattoo'
};
