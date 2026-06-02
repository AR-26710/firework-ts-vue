<template>
	<Transition name="shortcuts">
		<div v-if="state.openHelpTopic === 'shortcuts'" class="shortcuts-panel" @click="close">
			<div class="shortcuts-panel__container" @click.stop>
				<div class="shortcuts-panel__header">
					<div class="shortcuts-panel__header-left">
						<Icon icon="mdi:keyboard-outline" width="20" height="20" aria-hidden="true" />
						<span class="shortcuts-panel__title">{{ t('help.shortcuts.header') }}</span>
					</div>
					<button
						type="button"
						class="shortcuts-panel__close-btn"
						:aria-label="t('a11y.closeHelp')"
						@click="close"
					>
						<Icon icon="mdi:close" width="18" height="18" aria-hidden="true" />
					</button>
				</div>
				<p class="shortcuts-panel__subtitle">{{ t('help.shortcuts.subtitle') }}</p>
				<div class="shortcuts-panel__content">
					<div v-for="group in groupedShortcuts" :key="group.category" class="shortcut-section">
						<button
							type="button"
							class="shortcut-section__trigger"
							:aria-expanded="expandedCategories.has(group.category)"
							@click="toggleCategory(group.category)"
						>
							<span class="shortcut-section__label">
								{{ t(`help.shortcuts.categories.${group.category}`) }}
							</span>
							<Icon
								icon="mdi:chevron-down"
								width="18"
								height="18"
								class="shortcut-section__chevron"
								:class="{ rotated: expandedCategories.has(group.category) }"
								aria-hidden="true"
							/>
						</button>
						<Transition
							@before-enter="onAccordionBeforeEnter"
							@enter="onAccordionEnter"
							@after-enter="onAccordionAfterEnter"
							@before-leave="onAccordionBeforeLeave"
							@leave="onAccordionLeave"
							@after-leave="onAccordionAfterLeave"
						>
							<div v-if="expandedCategories.has(group.category)" class="shortcut-section__body">
								<div class="shortcut-section__body-inner">
									<div v-for="(item, i) in group.items" :key="i" class="shortcut-row">
										<div class="shortcut-row__keys">
											<kbd v-for="(key, j) in item.keys" :key="j">{{ key }}</kbd>
										</div>
										<span class="shortcut-row__desc">
											{{ t(`help.shortcuts.${item.descriptionKey}`) }}
										</span>
									</div>
								</div>
							</div>
						</Transition>
					</div>
				</div>
			</div>
		</div>
	</Transition>
</template>

