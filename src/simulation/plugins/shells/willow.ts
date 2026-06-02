import type { FireworkPlugin } from '../types';
import { COLOR, INVISIBLE } from '@/core/constants';
import type { ShellConfig } from '../../shell-utils';

const willowShell = (size: number = 1): ShellConfig => ({
	shellSize: size,
	spreadSize: 300 + size * 100,
	starDensity: 0.6,
	starLife: 3000 + size * 300,
	glitter: 'willow',
	glitterColor: COLOR.Gold,
	color: INVISIBLE,
});

export { willowShell };

export default {
	id: 'shell-willow',
	description: '柳树烟花类型',
	shells: [{ name: 'Willow', factory: willowShell, fastBlacklisted: true }],
} satisfies FireworkPlugin;
