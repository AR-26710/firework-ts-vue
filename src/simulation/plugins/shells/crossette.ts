import type { FireworkPlugin } from '../types';
import { randomColor } from '@/core/constants';
import type { ShellConfig } from '../../shell-utils';
import { makePistilColor } from '../shell-plugin-helper';

const crossetteShell = (size: number = 1): ShellConfig => {
	const color = randomColor({ limitWhite: true });
	return {
		shellSize: size,
		spreadSize: 300 + size * 100,
		starLife: 750 + size * 160,
		starLifeVariation: 0.4,
		starDensity: 0.85,
		color,
		crossette: true,
		pistil: Math.random() < 0.5,
		pistilColor: makePistilColor(color),
		glitter: '',
	};
};

export { crossetteShell };

export default {
	id: 'shell-crossette',
	description: '交叉分裂烟花类型',
	shells: [{ name: 'Crossette', factory: crossetteShell }],
} satisfies FireworkPlugin;
