<template>
	<div class="loading-init" role="status" aria-live="polite">
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
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n({ useScope: 'global' });

defineProps<{
	status: string;
}>();
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.loading-init {
	width: 100%;
	align-self: center;
	text-align: center;
	text-transform: uppercase;
	contain: layout style;

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
</style>
