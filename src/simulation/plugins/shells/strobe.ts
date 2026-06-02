import type { FireworkPlugin } from '../types';
import { COLOR, randomColor } from '@/core/constants';
import type { ShellConfig } from '../../shell-utils';
import { makePistilColor } from '../shell-plugin-helper';

const strobeShell = (size: number = 1): ShellConfig => {
	const color = randomColor({ limitWhite: true });
	return {
		shellSize: size,
		spreadSize: 280 + size * 92,
		starLife: 1100 + size * 200,
		starLifeVariation: 0.4,
		starDensity: 1.1,
		color,
		glitter: 'light',
		glitterColor: COLOR.White,
		strobe: true,
		strobeColor: Math.random() < 0.5 ? COLOR.White : null,
		pistil: Math.random() < 0.5,
		pistilColor: makePistilColor(color),
	};
};

export { strobeShell };

export default {
	id: 'shell-strobe',
	description: '频闪烟花类型',
	shells: [{ name: 'Strobe', factory: strobeShell }],
} satisfies FireworkPlugin;
