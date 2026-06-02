<template>
	<Transition name="toast">
		<div v-if="visible" class="toast" role="status" aria-live="polite">{{ message }}</div>
	</Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const message = ref('');
const visible = ref(false);

let toastTimer: ReturnType<typeof setTimeout> | null = null;

function showToast(text: string) {
	message.value = text;
	visible.value = true;
	if (toastTimer) clearTimeout(toastTimer);
	toastTimer = setTimeout(() => {
		visible.value = false;
	}, 1500);
}

defineExpose({ showToast });
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.toast {
	position: fixed;
	top: 8%;
	left: 50%;
	transform: translateX(-50%);
	padding: 0.6em 1.6em;
	border-radius: $radius-lg;
	background-color: $surface-toast;
	backdrop-filter: $blur-sm;
	-webkit-backdrop-filter: $blur-sm;
	font-family: $font;
	font-size: $font-size-3xl;
	color: $text-primary;
	letter-spacing: $letter-spacing;
	text-transform: uppercase;
	pointer-events: none;
	z-index: $z-toast;
	white-space: nowrap;
	contain: layout style;
}

.toast-enter-active {
	transition:
		opacity $duration-normal $ease-out,
		transform $duration-normal $ease-spring;
}

.toast-leave-active {
	transition:
		opacity $duration-fast $ease-in,
		transform $duration-fast $ease-in;
}

.toast-enter-from {
	opacity: 0;
	transform: translateX(-50%) translateY(-12px);
}

.toast-leave-to {
	opacity: 0;
	transform: translateX(-50%) translateY(-8px);
}
</style>
