import type { FireworkPlugin } from '../types';
import { COLOR, randomColor } from '@/core/constants';
import { isLowQuality } from '@/core/state';
import type { ShellConfig } from '../../shell-utils';
import { makePistilColor } from '../shell-plugin-helper';

const crackleShell = (size: number = 1): ShellConfig => {
	const color = Math.random() < 0.75 ? COLOR.Gold : randomColor();
	return {
		shellSize: size,
		spreadSize: 380 + size * 75,
		starDensity: isLowQuality ? 0.65 : 1,
		starLife: 600 + size * 100,
		starLifeVariation: 0.32,
		glitter: 'light',
		glitterColor: COLOR.Gold,
		color,
		crackle: true,
		pistil: Math.random() < 0.65,
		pistilColor: makePistilColor(color),
	};
};

export { crackleShell };

export default {
	id: 'shell-crackle',
	description: '噼啪烟花类型',
	shells: [{ name: 'Crackle', factory: crackleShell }],
} satisfies FireworkPlugin;
