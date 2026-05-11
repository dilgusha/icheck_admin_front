export default defineEventHandler((event) => {
  const langHeader = getHeader(event, 'accept-language');
  const lang = langHeader?.split(',')[0] || 'az';
  event.context.language = lang;
});
