/**
 * @module shell-launch
 * 烟花弹发射模块，提供从配置发射普通烟花弹和文字烟花弹的功能。
 */

import { randomColor, whiteOrGold } from '@/core/constants';
import { getMainStage } from '@/core/stages';
import {
	shellSizeSelector,
	textRandomColorSelector,
	textDisplayCountSelector,
	textRandomPositionSelector,
	textRandomPositionShuffleSelector,
	textSingleClusterSelector,
	scaleFactorSelector,
} from '@/store/selectors';
import { Shell } from './shells';
import { hasCJK, getRandomShellPositionH, getRandomShellPositionV } from './shell-utils';
import { shellFromConfig } from './shell-configs';

/**
 * 类指针事件接口，模拟浏览器 PointerEvent 的坐标属性。
 * 用于在非真实点击场景下传递发射位置。
 */
interface PointerEventLike {
	/** 水平坐标（像素），可选 */
	x?: number;
	/** 垂直坐标（像素），可选 */
	y?: number;
}

/**
 * 根据当前全局配置发射一枚烟花弹。
 * 若提供了指针事件则从点击位置发射，否则使用随机位置。
 * @param event - 可选的类指针事件，包含点击坐标信息
 */
function launchShellFromConfig(event?: PointerEventLike) {
	const mainStage = getMainStage();
	const shell = new Shell(shellFromConfig(shellSizeSelector()));
	const w = mainStage.width;
	const h = mainStage.height;

	shell.launch(
		event && event.x != null ? event.x / w : getRandomShellPositionH(),
		event && event.y != null ? 1 - event.y / h : getRandomShellPositionV()
	);
}

/**
 * 发射文字烟花弹，将文本中的每个字符以烟花形式依次展示。
 * 自动检测 CJK 字符并调整间距，支持按批次分时发射，
 * 每批字符之间有额外等待时间以确保前一批烟花充分展示。
 * @param text - 要显示的文字内容
 */
function launchTextShell(text: string) {
	const size = shellSizeSelector();
	const randomColorEnabled = textRandomColorSelector();
	const randomPositionEnabled = textRandomPositionSelector();
	const shuffleEnabled = textRandomPositionShuffleSelector();
	const displayCount = textDisplayCountSelector();
	const singleCluster = textSingleClusterSelector();
	const color = randomColor({ limitWhite: true });
	const chars = [...text];
	const isCJK = hasCJK(text);
	const scaleFactor = scaleFactorSelector();
	const charSpacing = (isCJK ? 0.18 : 0.12) * scaleFactor;
	const charDelay = 600;
	// 每批字符之间的额外等待时间（让前一批烟花充分展示）
	const batchDelay = 2000;

	// 单簇模式：所有文字在一簇烟花中显示
	if (singleCluster) {
		const fullText = text;
		const shell = new Shell({
			shellSize: size,
			spreadSize: 300 + size * 100,
			starLife: 1500 + size * 200,
			starLifeVariation: 0.15,
			starDensity: 0.5,
			color: randomColorEnabled ? randomColor({ limitWhite: true }) : color,
			glitter: 'light',
			glitterColor: whiteOrGold(),
			textString: fullText,
		});
		if (randomPositionEnabled) {
			shell.launch(getRandomShellPositionH(), getRandomShellPositionV());
		} else {
			shell.launch(0.5, 0.7);
		}
		return;
	}

	// 将字符按 displayCount 分批
	for (let batchStart = 0; batchStart < chars.length; batchStart += displayCount) {
		const batchChars = chars.slice(batchStart, batchStart + displayCount);
		const batchIndex = Math.floor(batchStart / displayCount);
		const batchOffset = batchIndex * batchDelay;

		// 随机位置模式下，根据设置决定是否打乱同一批字符的发射顺序
		const launchOrder = batchChars.map((_, i) => i);
		if (randomPositionEnabled && shuffleEnabled) {
			for (let i = launchOrder.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[launchOrder[i], launchOrder[j]] = [launchOrder[j], launchOrder[i]];
			}
		}

		// 随机位置模式下，为每个批次生成一个基准位置
		const baseH = randomPositionEnabled ? getRandomShellPositionH() : 0.5;
		const baseV = randomPositionEnabled ? getRandomShellPositionV() : 0.7;

		launchOrder.forEach((charIndex, launchSlot) => {
			const char = batchChars[charIndex];
			setTimeout(
				() => {
					const shell = new Shell({
						shellSize: size,
						spreadSize: 300 + size * 100,
						starLife: 1500 + size * 200,
						starLifeVariation: 0.15,
						starDensity: 0.5,
						color: randomColorEnabled ? randomColor({ limitWhite: true }) : color,
						glitter: 'light',
						glitterColor: whiteOrGold(),
						textString: char,
					});
					if (randomPositionEnabled) {
						// 随机位置模式：每个字符独立随机位置
						shell.launch(getRandomShellPositionH(), getRandomShellPositionV());
					} else {
						const charCount = batchChars.length;
						const hOffset = (charIndex - (charCount - 1) / 2) * charSpacing;
						shell.launch(baseH + hOffset, baseV);
					}
				},
				batchOffset + launchSlot * charDelay
			);
		});
	}
}

export { launchShellFromConfig, launchTextShell };
