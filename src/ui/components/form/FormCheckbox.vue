<template>
	<div class="form-option form-option--checkbox" :class="extraClass" :style="style">
		<label @click.prevent="$emit('help', helpTopic)">{{ label }}</label>
		<input
			:id="id"
			v-model="modelValue"
			type="checkbox"
			:disabled="disabled"
			@click="$emit('change')"
		/>
	</div>
</template>

<script setup lang="ts">
defineProps<{
	id: string;
	label: string;
	helpTopic: string;
	extraClass?: string;
	style?: Record<string, string>;
	disabled?: boolean;
}>();

const modelValue = defineModel<boolean>({ required: true });

defineEmits<{
	change: [];
	help: [topic: string];
}>();
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.form-option {
	display: flex;
	align-items: center;
	padding: $space-2 $space-4;
	transition: opacity $duration-moderate;

	&:hover {
		background-color: $interaction-hover;
	}

	label {
		display: block;
		flex: 1;
		padding-right: $space-3;
		text-transform: uppercase;
		user-select: none;
		font-size: $font-size-md;
		cursor: pointer;
	}

	&--checkbox input[type='checkbox'] {
		-webkit-appearance: none;
		appearance: none;
		width: 40px;
		height: 22px;
		background-color: rgba(255, 255, 255, 0.15);
		border-radius: $radius-pill;
		position: relative;
		cursor: pointer;
		transition: background-color $duration-normal;
		flex-shrink: 0;

		&::after {
			content: '';
			position: absolute;
			top: 3px;
			left: 3px;
			width: 16px;
			height: 16px;
			border-radius: 50%;
			background-color: rgba(255, 255, 255, 0.6);
			transition:
				transform $duration-normal,
				background-color $duration-normal;
		}

		&:checked {
			background-color: $primary-600;

			&::after {
				transform: translateX(18px);
				background-color: $text-primary;
			}
		}

		&:focus-visible {
			outline: 2px solid $primary;
			outline-offset: 2px;
		}

		&:disabled {
			cursor: not-allowed;
		}
	}

	@media (max-width: $large-bp) {
		input {
			outline: none;
		}
	}
}
</style>
