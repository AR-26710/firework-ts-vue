import { createI18n } from 'vue-i18n';
import { ref } from 'vue';

const DEFAULT_LOCALE = 'zh-CN';

import zhCN from './locales/zh-CN';

const localeModules = import.meta.glob(['./locales/*.ts', '!./locales/zh-CN.ts']);

const localeNames = Object.keys(localeModules).map((path) =>
	path.replace('./locales/', '').replace('.ts', '')
);

export const supportedLocales: readonly string[] = localeNames;
export type SupportedLocale = string;

function detectBrowserLocale(): SupportedLocale {
	const lang = navigator.language || (navigator as any).userLanguage || '';
	if (lang.startsWith('zh')) return 'zh-CN';
	if (lang.startsWith('en')) return 'en';
	return DEFAULT_LOCALE;
}

const savedLocale = localStorage.getItem('cm_fireworks_locale') || detectBrowserLocale();

const i18n = createI18n({
	legacy: false,
	globalInjection: true,
	locale: savedLocale,
	fallbackLocale: DEFAULT_LOCALE,
	messages: {
		[DEFAULT_LOCALE]: zhCN,
	},
});

const loadedLocales = new Set<string>([DEFAULT_LOCALE]);

/** 当前正在加载的语言名称，响应式 ref，组件可 watch 以显示加载状态 */
export const loadingLocale = ref<string | null>(null);

/** 记录最近一次请求的 locale，用于竞态保护 */
let latestRequestedLocale: string | null = null;

/**
 * 动态加载指定语言的语言包。
 * 如果该语言已加载或正在加载则跳过，否则通过动态 import 加载并合并到 i18n 实例中。
 * @returns 是否加载成功
 */
export async function loadLocaleMessages(locale: string): Promise<boolean> {
	if (loadedLocales.has(locale)) return true;

	const modulePath = `./locales/${locale}.ts`;
	const loader = localeModules[modulePath];
	if (!loader) {
		console.warn(`[i18n] No locale module found for: ${locale}`);
		return false;
	}

	loadingLocale.value = locale;
	latestRequestedLocale = locale;

	try {
		const module = (await loader()) as { default: typeof zhCN };
		if (latestRequestedLocale !== locale) return false;
		i18n.global.setLocaleMessage(locale, module.default);
		loadedLocales.add(locale);
		return true;
	} catch (error) {
		console.error(`[i18n] Failed to load locale "${locale}":`, error);
		return false;
	} finally {
		if (latestRequestedLocale === locale) {
			loadingLocale.value = null;
		}
	}
}

/** 切换语言，自动加载对应语言包。加载失败时回退到默认语言。 */
export async function setLocale(locale: string): Promise<void> {
	const success = await loadLocaleMessages(locale);
	const finalLocale = success ? locale : DEFAULT_LOCALE;
	(i18n.global.locale as any).value = finalLocale;
	localStorage.setItem('cm_fireworks_locale', finalLocale);
	document.documentElement.lang = finalLocale;
	document.title = i18n.global.t('pageTitle');
}

if (savedLocale !== DEFAULT_LOCALE) {
	loadLocaleMessages(savedLocale).then(() => {
		document.documentElement.lang = savedLocale;
		document.title = i18n.global.t('pageTitle');
	});
} else {
	document.documentElement.lang = savedLocale;
	document.title = i18n.global.t('pageTitle');
}

export default i18n;

export type MessageSchema = typeof zhCN;
