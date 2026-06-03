<template>
	<Transition name="confirm">
		<div v-if="visible" class="confirm-dialog" @click="handleCancel">
			<div class="confirm-dialog__container" @click.stop>
				<div class="confirm-dialog__header">
					<Icon icon="mdi:alert-circle-outline" width="20" height="20" aria-hidden="true" />
					<span class="confirm-dialog__title">{{ title }}</span>
				</div>
				<div class="confirm-dialog__body">{{ message }}</div>
				<div class="confirm-dialog__actions">
					<button
						type="button"
						class="confirm-dialog__btn confirm-dialog__btn--confirm"
						@click="handleConfirm"
					>
						{{ confirmText }}
					</button>
					<button
						type="button"
						class="confirm-dialog__btn confirm-dialog__btn--cancel"
						@click="handleCancel"
					>
						{{ cancelText }}
					</button>
				</div>
			</div>
		</div>
	</Transition>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { Icon } from '@iconify/vue';

const props = withDefaults(
	defineProps<{
		visible: boolean;
		title?: string;
		message?: string;
		confirmText?: string;
		cancelText?: string;
	}>(),
	{
		title: '确认',
		message: '确定要执行此操作吗？',
		confirmText: '确定',
		cancelText: '取消',
	}
);

const emit = defineEmits<{
	confirm: [];
	cancel: [];
}>();

const dialogRef = ref<HTMLElement | null>(null);
let previousFocusEl: HTMLElement | null = null;

watch(
	() => props.visible,
	async (newVisible, oldVisible) => {
		if (newVisible && !oldVisible) {
			previousFocusEl = document.activeElement as HTMLElement;
			await nextTick();
			dialogRef.value?.focus();
		} else if (!newVisible && oldVisible) {
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
	if (!props.visible) return;
	if (
		e.target instanceof HTMLInputElement ||
		e.target instanceof HTMLTextAreaElement ||
		e.target instanceof HTMLSelectElement
	)
		return;

	if (e.key === 'Escape') {
		e.preventDefault();
		handleCancel();
	} else if (e.key === 'Enter') {
		e.preventDefault();
		handleConfirm();
	}
}

onMounted(() => document.addEventListener('keydown', onKeydown));
onUnmounted(() => document.removeEventListener('keydown', onKeydown));

function handleConfirm() {
	emit('confirm');
}

function handleCancel() {
	emit('cancel');
}
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.confirm-dialog {
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: rgba(0, 0, 0, 0.82);
	backdrop-filter: $blur-lg;
	-webkit-backdrop-filter: $blur-lg;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: $space-4;
	overflow: hidden;
	z-index: $z-modal;

	&__container {
		width: 100%;
		max-width: 400px;
		display: flex;
		flex-direction: column;
		background-color: rgba(15, 15, 20, 0.95);
		border: 1px solid $border-default;
		border-radius: $radius-2xl;
		overflow: hidden;
		box-shadow:
			0 0 0 1px rgba(255, 255, 255, 0.04),
			0 24px 80px rgba(0, 0, 0, 0.6);
	}

	&__header {
		display: flex;
		align-items: center;
		gap: $space-2;
		padding: $space-4 $space-4 0;
		color: $primary-600;
	}

	&__title {
		font-size: $font-size-lg;
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: $text-primary;
	}

	&__body {
		padding: $space-4;
		font-size: $font-size-md;
		line-height: $line-height-relaxed;
		color: $text-secondary;
	}

	&__actions {
		display: flex;
		gap: $space-2;
		padding: $space-3 $space-4 $space-4;
		justify-content: flex-end;
	}

	&__btn {
		outline: none;
		border: 1px solid $border-strong;
		border-radius: $radius-md;
		padding: 0.5em 1.2em;
		font-family: $font;
		font-size: $font-size-sm;
		text-transform: uppercase;
		letter-spacing: $letter-spacing;
		background-color: $surface-input;
		cursor: pointer;
		transition:
			color $duration-normal,
			background-color $duration-normal,
			border-color $duration-normal;

		&:focus-visible {
			outline: 2px solid $primary;
			outline-offset: 2px;
		}

		&--cancel {
			color: $text-tertiary;
			border-color: $border-subtle;

			&:hover,
			&:active,
			&:focus {
				color: $text-primary;
				background-color: $surface-input-focus;
				border-color: $border-hover;
			}
		}

		&--confirm {
			color: $ui-color;
			border-color: $border-strong;

			&:hover,
			&:active,
			&:focus {
				color: $text-primary;
				background-color: $surface-input-focus;
				border-color: $border-hover;
			}
		}
	}
}

.confirm-enter-active {
	transition:
		opacity $duration-moderate $ease-out,
		transform $duration-slow $ease-spring;

	.confirm-dialog__container {
		transition: transform $duration-slow $ease-spring;
	}
}

.confirm-leave-active {
	transition:
		opacity $duration-slower cubic-bezier(0.4, 0, 1, 1),
		transform $duration-slower cubic-bezier(0.4, 0, 1, 1);

	.confirm-dialog__container {
		transition: transform $duration-slower cubic-bezier(0.4, 0, 0.2, 1);
	}
}

.confirm-enter-from,
.confirm-leave-to {
	opacity: 0;
}

.confirm-enter-from .confirm-dialog__container {
	transform: translateY(0) scale(0.96);
}

.confirm-leave-to .confirm-dialog__container {
	transform: translateY(0) scale(0.94);
}
</style>
