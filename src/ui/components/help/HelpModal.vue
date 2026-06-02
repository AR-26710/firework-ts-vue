<template>
	<Transition name="help">
		<div
			v-if="!!state.openHelpTopic && state.openHelpTopic !== 'shortcuts'"
			class="help-modal"
			@click="closeHelp"
		>
			<div class="help-modal__container" @click.stop>
				<div class="help-modal__header">
					<div class="help-modal__header-left">
						<Icon :icon="topicIcon" width="20" height="20" aria-hidden="true" />
						<span class="help-modal__title">{{ header }}</span>
					</div>
					<button
						type="button"
						class="help-modal__close-btn"
						:aria-label="$t('a11y.closeHelp')"
						@click.prevent="closeHelp"
					>
						<Icon icon="mdi:close" width="18" height="18" aria-hidden="true" />
					</button>
				</div>
				<div class="help-modal__body" tabindex="0">{{ body }}</div>
			</div>
		</div>
	</Transition>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useStore, useActions } from '@/ui/vue-store';
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue';

const { t } = useI18n({ useScope: 'global' });
const state = useStore();
const actions = useActions();

const dialogRef = ref<HTMLElement | null>(null);
let previousFocusEl: HTMLElement | null = null;

const topicIconMap: Record<string, string> = {
	shellType: 'mdi:firework',
	shellSize: 'mdi:resize',
	quality: 'mdi:high-definition-box',
	skyLighting: 'mdi:weather-night',
	scaleFactor: 'mdi:magnify-scan',
	autoLaunch: 'mdi:rocket-launch',
	finaleMode: 'mdi:fire',
	launchSequence: 'mdi:sine-wave',
	hideControls: 'mdi:eye-off',
	hideToast: 'mdi:message-off',
	fullscreen: 'mdi:fullscreen',
	longExposure: 'mdi:camera-iris',
	textFirework: 'mdi:format-text',
	textRandomColor: 'mdi:palette',
	textRandomPosition: 'mdi:shuffle-variant',
	textRandomPositionShuffle: 'mdi:sort',
	textSingleCluster: 'mdi:group',
	textDisplayCount: 'mdi:counter',
};

const topicIcon = computed(() => {
	if (!state.openHelpTopic) return 'mdi:help-circle-outline';
	return topicIconMap[state.openHelpTopic] || 'mdi:help-circle-outline';
});

const header = computed(() => {
	if (!state.openHelpTopic) return '';
	return t(`help.${state.openHelpTopic}.header`) || '';
});

const body = computed(() => {
	if (!state.openHelpTopic) return '';
	if (state.openHelpTopic === 'shortcuts') {
		return '';
	}
	return t(`help.${state.openHelpTopic}.body`) || '';
});

watch(
	() => state.openHelpTopic,
	async (topic, oldTopic) => {
		if (topic && topic !== 'shortcuts' && !oldTopic) {
			previousFocusEl = document.activeElement as HTMLElement;
			await nextTick();
			dialogRef.value?.focus();
		} else if (!topic && oldTopic) {
			if (previousFocusEl) {
				setTimeout(() => {
					previousFocusEl?.focus();
					previousFocusEl = null;
				}, 300);
			}
		}
	}
);

function onKeydown(e: KeyboardEvent) {
	if (!state.openHelpTopic || state.openHelpTopic === 'shortcuts') return;
	if (
		e.target instanceof HTMLInputElement ||
		e.target instanceof HTMLTextAreaElement ||
		e.target instanceof HTMLSelectElement
	)
		return;

	if (e.key === 'Escape') {
		e.preventDefault();
		closeHelp();
	}
}

onMounted(() => document.addEventListener('keydown', onKeydown));
onUnmounted(() => document.removeEventListener('keydown', onKeydown));

function closeHelp(event?: Event) {
	if (event) {
		event.preventDefault();
		event.stopPropagation();
	}
	actions.setState({ openHelpTopic: null });
}
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.help-modal {
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: rgba(0, 0, 0, 0.82);
	backdrop-filter: $blur-lg;
	-webkit-backdrop-filter: $blur-lg;
	display: flex;
	align-items: flex-end;
	justify-content: center;
	padding: $space-4;
	overflow: hidden;

	@media (min-width: $small-bp) {
		align-items: center;
		padding: $space-8;
	}

	&__container {
		width: 100%;
		max-width: 480px;
		max-height: 85vh;
		display: flex;
		flex-direction: column;
		background-color: rgba(15, 15, 20, 0.95);
		border: 1px solid $border-default;
		border-radius: $radius-2xl;
		overflow: hidden;
		box-shadow:
			0 0 0 1px rgba(255, 255, 255, 0.04),
			0 24px 80px rgba(0, 0, 0, 0.6);

		@media (min-width: $small-bp) {
			max-width: 520px;
			max-height: 80vh;
		}
	}

	&__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: $space-4 $space-4 0;
	}

	&__header-left {
		display: flex;
		align-items: center;
		gap: $space-2;
		color: $primary-600;
	}

	&__title {
		font-size: $font-size-lg;
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: $text-primary;
	}

	&__close-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border: 1px solid $border-default;
		border-radius: $radius-md;
		background: $surface-input;
		color: $text-tertiary;
		cursor: pointer;
		transition:
			color $duration-normal,
			background-color $duration-normal,
			border-color $duration-normal;
		padding: 0;

		&:hover {
			color: $text-primary;
			background-color: $surface-input-hover;
			border-color: $border-hover;
		}

		&:focus-visible {
			outline: 2px solid $primary;
			outline-offset: 2px;
		}
	}

	&__body {
		flex: 1;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
		padding: $space-4;
		font-size: $font-size-md;
		line-height: $line-height-relaxed;
		color: $text-secondary;
		outline: none;
		scrollbar-width: thin;
		scrollbar-color: rgba(255, 255, 255, 0.15) transparent;

		&::-webkit-scrollbar {
			width: 5px;
		}

		&::-webkit-scrollbar-track {
			background: transparent;
		}

		&::-webkit-scrollbar-thumb {
			background-color: rgba(255, 255, 255, 0.15);
			border-radius: $radius-pill;

			&:hover {
				background-color: rgba(255, 255, 255, 0.25);
			}
		}
	}
}

.help-enter-active {
	transition:
		opacity $duration-moderate $ease-out,
		transform $duration-slow $ease-spring;

	.help-modal__container {
		transition: transform $duration-slow $ease-spring;
	}
}

.help-leave-active {
	transition:
		opacity $duration-slower cubic-bezier(0.4, 0, 1, 1),
		transform $duration-slower cubic-bezier(0.4, 0, 1, 1);

	.help-modal__container {
		transition: transform $duration-slower cubic-bezier(0.4, 0, 0.2, 1);
	}
}

.help-enter-from,
.help-leave-to {
	opacity: 0;
}

.help-enter-from .help-modal__container {
	transform: translateY(40px);
}

.help-leave-to .help-modal__container {
	transform: translateY(30px);
}

@media (min-width: $small-bp) {
	.help-enter-from .help-modal__container {
		transform: translateY(0) scale(0.96);
	}

	.help-leave-to .help-modal__container {
		transform: translateY(0) scale(0.94);
	}
}
</style>
