<template>
	<Transition name="loading-fade" @after-leave="$emit('done')">
		<div v-if="visible" class="loading-init" role="status" aria-live="polite">
			<div class="loading-init__sparkle">
				<span
					v-for="i in 3"
					:key="i"
					class="loading-init__dot"
					:style="{ animationDelay: `${(i - 1) * 0.18}s` }"
				></span>
			</div>
			<div class="loading-init__header">{{ t('loading.title') }}</div>
			<div class="loading-init__status">{{ status }}</div>
		</div>
	</Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n({ useScope: 'global' });

defineProps<{
	status: string;
}>();

const MIN_DISPLAY_MS = 1500;
const mountTime = ref(Date.now());
const visible = ref(true);

defineEmits<{
	(e: 'done'): void;
}>();

function requestReady() {
	const elapsed = Date.now() - mountTime.value;
	const remaining = MIN_DISPLAY_MS - elapsed;
	if (remaining > 0) {
		setTimeout(() => {
			visible.value = false;
		}, remaining);
	} else {
		visible.value = false;
	}
}

defineExpose({ requestReady });
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.loading-init {
	position: fixed;
	inset: 0;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 100%;
	text-align: center;
	text-transform: uppercase;
	contain: layout style;
	z-index: 9999;
	background: #000;

	&__sparkle {
		display: flex;
		justify-content: center;
		gap: $space-2;
		margin-bottom: $space-6;
	}

	&__dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background-color: $primary;
		animation: dot-pulse 1.2s $ease-in-out infinite;

		@keyframes dot-pulse {
			0%,
			80%,
			100% {
				opacity: 0.2;
				transform: scale(0.6);
			}
			40% {
				opacity: 1;
				transform: scale(1);
			}
		}
	}

	&__header {
		font-size: $font-size-5xl;
		letter-spacing: 0.1em;
		animation: fade-in 0.6s $ease-out both;
	}

	&__status {
		margin-top: $space-4;
		font-size: $font-size-sm;
		opacity: $opacity-dim;
		animation: fade-in 0.6s $ease-out 0.2s both;
	}
}

@keyframes fade-in {
	from {
		opacity: 0;
		transform: translateY(8px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.loading-fade-leave-active {
	transition: opacity 0.4s $ease-out;
}

.loading-fade-leave-to {
	opacity: 0;
}
</style>
