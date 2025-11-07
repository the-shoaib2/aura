import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';

if (!i18next.isInitialized) {
	i18next.use(initReactI18next).init({
		resources: {
			en: {
				translation: en,
			},
		},
		lng: 'en',
		fallbackLng: 'en',
		interpolation: {
			escapeValue: false,
		},
		react: {
			useSuspense: false,
		},
	});
}

export default i18next;
export { i18next as i18n };
