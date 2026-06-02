<template>
	<div class="form-option form-option--number" :style="style">
		<label :for="id" @click="$emit('help', helpTopic)">{{ label }}</label>
		<div class="number-input">
			<button
				class="number-input__btn number-input__btn--minus"
				type="button"
				:disabled="disabled || (min !== undefined && modelValue <= min)"
				@click="decrement"
			>
				−
			</button>
			<input
				:id="id"
				v-model.number="modelValue"
				class="number-input__field"
				type="number"
				:min="min"
				:max="max"
				:disabled="disabled"
				@change="$emit('change')"
			/>
			<button
				class="number-input__btn number-input__btn--plus"
				type="button"
				:disabled="disabled || (max !== undefined && modelValue >= max)"
				@click="increment"
			>
				+
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
defineProps<{
	id: string;
	label: string;
	helpTopic: string;
	min?: number;
	max?: number;
	style?: Record<string, string>;
	disabled?: boolean;
}>();

const modelValue = defineModel<number>({ required: true });

function increment() {
	modelValue.value = (modelValue.value || 0) + 1;
}

function decrement() {
	modelValue.value = (modelValue.value || 0) - 1;
}

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

	&--number .number-input {
		display: flex;
		align-items: center;
		height: $space-8;
		border-radius: $radius-md;
		overflow: hidden;
		border: 1px solid $border-strong;
		background-color: $surface-input;
		transition:
			border-color $duration-normal,
			background-color $duration-normal;

		&:hover {
			border-color: $border-hover;
			background-color: $surface-input-hover;
		}

		&:focus-within {
			border-color: $border-active;
			background-color: $surface-input-focus;
		}
	}

	@media (max-width: $large-bp) {
		input {
			outline: none;
		}
	}
}

.number-input__field {
	width: 44px;
	height: 100%;
	border: none;
	background: transparent;
	color: $ui-color;
	font-size: $font-size-md;
	font-family: $font;
	letter-spacing: $letter-spacing;
	text-align: center;
	outline: none;
	appearance: textfield;
	-moz-appearance: textfield;

	&::-webkit-inner-spin-button,
	&::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
}

.number-input__btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 28px;
	height: 100%;
	border: none;
	background: transparent;
	color: $text-tertiary;
	font-size: 14px;
	font-family: $font;
	cursor: pointer;
	transition:
		background-color $duration-fast,
		color $duration-fast;
	user-select: none;

	&:hover:not(:disabled) {
		background-color: $interaction-press;
		color: $text-secondary;
	}

	&:active:not(:disabled) {
		background-color: $interaction-press-strong;
		color: $text-primary;
	}

	&:disabled {
		opacity: $opacity-disabled;
		cursor: not-allowed;
	}
}
</style>
