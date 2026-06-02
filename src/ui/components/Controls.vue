<template>
	<div
		class="controls"
		:class="{
			hide: state.config.hideControls,
			'panel-open': state.settingOpen || state.openHelpTopic === 'shortcuts',
		}"
		role="toolbar"
		:aria-label="$t('a11y.settings')"
	>
		<button
			class="btn pause-btn"
			:aria-label="state.paused ? $t('a11y.resume') : $t('a11y.pause')"
			@click="onPause"
		>
			<Icon :icon="pauseIcon" color="white" width="24" height="24" aria-hidden="true" />
		</button>
		<button
			class="btn sound-btn"
			:aria-label="soundEnabledSelector(state) ? $t('a11y.soundOn') : $t('a11y.soundOff')"
			@click="onSound"
		>
			<Icon :icon="soundIcon" color="white" width="24" height="24" aria-hidden="true" />
		</button>
		<button class="btn shortcuts-btn" :aria-label="$t('a11y.shortcuts')" @click="onShortcuts">
			<Icon icon="mdi:keyboard" color="white" width="24" height="24" aria-hidden="true" />
		</button>
		<button class="btn settings-btn" :aria-label="$t('a11y.settings')" @click="onSettings">
			<Icon icon="mdi:cog" color="white" width="24" height="24" aria-hidden="true" />
		</button>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useStore, useActions } from '@/ui/vue-store';
import { soundEnabledSelector } from '@/store/selectors';

const state = useStore();
const actions = useActions();

const pauseIcon = computed(() => (state.paused ? 'mdi:play' : 'mdi:pause'));
const soundIcon = computed(() =>
	soundEnabledSelector(state) ? 'mdi:volume-high' : 'mdi:volume-off'
);

function onPause() {
	actions.togglePause();
}

function onSound() {
	actions.toggleSound();
}

function onShortcuts() {
	if (state.openHelpTopic === 'shortcuts') {
		actions.setState({ openHelpTopic: null });
	} else {
		actions.setState({ openHelpTopic: 'shortcuts' });
	}
}

function onSettings() {
	actions.toggleSetting();
}
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.controls {
	position: absolute;
	top: 0;
	right: 0;
	display: flex;
	align-items: center;
	gap: $space-2;
	padding: $space-3 $space-4;
	transition:
		opacity $duration-moderate,
		visibility $duration-moderate;
	z-index: $z-controls;

	@media (min-width: $large-bp) {
		visibility: visible;

		&.hide:hover {
			opacity: 1;
		}
	}

	&.panel-open {
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
	}
}

.btn {
	$size: 44px;
	opacity: $opacity-disabled;
	width: $size;
	height: $size;
	display: flex;
	align-items: center;
	justify-content: center;
	user-select: none;
	cursor: default;
	transition:
		opacity $duration-fast,
		background-color $duration-fast;
	background: transparent;
	border: none;
	border-radius: $radius-md;
	padding: 0;
	font: inherit;
	color: inherit;
	-webkit-tap-highlight-color: transparent;

	&--bright {
		opacity: $opacity-dim;
	}

	@media (min-width: $small-bp) {
		&:hover {
			opacity: $opacity-faint;
			background-color: $interaction-hover;
		}

		&--bright:hover {
			opacity: $opacity-bright;
			background-color: $interaction-hover;
		}
	}

	:deep(svg) {
		display: block;
		margin: auto;
	}
}
</style>
