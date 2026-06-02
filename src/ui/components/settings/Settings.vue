<template>
	<Transition name="setting">
		<div v-if="state.settingOpen" class="setting">
			<a
				href="https://github.com/AR-26710/firework-ts-vue"
				class="setting__github-corner"
				aria-label="View source on GitHub"
				target="_blank"
				rel="noopener noreferrer"
			>
				<svg
					width="80"
					height="80"
					viewBox="0 0 250 250"
					style="
						fill: #151513;
						color: #fff;
						position: absolute;
						top: 0;
						border: 0;
						left: 0;
						transform: scale(-1, 1);
					"
					aria-hidden="true"
				>
					<path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path>
					<path
						d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2"
						fill="currentColor"
						style="transform-origin: 130px 106px"
						class="octo-arm"
					></path>
					<path
						d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,108.9 155.7,103.6 150.7,99.1 C145.8,94.6 139.4,91.9 134.3,92.0 L121.5,104.9 C119.8,106.1 114.6,108.7 113.0,108.6"
						fill="currentColor"
						style="transform-origin: 130px 106px"
						class="octo-body"
					></path>
				</svg>
			</a>
			<div class="setting__inner-wrap">
				<button
					type="button"
					class="setting__close-btn"
					:aria-label="$t('a11y.closesetting')"
					@click="onClosesetting"
				>
					<Icon icon="mdi:close" color="white" width="24" height="24" aria-hidden="true" />
				</button>
				<div class="setting__header-area">
					<div class="setting__header">{{ $t('setting.title') }}</div>
					<div class="setting__subheader">{{ $t('setting.subtitle') }}</div>
					<form @submit.prevent>
						<div class="setting__tab-nav">
							<button
								type="button"
								class="setting__tab-nav-item"
								:class="{ active: activeTab === 'display' }"
								@click="activeTab = 'display'"
							>
								{{ $t('setting.display') }}
							</button>
							<button
								type="button"
								class="setting__tab-nav-item"
								:class="{ active: activeTab === 'firework' }"
								@click="activeTab = 'firework'"
							>
								{{ $t('setting.firework') }}
							</button>
							<button
								type="button"
								class="setting__tab-nav-item"
								:class="{ active: activeTab === 'textFirework' }"
								@click="activeTab = 'textFirework'"
							>
								{{ $t('setting.textFireworkTab') }}
							</button>
							<button
								type="button"
								class="setting__tab-nav-item"
								:class="{ active: activeTab === 'language' }"
								@click="activeTab = 'language'"
							>
								{{ $t('setting.language') }}
							</button>
						</div>
					</form>
				</div>
				<div class="setting__content-area">
					<form @submit.prevent>
						<DisplayTab v-show="activeTab === 'display'" />
						<BehaviorTab v-show="activeTab === 'firework'" />
						<TextFireworkTab v-show="activeTab === 'textFirework'" />
						<LanguageTab v-show="activeTab === 'language'" />
					</form>
					<div class="setting__credits">
						<i18n-t keypath="setting.credits" tag="span">
							<template #link1>
								<a href="https://cmiller.tech/" target="_blank" rel="noopener noreferrer">
									Caleb Miller
								</a>
							</template>
							<template #link2>
								<a
									href="https://codepen.io/MillerTime/pen/XgpNwb"
									target="_blank"
									rel="noopener noreferrer"
								>
									Firework Simulator v2
								</a>
							</template>
						</i18n-t>
					</div>
					<div class="setting__shortcuts-btn-wrap">
						<button type="button" class="setting__shortcuts-btn" @click="openHelp('shortcuts')">
							{{ $t('setting.shortcuts') }}
						</button>
					</div>
				</div>
			</div>
		</div>
	</Transition>
</template>

<script setup lang="ts">
import { useStore, useActions } from '@/ui/vue-store';
import { ref, onMounted, onUnmounted } from 'vue';
import { Icon } from '@iconify/vue';
import DisplayTab from './DisplayTab.vue';
import BehaviorTab from './BehaviorTab.vue';
import TextFireworkTab from './TextFireworkTab.vue';
import LanguageTab from './LanguageTab.vue';

const state = useStore();
const actions = useActions();

const tabs = ['display', 'firework', 'textFirework', 'language'] as const;
const activeTab = ref<(typeof tabs)[number]>('display');

function onKeydown(e: KeyboardEvent) {
	if (!state.settingOpen) return;
	if (
		e.target instanceof HTMLInputElement ||
		e.target instanceof HTMLTextAreaElement ||
		e.target instanceof HTMLSelectElement
	)
		return;
	const idx = tabs.indexOf(activeTab.value);
	if (e.key === 'ArrowLeft') {
		e.preventDefault();
		activeTab.value = tabs[(idx - 1 + tabs.length) % tabs.length];
	} else if (e.key === 'ArrowRight') {
		e.preventDefault();
		activeTab.value = tabs[(idx + 1) % tabs.length];
	}
}

