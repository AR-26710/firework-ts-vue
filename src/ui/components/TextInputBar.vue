<template>
	<Transition name="input-bar">
		<div v-if="state.config.textFirework && !state.settingOpen" class="text-input-bar">
			<div class="text-input-bar__field">
				<input
					v-model="textInput"
					class="text-input-bar__input"
					type="text"
					:placeholder="$t('textInput.placeholder')"
					:aria-label="$t('a11y.textInput')"
					@keydown="onKeyDown"
				/>
				<div class="text-input-bar__divider"></div>
				<div class="text-input-bar__count-wrap">
					<label class="text-input-bar__count-label" for="text-display-count">
						{{ $t('textInput.perTime') }}
					</label>
					<input
						id="text-display-count"
						v-model.number="displayCount"
						class="text-input-bar__count"
						type="number"
						min="1"
						max="20"
					/>
					<span class="text-input-bar__count-suffix">{{ $t('textInput.charUnit') }}</span>
				</div>
			</div>
			<button
				class="text-input-bar__send"
				type="button"
				:aria-label="$t('a11y.sendText')"
				@click="launchText"
			>
				<Icon icon="mdi:send" width="20" height="20" aria-hidden="true" />
			</button>
		</div>
	</Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Icon } from '@iconify/vue';
import { useStore } from '@/ui/vue-store';
import { textFireworkSelector } from '@/store/selectors';
import { launchTextShell } from '@/simulation/shell-launch';
import { store } from '@/store/store';

const state = useStore();

const textInput = ref('');
const displayCount = ref(state.config.textDisplayCount);

watch(
	() => state.config.textDisplayCount,
	(val) => {
		displayCount.value = val;
	}
);

watch(displayCount, (val) => {
	const count = parseInt(String(val), 10);
	if (count > 0 && count !== state.config.textDisplayCount) {
		store.setState({ config: { ...store.state.config, textDisplayCount: count } });
	}
});

function launchText() {
	const text = textInput.value.trim();
	if (text && textFireworkSelector()) {
		launchTextShell(text);
		textInput.value = '';
	}
}

