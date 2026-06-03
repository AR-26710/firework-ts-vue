<template>
	<LoadingInit v-if="!ready" ref="loadingRef" :status="loadingStatus" @done="ready = true" />
	<div v-else class="stage-container">
		<div
			ref="canvasContainer"
			class="canvas-container"
			:class="{ blur: state.settingOpen || state.openHelpTopic === 'shortcuts' }"
			:style="canvasBgStyle"
		>
			<canvas id="trails-canvas" role="img" :aria-label="$t('a11y.canvas')"></canvas>
			<canvas
				id="main-canvas"
				role="img"
				:aria-label="$t('a11y.canvas')"
				aria-hidden="true"
			></canvas>
		</div>
		<Controls />
		<TextInputBar />
		<Toast ref="toastRef" />
		<Settings />
		<HelpModal />
		<ShortcutsHelp />
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from '@/ui/vue-store';
import { SKY_LIGHT_NONE } from '@/core/constants';
import { quality } from '@/core/state';
import { Spark } from '@/simulation/particles/spark';
import Controls from '@/ui/components/Controls.vue';
import Settings from '@/ui/components/settings/Settings.vue';
import HelpModal from '@/ui/components/help/HelpModal.vue';
import ShortcutsHelp from '@/ui/components/help/ShortcutsHelp.vue';
import TextInputBar from '@/ui/components/TextInputBar.vue';
import Toast from '@/ui/components/Toast.vue';
import LoadingInit from '@/ui/components/LoadingInit.vue';

const state = useStore();
const { t } = useI18n({ useScope: 'global' });

const ready = ref(false);
const loadingStatus = ref(t('loading.status'));
const toastRef = ref<InstanceType<typeof Toast> | null>(null);
const loadingRef = ref<InstanceType<typeof LoadingInit> | null>(null);
const canvasContainer = ref<HTMLElement | null>(null);

function setLoadingStatus(status: string) {
	loadingStatus.value = status;
}

const canvasBgStyle = computed(() => {
	if (+state.config.skyLighting === SKY_LIGHT_NONE) {
		return { backgroundColor: '#000' };
	}
	return {};
});

watch(
	() => state.config.quality,
	() => {
		Spark.drawWidth = quality === 3 ? 0.75 : 1;
	},
	{ immediate: true }
);

let onReadyCallback: (() => void) | null = null;

watch(ready, (isReady) => {
	if (isReady && onReadyCallback) {
		nextTick(() => onReadyCallback!());
	}
});

function onReady(cb: () => void) {
	if (ready.value) {
		nextTick(() => cb());
	} else {
		onReadyCallback = cb;
	}
}

function showToast(text: string) {
	toastRef.value?.showToast(text);
}

function requestReady() {
	loadingRef.value?.requestReady();
}

defineExpose({ showToast, canvasContainer, setLoadingStatus, requestReady, onReady });
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.stage-container {
	overflow: hidden;
	box-sizing: initial;
	border: 1px solid #222;
	margin: -1px;

	@media (max-width: $large-bp) {
		border: none;
		margin: 0;
	}
}

.canvas-container {
	width: 100%;
	height: 100%;
	transition: filter $duration-moderate;

	canvas {
		position: absolute;
		mix-blend-mode: lighten;
		transform: translateZ(0);
	}
}
</style>
