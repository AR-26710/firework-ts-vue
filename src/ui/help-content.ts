/**
 * @module ui/help-content
 * @description 帮助内容模块。定义了 DOM 节点键名到帮助主题键名的映射关系。
 * 帮助文本内容已迁移至 i18n 语言包中。
 */

/**
 * DOM 节点键名到帮助主题键名的映射表。
 * 用于将配置项标签的点击事件关联到对应的帮助主题。
 * 键名为 AppNodes 中的标签属性名，值为帮助主题键名。
 * @type {Record<string, string>}
 */
const nodeKeyToHelpKey: Record<string, string> = {
	shellTypeLabel: 'shellType',
	shellSizeLabel: 'shellSize',
	qualityLabel: 'quality',
	skyLightingLabel: 'skyLighting',
	scaleFactorLabel: 'scaleFactor',
	autoLaunchLabel: 'autoLaunch',
	finaleModeLabel: 'finaleMode',
	hideControlsLabel: 'hideControls',
	fullscreenLabel: 'fullscreen',
	longExposureLabel: 'longExposure',
	textFireworkLabel: 'textFirework',
	textRandomColorLabel: 'textRandomColor',
	textRandomPositionShuffleLabel: 'textRandomPositionShuffle',
};

export { nodeKeyToHelpKey };