<script setup lang="ts">
import { computed, reactive, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue';
import { useStore, useActions } from '@/ui/vue-store';
import { getShortcutsForDisplay, shortcutCategoryOrder } from '@/input/shortcuts';

const { t } = useI18n({ useScope: 'global' });
const state = useStore();
const actions = useActions();

interface ShortcutItem {
	keys: string[];
	descriptionKey: string;
}

interface ShortcutGroup {
	category: string;
	items: ShortcutItem[];
}

const groupedShortcuts = computed<ShortcutGroup[]>(() => {
	const items = getShortcutsForDisplay();
	const groupMap = new Map<string, ShortcutItem[]>();

	for (const item of items) {
		const list = groupMap.get(item.category) || [];
		list.push({
			keys: item.label.split(' / '),
			descriptionKey: item.descriptionKey,
		});
		groupMap.set(item.category, list);
	}

	return shortcutCategoryOrder
		.filter((cat) => groupMap.has(cat))
		.map((cat) => ({ category: cat, items: groupMap.get(cat)! }));
});

const expandedCategories = reactive(new Set<string>());

function toggleCategory(category: string) {
	if (expandedCategories.has(category)) {
		expandedCategories.delete(category);
	} else {
		expandedCategories.add(category);
	}
}

onMounted(() => {
	for (const group of groupedShortcuts.value) {
		expandedCategories.add(group.category);
	}
});

function onKeydown(e: KeyboardEvent) {
	if (state.openHelpTopic !== 'shortcuts') return;
	if (
		e.target instanceof HTMLInputElement ||
		e.target instanceof HTMLTextAreaElement ||
		e.target instanceof HTMLSelectElement
	)
		return;

	if (e.key === 'Escape') {
		e.preventDefault();
		close();
	}
}

onMounted(() => document.addEventListener('keydown', onKeydown));
onUnmounted(() => document.removeEventListener('keydown', onKeydown));

function close() {
	actions.setState({ openHelpTopic: null });
}

const ACCORDION_DURATION = 280;
const ACCORDION_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';

function onAccordionBeforeEnter(el: Element) {
	const htmlEl = el as HTMLElement;
	htmlEl.style.height = '0';
	htmlEl.style.overflow = 'hidden';
	htmlEl.style.opacity = '0';
}

function onAccordionEnter(el: Element, done: () => void) {
	const htmlEl = el as HTMLElement;
	const inner = htmlEl.querySelector('.shortcut-section__body-inner') as HTMLElement;
	const targetHeight = inner?.scrollHeight ?? htmlEl.scrollHeight;

	htmlEl.style.transition = `height ${ACCORDION_DURATION}ms ${ACCORDION_EASING}, opacity ${ACCORDION_DURATION}ms ${ACCORDION_EASING}`;

	requestAnimationFrame(() => {
		htmlEl.style.height = `${targetHeight}px`;
		htmlEl.style.opacity = '1';
	});

	setTimeout(done, ACCORDION_DURATION);
}

function onAccordionAfterEnter(el: Element) {
	const htmlEl = el as HTMLElement;
	htmlEl.style.height = '';
	htmlEl.style.overflow = '';
	htmlEl.style.opacity = '';
	htmlEl.style.transition = '';
}

function onAccordionBeforeLeave(el: Element) {
	const htmlEl = el as HTMLElement;
	htmlEl.style.height = `${htmlEl.scrollHeight}px`;
	htmlEl.style.overflow = 'hidden';
	htmlEl.style.opacity = '1';
}

function onAccordionLeave(el: Element, done: () => void) {
	const htmlEl = el as HTMLElement;

	htmlEl.style.transition = `height ${ACCORDION_DURATION}ms ${ACCORDION_EASING}, opacity ${ACCORDION_DURATION * 0.6}ms ${ACCORDION_EASING}`;

	requestAnimationFrame(() => {
		htmlEl.style.height = '0';
		htmlEl.style.opacity = '0';
	});

	setTimeout(done, ACCORDION_DURATION);
}

function onAccordionAfterLeave(el: Element) {
	const htmlEl = el as HTMLElement;
	htmlEl.style.height = '';
	htmlEl.style.overflow = '';
	htmlEl.style.opacity = '';
	htmlEl.style.transition = '';
}
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.shortcuts-panel {
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: rgba(0, 0, 0, 0.82);
	backdrop-filter: $blur-lg;
	-webkit-backdrop-filter: $blur-lg;
	display: flex;
	align-items: flex-end;
	justify-content: center;
	padding: $space-4;
	overflow: hidden;

	@media (min-width: $small-bp) {
		align-items: center;
		padding: $space-8;
	}

	&__container {
		width: 100%;
		max-width: 520px;
		max-height: 85vh;
		display: flex;
		flex-direction: column;
		background-color: rgba(15, 15, 20, 0.95);
		border: 1px solid $border-default;
		border-radius: $radius-2xl;
		overflow: hidden;
		box-shadow:
			0 0 0 1px rgba(255, 255, 255, 0.04),
			0 24px 80px rgba(0, 0, 0, 0.6);

		@media (min-width: $small-bp) {
			max-height: 80vh;
		}
	}

	&__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: $space-4 $space-4 0;
	}

	&__header-left {
		display: flex;
		align-items: center;
		gap: $space-2;
		color: $text-secondary;
	}

	&__title {
		font-size: $font-size-lg;
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: $text-primary;
	}

	&__close-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border: 1px solid $border-default;
		border-radius: $radius-md;
		background: $surface-input;
		color: $text-tertiary;
		cursor: pointer;
		transition:
			color $duration-normal,
			background-color $duration-normal,
			border-color $duration-normal;
		padding: 0;

		&:hover {
			color: $text-primary;
			background-color: $surface-input-hover;
			border-color: $border-hover;
		}

		&:focus-visible {
			outline: 2px solid $primary;
			outline-offset: 2px;
		}
	}

	&__subtitle {
		padding: $space-2 $space-4 $space-3;
		font-size: $font-size-sm;
		color: $text-tertiary;
		line-height: $line-height-relaxed;
		border-bottom: 1px solid $border-subtle;
		margin: 0;
	}

	&__content {
		flex: 1;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
		padding: $space-2 0;
		scrollbar-width: thin;
		scrollbar-color: rgba(255, 255, 255, 0.15) transparent;

		&::-webkit-scrollbar {
			width: 5px;
		}

		&::-webkit-scrollbar-track {
			background: transparent;
		}

		&::-webkit-scrollbar-thumb {
			background-color: rgba(255, 255, 255, 0.15);
			border-radius: $radius-pill;

			&:hover {
				background-color: rgba(255, 255, 255, 0.25);
			}
		}
	}
}

