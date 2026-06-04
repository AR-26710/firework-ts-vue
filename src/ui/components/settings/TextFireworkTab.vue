<template>
	<div class="tab-panel">
		<div class="option-group">
			<div class="option-group__header">{{ $t('setting.textFireworkGroup') }}</div>
			<FormCheckbox
				id="text-firework"
				v-model="state.config.textFirework"
				:label="$t('setting.textFirework')"
				help-topic="textFirework"
				@change="onConfigChange"
				@help="openHelp"
			/>
			<FormCheckbox
				id="text-random-color"
				v-model="state.config.textRandomColor"
				:label="$t('setting.textRandomColor')"
				help-topic="textRandomColor"
				:disabled="!state.config.textFirework"
				:style="{ opacity: state.config.textFirework ? '1' : '0.32' }"
				@change="onConfigChange"
				@help="openHelp"
			/>
			<FormCheckbox
				id="text-random-position"
				v-model="state.config.textRandomPosition"
				:label="$t('setting.textRandomPosition')"
				help-topic="textRandomPosition"
				:disabled="!state.config.textFirework"
				:style="{ opacity: state.config.textFirework ? '1' : '0.32' }"
				@change="onConfigChange"
				@help="openHelp"
			/>
			<FormCheckbox
				id="text-single-cluster"
				v-model="state.config.textSingleCluster"
				:label="$t('setting.textSingleCluster')"
				help-topic="textSingleCluster"
				:disabled="!state.config.textFirework"
				:style="{ opacity: state.config.textFirework ? '1' : '0.32' }"
				@change="onConfigChange"
				@help="openHelp"
			/>
			<FormSelect
				id="text-random-position-shuffle"
				v-model="textRandomPositionShuffleModel"
				:label="$t('setting.textRandomPositionShuffle')"
				help-topic="textRandomPositionShuffle"
				:options="textRandomPositionShuffleOptions"
				:disabled="!state.config.textFirework || !state.config.textRandomPosition"
				:style="{
					opacity: state.config.textFirework && state.config.textRandomPosition ? '1' : '0.32',
				}"
				@change="onConfigChange"
				@help="openHelp"
			/>
			<FormNumberInput
				id="text-display-count"
				v-model="state.config.textDisplayCount"
				:label="$t('setting.textDisplayCount')"
				help-topic="textDisplayCount"
				:min="1"
				:max="20"
				:disabled="!state.config.textFirework"
				:style="{ opacity: state.config.textFirework ? '1' : '0.32' }"
				@change="onConfigChange"
				@help="openHelp"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore, useActions } from '@/ui/vue-store';
import { store } from '@/store/store';
import FormNumberInput from '../form/FormNumberInput.vue';
import FormSelect from '../form/FormSelect.vue';
import FormCheckbox from '../form/FormCheckbox.vue';

const { t } = useI18n({ useScope: 'global' });
const state = useStore();
const actions = useActions();

const textRandomPositionShuffleOptions = computed(() => [
	{ value: 'false', label: t('shuffleOption.ordered') },
	{ value: 'true', label: t('shuffleOption.shuffled') },
]);

const textRandomPositionShuffleModel = computed({
	get: () => String(state.config.textRandomPositionShuffle),
	set: (val: string) => {
		state.config.textRandomPositionShuffle = val === 'true';
	},
});

function onConfigChange() {
	setTimeout(() => {
		store.persist();
		actions.updateConfig();
	}, 0);
}

function openHelp(topic: string) {
	actions.setState({ openHelpTopic: topic });
}
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;
@use '@/styles/settings-panel' as *;

@include settings-panel;
</style>
