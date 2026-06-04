import type { FireworkPlugin } from '../types';
import { randomColor, createColorPool } from '@/core/constants';
import type { ShellConfig } from '../../shell-utils';
import { makePistilColor } from '../shell-plugin-helper';

/** 自定义霓虹色板，不包含系统内置颜色 */
const NEON_COLORS = {
	Pink: '#ff69b4',
	Cyan: '#00ffff',
	Lime: '#39ff14',
	Orange: '#ff6600',
	Magenta: '#ff00ff',
	Yellow: '#ffff00',
};

const neonShell = (size: number = 1): ShellConfig => {
	// 创建仅包含自定义颜色的颜色池（禁用系统内置颜色）
	const pool = createColorPool(NEON_COLORS, false);

	const singleColor = Math.random() < 0.6;
	const color = singleColor
		? randomColor({ limitWhite: true }, pool.codes)
		: [randomColor(undefined, pool.codes), randomColor({ notSame: true }, pool.codes)];

	const pistil = singleColor && Math.random() < 0.5;
	const pistilColor = pistil
		? makePistilColor(typeof color === 'string' ? color : color[0], pool)
		: undefined;

	return {
		shellSize: size,
		spreadSize: 280 + size * 100,
		starLife: 850 + size * 200,
		starDensity: 1.2,
		color,
		secondColor: null,
		glitter: Math.random() < 0.4 ? 'light' : '',
		glitterColor: '#ffffff',
		pistil,
		pistilColor: pistilColor || false,
		streamers: Math.random() < 0.25,
		customColors: NEON_COLORS,
		useSystemColors: false,
	};
};

export { neonShell };

export default {
	id: 'shell-neon',
	description: '霓虹烟花类型（仅使用自定义颜色）',
	shells: [{ name: 'Neon', factory: neonShell }],
} satisfies FireworkPlugin;
