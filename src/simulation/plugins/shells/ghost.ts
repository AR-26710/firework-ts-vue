import type { FireworkPlugin } from '../types';
import { COLOR, INVISIBLE, randomColor } from '@/core/constants';
import type { ShellConfig } from '../../shell-utils';
import { crysanthemumShell } from './crysanthemum';

const ghostShell = (size: number = 1): ShellConfig => {
	const shell = crysanthemumShell(size);
	shell.starLife *= 1.5;
	const ghostColor = randomColor({ notColor: COLOR.White });
	shell.streamers = true;
	shell.color = INVISIBLE;
	shell.secondColor = ghostColor;
	shell.glitter = '';
	return shell;
};

export { ghostShell };

export default {
	id: 'shell-ghost',
	description: '幽灵烟花类型',
	shells: [{ name: 'Ghost', factory: ghostShell }],
} satisfies FireworkPlugin;
