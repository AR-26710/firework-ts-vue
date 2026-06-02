import type { FireworkPlugin } from '../types';
import { COLOR, INVISIBLE } from '@/core/constants';
import type { ShellConfig } from '../../shell-utils';

const fallingLeavesShell = (size: number = 1): ShellConfig => ({
	shellSize: size,
	color: INVISIBLE,
	spreadSize: 300 + size * 120,
	starDensity: 0.12,
	starLife: 500 + size * 50,
	starLifeVariation: 0.5,
	glitter: 'medium',
	glitterColor: COLOR.Gold,
	fallingLeaves: true,
});

export { fallingLeavesShell };

export default {
	id: 'shell-falling-leaves',
	description: '落叶烟花类型',
	shells: [{ name: 'Falling Leaves', factory: fallingLeavesShell, fastBlacklisted: true }],
} satisfies FireworkPlugin;
