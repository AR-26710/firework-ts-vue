import type { FireworkPlugin } from '../types';
import { randomColor } from '@/core/constants';
import type { ShellConfig } from '../../shell-utils';

const palmShell = (size: number = 1): ShellConfig => {
	const color = randomColor();
	const thick = Math.random() < 0.5;
	return {
		shellSize: size,
		color,
		spreadSize: 250 + size * 75,
		starDensity: thick ? 0.15 : 0.4,
		starLife: 1800 + size * 200,
		glitter: thick ? 'thick' : 'heavy',
	};
};

export { palmShell };

export default {
	id: 'shell-palm',
	description: '棕榈烟花类型',
	shells: [{ name: 'Palm', factory: palmShell }],
} satisfies FireworkPlugin;