onMounted(() => document.addEventListener('keydown', onKeydown));
onUnmounted(() => document.removeEventListener('keydown', onKeydown));

function onClosesetting() {
	actions.toggleSetting(false);
}

function openHelp(topic: string) {
	actions.setState({ openHelpTopic: topic });
}
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.setting {
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: $surface-overlay;
	backdrop-filter: $blur-md;
	-webkit-backdrop-filter: $blur-md;
	contain: layout style;

	&__inner-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		transition: opacity $duration-moderate;
	}

	&__header-area {
		flex-shrink: 0;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: $space-15 $space-4 0;
	}

	&__content-area {
		flex: 1;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
		padding: 0 $space-4 $space-4;
	}

	&__header {
		margin-bottom: $space-1;
		font-size: $font-size-4xl;
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	&__subheader {
		margin-bottom: $space-4;
		font-size: 0.86em;
		opacity: $opacity-dim;
	}

	&__close-btn {
		position: fixed;
		top: $space-2;
		right: $space-2;
		z-index: $z-close-btn;
		opacity: $opacity-dim;
		width: 50px;
		height: 50px;
		display: flex;
		align-items: center;
		justify-content: center;
		user-select: none;
		cursor: default;
		transition: opacity $duration-moderate;
		background: none;
		border: none;
		padding: 0;
		font: inherit;
		color: inherit;
		-webkit-tap-highlight-color: transparent;

		@media (min-width: $small-bp) {
			&:hover {
				opacity: $opacity-bright;
			}
		}
	}

	&__tab-nav {
		display: flex;
		gap: $space-1;
		margin-bottom: $space-4;
		border: 1px solid $border-default;
		border-radius: $radius-xl;
		background-color: $surface-glass;
		padding: $space-1;
		overflow: hidden;
	}

	&__tab-nav-item {
		flex: 1;
		padding: $space-2 $space-3;
		font-family: $font;
		font-size: $font-size-sm;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: $text-tertiary;
		background: none;
		border: none;
		border-radius: 7px;
		cursor: pointer;
		transition:
			color $duration-normal,
			background-color $duration-normal;

		&:hover {
			color: $text-secondary;
			background-color: $interaction-hover-strong;
		}

		&.active {
			color: $text-primary;
			background-color: $primary-350;
		}

		&:focus-visible {
			outline: 2px solid $primary;
			outline-offset: -2px;
		}
	}

	form {
		width: 100%;
		max-width: 440px;
	}

	&__header-area form {
		margin-bottom: 0;
	}

	&__credits {
		margin-top: $space-4;
		padding-top: $space-3;
		border-top: 1px solid $border-subtle;
		font-size: $font-size-sm;
		opacity: $opacity-dim;

		a {
			color: $ui-color;
			text-decoration: none;

			&:hover,
			&:active {
				color: $text-secondary;
				text-decoration: underline;
			}
		}
	}

	&__shortcuts-btn-wrap {
		margin-top: $space-3;
		padding-top: $space-3;
		border-top: 1px solid $border-subtle;
	}

	&__shortcuts-btn {
		outline: none;
		border: 1px solid $border-strong;
		border-radius: $radius-md;
		padding: 0.4em 1.2em;
		font-family: $font;
		font-size: 0.85em;
		color: $ui-color;
		text-transform: uppercase;
		letter-spacing: $letter-spacing;
		background-color: $surface-input;
		cursor: pointer;
		transition:
			color $duration-moderate,
			background-color $duration-moderate,
			border-color $duration-moderate;

		&:hover,
		&:active,
		&:focus {
			color: $text-primary;
			background-color: $surface-input-focus;
			border-color: $border-hover;
		}

		&:focus-visible {
			outline: 2px solid $primary;
			outline-offset: 2px;
		}
	}

	&__github-corner {
		position: absolute;
		top: 0;
		left: 0;
		z-index: $z-github-corner;

		&:hover .octo-arm {
			animation: octocat-wave 560ms $ease-in-out;
		}

		svg {
			fill: #151513;
			color: $text-primary;
		}
	}
}

@keyframes octocat-wave {
	0%,
	100% {
		transform: rotate(0);
	}
	20%,
	60% {
		transform: rotate(-25deg);
	}
	40%,
	80% {
		transform: rotate(10deg);
	}
}

@media (max-width: 500px) {
	.setting__github-corner:hover .octo-arm {
		animation: none;
	}

	.setting__github-corner .octo-arm {
		animation: octocat-wave 560ms $ease-in-out;
	}
}

.setting-enter-active {
	transition: opacity $duration-slower $ease-out;
}

.setting-leave-active {
	transition: opacity $duration-moderate $ease-in;
}

.setting-enter-from,
.setting-leave-to {
	opacity: 0;
}
</style>
