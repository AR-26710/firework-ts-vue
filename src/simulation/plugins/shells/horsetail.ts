import type { FireworkPlugin } from '../types';
import { COLOR, randomColor, whiteOrGold } from '@/core/constants';
import type { ShellConfig } from '../../shell-utils';

const horsetailShell = (size: number = 1): ShellConfig => {
	const color = randomColor();
	return {
		shellSize: size,
		horsetail: true,
		color,
		spreadSize: 250 + size * 38,
		starDensity: 0.9,
		starLife: 2500 + size * 300,
		glitter: 'medium',
		glitterColor: Math.random() < 0.5 ? whiteOrGold() : color,
		strobe: color === COLOR.White,
	};
};

export { horsetailShell };

export default {
	id: 'shell-horsetail',
	description: '马尾烟花类型',
	shells: [{ name: 'Horse Tail', factory: horsetailShell }],
} satisfies FireworkPlugin;
