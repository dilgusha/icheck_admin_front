export default defineNuxtPlugin((nuxtApp) => {
  const langCookie = useCookie('lang', { default: () => 'az' });

  const api = $fetch.create({
    onRequest({ options }) {
      // Hər sorğu zamanı cookie-dən ən son dili oxuyuruq
      const currentLang = langCookie.value || 'az';
      
      options.headers = {
        ...options.headers,
        'Accept-Language': currentLang,
      };
    },
    onResponseError({ response }) {
      if (response.status === 400) {
        console.error('Dil dəstəklənmir və ya sorğu səhvdir');
      }
    }
  });

  return {
    provide: { api },
  };
});