function onKeyDown(e: KeyboardEvent) {
	if (e.key === 'Enter') {
		launchText();
	} else if (e.key === 'Escape') {
		e.preventDefault();
		e.stopPropagation();
		(e.target as HTMLInputElement).blur();
	}
}
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.text-input-bar {
	position: absolute;
	bottom: 28px;
	left: 50%;
	transform: translateX(-50%);
	display: flex;
	gap: $space-2 + $space-1;
	align-items: center;
	z-index: $z-input-bar;
	contain: layout style;

	&__field {
		display: flex;
		align-items: center;
		background: rgba(#000, 0.45);
		border: 1px solid rgba(#fff, 0.1);
		border-radius: $radius-2xl;
		padding: $space-1 ($space-1 + $space-1);
		backdrop-filter: $blur-lg saturate(1.2);
		-webkit-backdrop-filter: $blur-lg saturate(1.2);
		box-shadow:
			0 2px 12px rgba(#000, 0.3),
			inset 0 1px 0 rgba(#fff, 0.04);
		transition:
			border-color $duration-normal,
			background-color $duration-normal,
			box-shadow $duration-normal;

		&:focus-within {
			border-color: rgba(#fff, 0.3);
			background-color: rgba(#fff, 0.05);
			box-shadow:
				0 2px 16px rgba(#000, 0.35),
				0 0 0 3px rgba(#fff, 0.06),
				inset 0 1px 0 rgba(#fff, 0.06);
		}
	}

	&__input {
		flex: 1;
		min-width: 220px;
		padding: 10px $space-1 10px $space-4;
		border: none;
		border-radius: $radius-2xl;
		background: transparent;
		color: $ui-color;
		font-family: $font;
		font-size: 14px;
		letter-spacing: $letter-spacing;
		outline: none;
		transition: color $duration-normal;

		&::placeholder {
			color: $text-placeholder;
			transition: color $duration-normal;
		}

		&:focus {
			color: $text-primary;

			&::placeholder {
				color: $text-placeholder-focus;
			}
		}

		@media (max-width: $small-bp) {
			min-width: 150px;
			font-size: 13px;
			padding: $space-2 $space-1 $space-2 $space-3;
		}
	}

	&__divider {
		width: 1px;
		height: 22px;
		background: rgba(#fff, 0.08);
		margin: 0 $space-1 + $space-1;
		flex-shrink: 0;
		border-radius: 1px;
	}

	&__count-wrap {
		display: flex;
		align-items: center;
		gap: $space-1;
		background: rgba(#fff, 0.05);
		border-radius: $radius-lg;
		padding: 5px $space-2 + $space-1;
		flex-shrink: 0;
		transition: background $duration-normal;

		&:hover {
			background: rgba(#fff, 0.1);
		}
	}

	&__count-label {
		color: $text-quaternary;
		font-family: $font;
		font-size: 11px;
		letter-spacing: $letter-spacing;
		white-space: nowrap;
		cursor: pointer;
	}

	&__count {
		width: 30px;
		padding: 2px;
		border: none;
		border-radius: $radius-md;
		background: rgba(#fff, 0.07);
		color: $ui-color;
		font-family: $font;
		font-size: 12px;
		text-align: center;
		outline: none;
		appearance: textfield;
		-moz-appearance: textfield;
		transition:
			background $duration-normal,
			color $duration-normal;

		&::-webkit-inner-spin-button,
		&::-webkit-outer-spin-button {
			-webkit-appearance: none;
			margin: 0;
		}

		&:focus {
			background: rgba(#fff, 0.14);
			color: $text-primary;
		}
	}

	&__count-suffix {
		color: $text-quaternary;
		font-family: $font;
		font-size: 11px;
		letter-spacing: $letter-spacing;
		white-space: nowrap;
	}

	&__send {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border: 1px solid rgba(#fff, 0.15);
		border-radius: $radius-2xl;
		background: rgba(#fff, 0.06);
		color: $ui-color;
		cursor: pointer;
		flex-shrink: 0;
		backdrop-filter: $blur-lg saturate(1.2);
		-webkit-backdrop-filter: $blur-lg saturate(1.2);
		box-shadow: 0 2px 8px rgba(#000, 0.2);
		transition:
			color $duration-normal,
			background-color $duration-normal,
			border-color $duration-normal,
			box-shadow $duration-normal,
			transform $duration-fast;

		&:hover {
			color: $text-primary;
			background-color: rgba(#fff, 0.12);
			border-color: rgba(#fff, 0.35);
			box-shadow:
				0 2px 12px rgba(#000, 0.3),
				0 0 0 2px rgba(#fff, 0.06);
			transform: translateY(-1px);
		}

		&:active {
			background-color: rgba(#fff, 0.18);
			border-color: rgba(#fff, 0.45);
			box-shadow: 0 1px 4px rgba(#000, 0.2);
			transform: translateY(0);
		}

		&:focus-visible {
			outline: 2px solid $primary;
			outline-offset: 2px;
		}

		@media (max-width: $small-bp) {
			width: 38px;
			height: 38px;

			:deep(svg) {
				width: 16px;
				height: 16px;
			}
		}
	}
}

.input-bar-enter-active {
	transition:
		opacity $duration-moderate $ease-out,
		transform $duration-moderate $ease-decelerate;
}

.input-bar-leave-active {
	transition:
		opacity $duration-moderate $ease-in,
		transform $duration-moderate $ease-in;
}

.input-bar-enter-from {
	opacity: 0;
	transform: translateX(-50%) translateY(24px);
}

.input-bar-leave-to {
	opacity: 0;
	transform: translateX(-50%) translateY(24px);
	pointer-events: none;
}
</style>
