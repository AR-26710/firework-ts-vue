import type { FireworkPlugin } from '../types';
import { COLOR, randomColor, whiteOrGold } from '@/core/constants';
import { isLowQuality, isHighQuality } from '@/core/state';
import type { ShellConfig } from '../../shell-utils';
import { makePistilColor } from '../shell-plugin-helper';

const crysanthemumShell = (size: number = 1): ShellConfig => {
	const glitter = Math.random() < 0.25;
	const singleColor = Math.random() < 0.72;
	const color = singleColor
		? randomColor({ limitWhite: true })
		: [randomColor(), randomColor({ notSame: true })];
	const pistil = singleColor && Math.random() < 0.42;
	const pistilColor = pistil && makePistilColor(color as string);
	const secondColor =
		singleColor && (Math.random() < 0.2 || color === COLOR.White)
			? pistilColor || randomColor({ notColor: color as string, limitWhite: true })
			: null;
	const streamers = !pistil && color !== COLOR.White && Math.random() < 0.42;
	let starDensity = glitter ? 1.1 : 1.25;
	if (isLowQuality) starDensity *= 0.8;
	if (isHighQuality) starDensity = 1.2;
	return {
		shellSize: size,
		spreadSize: 300 + size * 100,
		starLife: 900 + size * 200,
		starDensity,
		color,
		secondColor,
		glitter: glitter ? 'light' : '',
		glitterColor: whiteOrGold(),
		pistil,
		pistilColor,
		streamers,
	};
};

export { crysanthemumShell };

export default {
	id: 'shell-crysanthemum',
	description: '菊花烟花类型',
	shells: [{ name: 'Crysanthemum', factory: crysanthemumShell }],
} satisfies FireworkPlugin;
