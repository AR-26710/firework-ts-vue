<template>
	<div class="tab-panel">
		<div class="option-group">
			<div class="option-group__header">{{ $t('setting.graphicsGroup') }}</div>
			<FormSelect
				id="quality-ui"
				v-model="state.config.quality"
				:label="$t('setting.quality')"
				help-topic="quality"
				:options="qualityOptions"
				@change="onConfigChange"
				@help="openHelp"
			/>
			<FormSelect
				id="sky-lighting"
				v-model="state.config.skyLighting"
				:label="$t('setting.skyLighting')"
				help-topic="skyLighting"
				:options="skyLightingOptions"
				@change="onConfigChange"
				@help="openHelp"
			/>
			<FormCheckbox
				id="long-exposure"
				v-model="state.config.longExposure"
				:label="$t('setting.longExposure')"
				help-topic="longExposure"
				@change="onConfigChange"
				@help="openHelp"
			/>
		</div>
		<div class="option-group">
			<div class="option-group__header">{{ $t('setting.viewGroup') }}</div>
			<FormSelect
				id="scaleFactor"
				v-model="scaleFactorModel"
				:label="$t('setting.scaleFactor')"
				help-topic="scaleFactor"
				:options="scaleFactorOptions"
				@change="onScaleConfigChange"
				@help="openHelp"
			/>
			<FormCheckbox
				v-if="isFullscreenEnabled"
				id="fullscreen"
				v-model="state.fullscreen"
				:label="$t('setting.fullscreen')"
				help-topic="fullscreen"
				@change="onFullscreenChange"
				@help="openHelp"
			/>
			<FormCheckbox
				id="hide-controls"
				v-model="state.config.hideControls"
				:label="$t('setting.hideControls')"
				help-topic="hideControls"
				@change="onConfigChange"
				@help="openHelp"
			/>
			<FormCheckbox
				id="hide-toast"
				v-model="state.config.hideToast"
				:label="$t('setting.hideToast')"
				help-topic="hideToast"
				@change="onConfigChange"
				@help="openHelp"
			/>
			<FormCheckbox
				id="hide-cursor"
				v-model="state.config.hideCursor"
				:label="$t('setting.hideCursor')"
				help-topic="hideCursor"
				@change="onHideCursorChange"
				@help="openHelp"
			/>
			<FormCheckbox
				v-if="!state.config.hideCursor"
				id="auto-hide-cursor"
				v-model="state.config.autoHideCursor"
				:label="$t('setting.autoHideCursor')"
				help-topic="autoHideCursor"
				@change="onAutoHideCursorChange"
				@help="openHelp"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore, useActions } from '@/ui/vue-store';
import { fullscreenEnabled } from '@/store/actions';
import {
	QUALITY_LOW,
	QUALITY_NORMAL,
	QUALITY_HIGH,
	SKY_LIGHT_NONE,
	SKY_LIGHT_DIM,
	SKY_LIGHT_NORMAL,
} from '@/core/constants';
import { handleResize } from '@/game-loop';
import { applyCursorHideState } from '@/input/cursor-manager';
import FormSelect from '../form/FormSelect.vue';
import FormCheckbox from '../form/FormCheckbox.vue';

const { t } = useI18n({ useScope: 'global' });
const state = useStore();
const actions = useActions();

const isFullscreenEnabled = fullscreenEnabled();

const qualityOptions = computed(() => [
	{ label: t('quality.low'), value: String(QUALITY_LOW) },
	{ label: t('quality.medium'), value: String(QUALITY_NORMAL) },
	{ label: t('quality.high'), value: String(QUALITY_HIGH) },
]);

const skyLightingOptions = computed(() => [
	{ label: t('skyLighting.none'), value: String(SKY_LIGHT_NONE) },
	{ label: t('skyLighting.dim'), value: String(SKY_LIGHT_DIM) },
	{ label: t('skyLighting.normal'), value: String(SKY_LIGHT_NORMAL) },
]);

const scaleFactorOptions = [0.5, 0.62, 0.75, 0.9, 1.0, 1.5, 2.0].map((value) => ({
	value: value.toFixed(2),
	label: `${value * 100}%`,
}));

const scaleFactorModel = computed({
	get: () => state.config.scaleFactor.toFixed(2),
	set: (val: string) => {
		state.config.scaleFactor = parseFloat(val);
	},
});

function onConfigChange() {
	setTimeout(() => actions.updateConfig(), 0);
}

function onFullscreenChange() {
	setTimeout(() => actions.toggleFullscreen(), 0);
}

function onScaleConfigChange() {
	setTimeout(() => {
		actions.updateConfig();
		handleResize();
	}, 0);
}

function onHideCursorChange() {
	setTimeout(() => {
		// 互斥：启用手动隐藏时关闭自动隐藏
		if (state.config.hideCursor) {
			state.config.autoHideCursor = false;
		}
		actions.updateConfig();
		applyCursorHideState();
	}, 0);
}

function onAutoHideCursorChange() {
	setTimeout(() => {
		// 互斥：启用自动隐藏时关闭手动隐藏
		if (state.config.autoHideCursor) {
			state.config.hideCursor = false;
		}
		actions.updateConfig();
		applyCursorHideState();
	}, 0);
}

function openHelp(topic: string) {
	actions.setState({ openHelpTopic: topic });
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

.option-group {
	&:not(:last-child) {
		border-bottom: 1px solid $border-subtle;
		margin-bottom: $space-2;
		padding-bottom: $space-2;
	}

	&__header {
		padding: $space-2 $space-4 $space-1;
		font-size: $font-size-sm;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		opacity: $opacity-dim;
	}
}
</style>
