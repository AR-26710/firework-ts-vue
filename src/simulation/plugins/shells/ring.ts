import type { FireworkPlugin } from '../types';
import { COLOR, PI_2, randomColor } from '@/core/constants';
import type { ShellConfig } from '../../shell-utils';
import { makePistilColor } from '../shell-plugin-helper';

const ringShell = (size: number = 1): ShellConfig => {
	const color = randomColor();
	const pistil = Math.random() < 0.75;
	return {
		shellSize: size,
		ring: true,
		color,
		spreadSize: 300 + size * 100,
		starLife: 900 + size * 200,
		starCount: 2.2 * PI_2 * (size + 1),
		pistil,
		pistilColor: makePistilColor(color),
		glitter: !pistil ? 'light' : '',
		glitterColor: color === COLOR.Gold ? COLOR.Gold : COLOR.White,
		streamers: Math.random() < 0.3,
	};
};

export { ringShell };

export default {
	id: 'shell-ring',
	description: '环形烟花类型',
	shells: [{ name: 'Ring', factory: ringShell }],
} satisfies FireworkPlugin;
