import type { FireworkPlugin } from '../types';
import { COLOR, INVISIBLE, randomColor } from '@/core/constants';
import type { ShellConfig } from '../../shell-utils';
import { makePistilColor } from '../shell-plugin-helper';

const brocadeShell = (size: number = 1): ShellConfig => {
	const pistil = Math.random() < 0.5;
	const pistilColor = pistil ? makePistilColor(COLOR.Gold) : false;
	return {
		shellSize: size,
		spreadSize: 300 + size * 100,
		starDensity: 0.55,
		starLife: 2800 + size * 300,
		color: INVISIBLE,
		glitter: 'heavy',
		glitterColor: COLOR.Gold,
		pistil,
		pistilColor,
		secondColor: Math.random() < 0.4 ? randomColor({ notColor: COLOR.White }) : null,
	};
};

export { brocadeShell };

export default {
	id: 'shell-brocade',
	description: '锦冠烟花类型',
	shells: [{ name: 'Brocade', factory: brocadeShell, fastBlacklisted: true }],
} satisfies FireworkPlugin;
