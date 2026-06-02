import type { FireworkPlugin } from '../types';
import { randomColor } from '@/core/constants';
import type { ShellConfig } from '../../shell-utils';

const floralShell = (size: number = 1): ShellConfig => ({
	shellSize: size,
	spreadSize: 300 + size * 120,
	starDensity: 0.12,
	starLife: 500 + size * 50,
	starLifeVariation: 0.5,
	color:
		Math.random() < 0.65
			? 'random'
			: Math.random() < 0.15
				? randomColor()
				: [randomColor(), randomColor({ notSame: true })],
	floral: true,
	glitter: '',
});

export { floralShell };

export default {
	id: 'shell-floral',
	description: '花卉烟花类型',
	shells: [{ name: 'Floral', factory: floralShell, fastBlacklisted: true }],
} satisfies FireworkPlugin;
