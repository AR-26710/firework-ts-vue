/**
 * @module shell-types
 * 烟花弹相关类型定义。
 */

export interface GlitterConfig {
	sparkFreq: number;
	sparkSpeed: number;
	sparkLife: number;
	sparkLifeVariation: number;
}

export interface TextRenderResult {
	positions: { x: number; y: number }[];
	canvasWidth: number;
	canvasHeight: number;
}

export interface StarConfig {
	color: string | undefined;
	onDeath: ((star: import('./particles/types').StarInstance) => void) | undefined;
	sparkFreq: number;
	sparkSpeed: number;
	sparkLife: number;
	sparkLifeVariation: number;
}
