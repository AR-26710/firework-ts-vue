/**
 * @module text-renderer
 * 文字渲染模块，将文字渲染为像素位置数据。
 */

import { isCJKChar } from './shell-utils';
import type { TextRenderResult } from './shell-types';

export function renderTextToPositions(textString: string): TextRenderResult {
	const textChars = [...textString];
	const isCJK = textChars.some((ch) => isCJKChar(ch));
	const charResolution = isCJK ? 120 : 80;
	const canvasHeight = charResolution;
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d')!;
	ctx.fillStyle = '#fff';
	const fontFamily = isCJK
		? '"Microsoft YaHei", "PingFang SC", "Noto Sans SC", "SimHei", sans-serif'
		: 'sans-serif';
	ctx.font = `bold ${charResolution * 0.75}px ${fontFamily}`;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';

	const charCount = textChars.length;
	let canvasWidth: number;

	if (charCount > 1) {
		const charWidths = textChars.map((ch) => ctx.measureText(ch).width);
		const totalWidth = charWidths.reduce((sum, w) => sum + w, 0);
		const gap = isCJK ? charResolution * 0.05 : charResolution * 0.02;
		canvasWidth = Math.ceil(totalWidth + gap * (charCount - 1) + charResolution * 0.2);
		canvas.width = canvasWidth;
		ctx.fillStyle = '#fff';
		ctx.font = `bold ${charResolution * 0.75}px ${fontFamily}`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		let offsetX = (canvasWidth - totalWidth - gap * (charCount - 1)) / 2;
		for (let i = 0; i < charCount; i++) {
			ctx.fillText(textChars[i], offsetX + charWidths[i] / 2, canvasHeight / 2);
			offsetX += charWidths[i] + gap;
		}
	} else {
		canvasWidth = charResolution;
		canvas.width = canvasWidth;
		ctx.fillStyle = '#fff';
		ctx.font = `bold ${charResolution * 0.75}px ${fontFamily}`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(textString, charResolution / 2, canvasHeight / 2);
	}

	const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
	const positions: { x: number; y: number }[] = [];
	const step = 2;

	for (let py = 0; py < canvasHeight; py += step) {
		for (let px = 0; px < canvasWidth; px += step) {
			const alpha = imageData.data[(py * canvasWidth + px) * 4 + 3];
			if (alpha > 128) {
				positions.push({
					x: (px - canvasWidth / 2) / canvasHeight,
					y: (py - canvasHeight / 2) / canvasHeight,
				});
			}
		}
	}

	return { positions, canvasWidth, canvasHeight };
}
