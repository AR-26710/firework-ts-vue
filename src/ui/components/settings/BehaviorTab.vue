<template>
	<div class="tab-panel">
		<div class="option-group">
			<div class="option-group__header">{{ $t('setting.shellStyleGroup') }}</div>
			<FormSelect
				id="shell-type"
				v-model="state.config.shell"
				:label="$t('setting.shellType')"
				help-topic="shellType"
				:options="shellOptions"
				@change="onConfigChange"
				@help="openHelp"
			/>
			<FormSelect
				id="shell-size"
				v-model="state.config.size"
				:label="$t('setting.shellSize')"
				help-topic="shellSize"
				:options="sizeSelectOptions"
				@change="onConfigChange"
				@help="openHelp"
			/>
		</div>
		<div class="option-group">
			<div class="option-group__header">{{ $t('setting.launchControlGroup') }}</div>
			<FormCheckbox
				id="auto-launch"
				v-model="state.config.autoLaunch"
				:label="$t('setting.autoLaunch')"
				help-topic="autoLaunch"
				@change="onConfigChange"
				@help="openHelp"
			/>
			<FormCheckbox
				id="finale-mode"
				v-model="state.config.finale"
				:label="$t('setting.finaleMode')"
				help-topic="finaleMode"
				:disabled="!state.config.autoLaunch"
				:style="{ opacity: state.config.autoLaunch ? '1' : '0.32' }"
				@change="onFinaleChange"
				@help="openHelp"
			/>
			<FormSelect
				id="launch-sequence"
				v-model="state.config.launchSequence"
				:label="$t('setting.launchSequence')"
				help-topic="launchSequence"
				:options="launchSequenceOptions"
				:disabled="!state.config.autoLaunch || state.config.finale"
				:style="{ opacity: state.config.autoLaunch && !state.config.finale ? '1' : '0.32' }"
				@change="onLaunchSequenceChange"
				@help="openHelp"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore, useActions } from '@/ui/vue-store';
import { getShellNames } from '@/simulation/shell-registry';
import { getSequenceNames } from '@/simulation/sequences/sequence-registry';
import FormSelect from '../form/FormSelect.vue';
import FormCheckbox from '../form/FormCheckbox.vue';

const { t } = useI18n({ useScope: 'global' });
const state = useStore();
const actions = useActions();

const shellOptions = computed(() =>
	getShellNames().map((name) => ({
		value: name,
		label: t(`shellLabels.${name}`) || name,
	}))
);

const sizeSelectOptions = ['3"', '4"', '6"', '8"', '12"', '16"'].map((label, i) => ({
	value: String(i),
	label,
}));

const launchSequenceOptions = computed(() =>
	getSequenceNames().map((name) => ({
		value: name,
		label: t(`launchSequenceLabels.${name}`) || name,
	}))
);

function onConfigChange() {
	setTimeout(() => actions.updateConfig(), 0);
}

function onFinaleChange() {
	setTimeout(() => actions.updateConfig(), 0);
}

function onLaunchSequenceChange() {
	if (state.config.finale) {
		state.config.finale = false;
	}
	setTimeout(() => actions.updateConfig(), 0);
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
