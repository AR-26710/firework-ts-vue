/**
 * @module simulation/plugins/shell-plugin-helper
 * @description 烟花类型插件开发辅助工具。提供烟花类型插件开发中常用的共享工具函数，
 * 避免各插件重复实现。
 */

import { COLOR, randomColor, whiteOrGold } from '@/core/constants';

/**
 * 根据烟花弹主颜色生成花心颜色。
 * 当主颜色为白色或金色时，随机选择一个非主色的颜色；否则返回白色或金色。
 * @param shellColor - 烟花弹主颜色
 * @returns 花心颜色字符串
 */
function makePistilColor(shellColor: string): string {
	return shellColor === COLOR.White || shellColor === COLOR.Gold
		? randomColor({ notColor: shellColor })
		: whiteOrGold();
}

export { makePistilColor };
