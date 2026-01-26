import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    lng: 'en',
    ns: ['common'],
    defaultNS: 'common',
    backend: {
      loadPath: '/locales/{{lng}}/common.json',
    },
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false // Set to false to avoid issues with Next.js SSR
    }
  });

export default i18n;
