import type { FireworkPlugin } from '../types';
import { randomColor, whiteOrGold } from '@/core/constants';
import { isLowQuality, isHighQuality } from '@/core/state';
import type { ShellConfig } from '../../shell-utils';
import { makePistilColor } from '../shell-plugin-helper';

const peonyShell = (size: number = 1): ShellConfig => {
	const singleColor = Math.random() < 0.8;
	const color = singleColor
		? randomColor({ limitWhite: true })
		: [randomColor(), randomColor({ notSame: true })];
	const pistil = singleColor && Math.random() < 0.35;
	const pistilColor = pistil && makePistilColor(color as string);
	let starDensity = 1.5;
	if (isLowQuality) starDensity *= 0.75;
	if (isHighQuality) starDensity = 1.8;
	return {
		shellSize: size,
		spreadSize: 320 + size * 100,
		starLife: 800 + size * 150,
		starDensity,
		color,
		pistil,
		pistilColor,
		glitter: '',
		glitterColor: whiteOrGold(),
	};
};

export { peonyShell };

export default {
	id: 'shell-peony',
	description: '牡丹烟花类型',
	shells: [{ name: 'Peony', factory: peonyShell }],
} satisfies FireworkPlugin;
