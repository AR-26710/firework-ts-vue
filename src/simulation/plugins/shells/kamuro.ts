import type { FireworkPlugin } from '../types';
import { COLOR, INVISIBLE } from '@/core/constants';
import type { ShellConfig } from '../../shell-utils';

const kamuroShell = (size: number = 1): ShellConfig => ({
	shellSize: size,
	spreadSize: 280 + size * 90,
	starDensity: 0.8,
	starLife: 3500 + size * 400,
	glitter: 'willow',
	glitterColor: COLOR.Gold,
	color: INVISIBLE,
});

export { kamuroShell };

export default {
	id: 'shell-kamuro',
	description: '冠烟花类型',
	shells: [{ name: 'Kamuro', factory: kamuroShell, fastBlacklisted: true }],
} satisfies FireworkPlugin;
