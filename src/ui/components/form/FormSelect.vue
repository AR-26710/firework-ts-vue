<template>
	<div class="form-option form-option--select">
		<label :for="id" @click="$emit('help', helpTopic)">{{ label }}</label>
		<select :id="id" v-model="modelValue" :disabled="disabled" @input="$emit('change')">
			<option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
		</select>
	</div>
</template>

<script setup lang="ts">
interface SelectOption {
	value: string;
	label: string;
}

defineProps<{
	id: string;
	label: string;
	helpTopic: string;
	options: SelectOption[];
	disabled?: boolean;
}>();

const modelValue = defineModel<string>({ required: true });

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

	&--select select {
		display: block;
		width: 140px;
		height: $space-8;
		font-size: $font-size-md;
		font-family: $font;
		color: $ui-color;
		letter-spacing: $letter-spacing;
		background-color: $surface-input;
		border: 1px solid $border-strong;
		border-radius: $radius-md;
		padding: 0 $space-2;
		cursor: pointer;
		transition:
			border-color $duration-normal,
			background-color $duration-normal;
		outline: none;

		&:hover {
			border-color: $border-hover;
			background-color: $surface-input-hover;
		}

		&:focus-visible {
			border-color: $border-active;
			background-color: $surface-input-focus;
		}

		option {
			background-color: $surface-option-dropdown;
		}
	}

	@media (max-width: $large-bp) {
		select,
		input {
			outline: none;
		}
	}
}
</style>
