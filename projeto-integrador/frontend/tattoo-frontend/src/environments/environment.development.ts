export const environment = {
    production: false,
    // O proxy irá interceptar todas as chamadas que começam com /api/tattoo
    // e redirecioná-las internamente para o backend.
    
    // CORREÇÃO: A URL deve ser relativa para o proxy funcionar.
    apiUrl: '/api/tattoo' 
};