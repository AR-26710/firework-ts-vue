<template>
	<div class="tab-panel">
		<div class="language-selector">
			<button
				type="button"
				class="language-btn"
				:class="{ active: currentLocale === 'zh-CN' }"
				:disabled="isLocaleLoading('zh-CN')"
				@click="selectLanguage('zh-CN')"
			>
				<Icon icon="circle-flags:zh" width="24" height="24" />
				<span class="language-name">简体中文</span>
				<span v-if="isLocaleLoading('zh-CN')" class="loading-dot" />
			</button>
			<button
				type="button"
				class="language-btn"
				:class="{ active: currentLocale === 'en' }"
				:disabled="isLocaleLoading('en')"
				@click="selectLanguage('en')"
			>
				<Icon icon="circle-flags:us" width="24" height="24" />
				<span class="language-name">English</span>
				<span v-if="isLocaleLoading('en')" class="loading-dot" />
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ref } from 'vue';
import { setLocale, loadingLocale } from '@/i18n';

const currentLocale = ref(localStorage.getItem('cm_fireworks_locale') || 'zh-CN');

const isLocaleLoading = (locale: string) => loadingLocale.value === locale;

function selectLanguage(locale: 'zh-CN' | 'en') {
	if (currentLocale.value === locale || loadingLocale.value) return;
	currentLocale.value = locale;
	setLocale(locale);
}
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.tab-panel {
	border: 1px solid $border-default;
	border-radius: $radius-xl;
	background-color: $surface-glass;
	overflow: hidden;
	padding: $space-1 0 $space-2;
}

.language-selector {
	display: flex;
	gap: $space-3;
	padding: $space-2 $space-4;
}

.language-btn {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: $space-2 + $space-1;
	padding: $space-3 $space-4;
	font-family: $font;
	font-size: $font-size-md;
	color: $ui-color;
	letter-spacing: $letter-spacing;
	background-color: $interaction-hover-strong;
	border: 1px solid $border-medium;
	border-radius: $radius-lg;
	cursor: pointer;
	transition: all $duration-normal $ease-default;

	&:hover {
		background-color: $surface-input-hover;
		border-color: $border-hover;
		transform: translateY(-2px);
	}

	&:focus-visible {
		outline: 2px solid $primary;
		outline-offset: 2px;
	}

	&.active {
		background-color: $primary-200;
		border-color: $border-primary;
		color: $text-primary;

		.language-name {
			font-weight: 600;
		}
	}

	.language-name {
		text-transform: uppercase;
	}
}
</style>