.shortcut-section {
	&__trigger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: $space-3 $space-4;
		background: none;
		border: none;
		border-bottom: 1px solid $border-subtle;
		cursor: pointer;
		color: $text-secondary;
		font-family: $font;
		font-size: $font-size-sm;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		transition:
			color $duration-normal,
			background-color $duration-normal;

		&:hover {
			color: $text-primary;
			background-color: $interaction-hover;
		}

		&:focus-visible {
			outline: 2px solid $primary;
			outline-offset: -2px;
		}
	}

	&__label {
		display: flex;
		align-items: center;
		gap: $space-2;
	}

	&__chevron {
		transition: transform $duration-normal $ease-decelerate;
		flex-shrink: 0;

		&.rotated {
			transform: rotate(180deg);
		}
	}

	&__body {
		overflow: hidden;
	}

	&__body-inner {
		padding: $space-2 $space-4 $space-3;
	}
}

.shortcut-row {
	display: flex;
	align-items: center;
	gap: $space-3;
	padding: $space-2 0;
	border-bottom: 1px solid rgba(255, 255, 255, 0.03);

	&:last-child {
		border-bottom: none;
	}

	&__keys {
		display: flex;
		gap: 3px;
		flex-shrink: 0;

		kbd {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			min-width: 26px;
			height: $space-5;
			padding: 0 6px;
			font-family: $font;
			font-size: $font-size-xs;
			color: $text-secondary;
			background: linear-gradient(
				180deg,
				rgba(255, 255, 255, 0.1) 0%,
				rgba(255, 255, 255, 0.04) 100%
			);
			border: 1px solid rgba(255, 255, 255, 0.15);
			border-bottom-width: 2px;
			border-radius: 4px;
			line-height: 1;
			white-space: nowrap;
			box-shadow: 0 1px 0 rgba(255, 255, 255, 0.06);
		}
	}

	&__desc {
		font-size: $font-size-sm;
		color: $text-tertiary;
		line-height: $line-height-base;
	}
}

.shortcuts-enter-active {
	transition:
		opacity $duration-moderate $ease-out,
		transform $duration-slow $ease-spring;

	.shortcuts-panel__container {
		transition: transform $duration-slow $ease-spring;
	}
}

.shortcuts-leave-active {
	transition:
		opacity $duration-slower cubic-bezier(0.4, 0, 1, 1),
		transform $duration-slower cubic-bezier(0.4, 0, 1, 1);

	.shortcuts-panel__container {
		transition: transform $duration-slower cubic-bezier(0.4, 0, 0.2, 1);
	}
}

.shortcuts-enter-from,
.shortcuts-leave-to {
	opacity: 0;
}

.shortcuts-enter-from .shortcuts-panel__container {
	transform: translateY(40px);
}

.shortcuts-leave-to .shortcuts-panel__container {
	transform: translateY(30px);
}

@media (min-width: $small-bp) {
	.shortcuts-enter-from .shortcuts-panel__container {
		transform: translateY(0) scale(0.96);
	}

	.shortcuts-leave-to .shortcuts-panel__container {
		transform: translateY(0) scale(0.94);
	}
}
</style>
