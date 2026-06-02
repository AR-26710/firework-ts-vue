/**
 * @module shells
 * 烟花弹核心模块，提供 Shell 类实现烟花弹的升空与爆炸逻辑。
 */

import { COLOR, INVISIBLE, PI_2, randomColor } from '@/core/constants';
import { isHighQuality, quality, stageW, stageH } from '@/core/state';
import { Star } from './particles/star';
import { BurstFlash } from './particles/burst-flash';
import { createBurst, createParticleArc } from './particles/utils';
import {
	crossetteEffect,
	floralEffect,
	fallingLeavesEffect,
	crackleEffect,
} from './particles/effects';
import type { StarInstance } from './particles/types';
import { soundManager } from '@/audio/sound-manager';
import { Maths } from '@/core/math';
import { isCJKChar } from './shell-utils';
import type { ShellConfig } from './shell-utils';
import { shellSizeSelector } from '@/store/selectors';

interface GlitterConfig {
	sparkFreq: number;
	sparkSpeed: number;
	sparkLife: number;
	sparkLifeVariation: number;
}

interface TextRenderResult {
	positions: { x: number; y: number }[];
	canvasWidth: number;
	canvasHeight: number;
}

interface StarConfig {
	color: string | undefined;
	onDeath: ((star: StarInstance) => void) | undefined;
	sparkFreq: number;
	sparkSpeed: number;
	sparkLife: number;
	sparkLifeVariation: number;
}

class Shell {
	shellSize: number;
	spreadSize: number;
	starLife: number;
	starLifeVariation: number;
	color: string | string[];
	starCount: number;
	starDensity: number;
	secondColor: string | null;
	glitter: string;
	glitterColor: string;
	pistil: boolean;
	pistilColor: string | false;
	streamers: boolean;
	ring: boolean;
	crossette: boolean;
	floral: boolean;
	fallingLeaves: boolean;
	crackle: boolean;
	horsetail: boolean;
	strobe: boolean;
	strobeColor: string | null;
	comet: StarInstance | undefined;
	textString: string;

	constructor(options: ShellConfig) {
		this.shellSize = options.shellSize;
		this.spreadSize = options.spreadSize;
		this.starLife = options.starLife;
		this.starLifeVariation = options.starLifeVariation || 0.125;
		this.color = options.color || randomColor();
		this.glitter = options.glitter || '';
		this.glitterColor = options.glitterColor || (typeof this.color === 'string' ? this.color : '');
		this.starDensity = options.starDensity || 1;
		this.secondColor = options.secondColor || null;
		this.pistil = options.pistil || false;
		this.pistilColor = options.pistilColor || false;
		this.streamers = options.streamers || false;
		this.ring = options.ring || false;
		this.crossette = options.crossette || false;
		this.floral = options.floral || false;
		this.fallingLeaves = options.fallingLeaves || false;
		this.crackle = options.crackle || false;
		this.horsetail = options.horsetail || false;
		this.strobe = options.strobe || false;
		this.strobeColor = options.strobeColor || null;
		this.comet = options.comet;
		this.textString = options.textString || '';

		if (!options.starCount) {
			const density = this.starDensity;
			const scaledSize = this.spreadSize / 54;
			this.starCount = Math.max(6, scaledSize * scaledSize * density);
		} else {
			this.starCount = options.starCount;
		}
	}

	launch(position: number, launchHeight: number) {
		const width = stageW;
		const height = stageH;
		const hpad = 60;
		const vpad = 50;
		const minHeightPercent = 0.45;
		const minHeight = height - height * minHeightPercent;

		const launchX = position * (width - hpad * 2) + hpad;
		const launchY = height;
		const burstY = minHeight - launchHeight * (minHeight - vpad);

		const launchDistance = launchY - burstY;
		const launchVelocity = Math.pow(launchDistance * 0.04, 0.64);

		const comet = (this.comet = Star.add(
			launchX,
			launchY,
			typeof this.color === 'string' && this.color !== 'random' ? this.color : COLOR.White,
			Math.PI,
			launchVelocity * (this.horsetail ? 1.2 : 1),
			launchVelocity * (this.horsetail ? 100 : 400)
		));

		comet.heavy = true;
		comet.spinRadius = Maths.random(0.32, 0.85);
		comet.sparkFreq = 32 / quality;
		if (isHighQuality) comet.sparkFreq = 8;
		comet.sparkLife = 320;
		comet.sparkLifeVariation = 3;
		if (this.glitter === 'willow' || this.fallingLeaves) {
			comet.sparkFreq = 20 / quality;
			comet.sparkSpeed = 0.5;
			comet.sparkLife = 500;
		}
		if (this.color === INVISIBLE) {
			comet.sparkColor = COLOR.Gold;
		}

		if (Math.random() > 0.4 && !this.horsetail) {
			comet.secondColor = INVISIBLE;
			comet.transitionTime = Math.pow(Math.random(), 1.5) * 700 + 500;
		}

		comet.onDeath = (comet) => this.burst(comet.x, comet.y);

		soundManager.playSound('lift');
	}

	private getGlitterConfig(): GlitterConfig {
		const configs: Record<string, GlitterConfig> = {
			light: { sparkFreq: 400, sparkSpeed: 0.3, sparkLife: 300, sparkLifeVariation: 2 },
			medium: { sparkFreq: 200, sparkSpeed: 0.44, sparkLife: 700, sparkLifeVariation: 2 },
			heavy: { sparkFreq: 80, sparkSpeed: 0.8, sparkLife: 1400, sparkLifeVariation: 2 },
			thick: {
				sparkFreq: 16,
				sparkSpeed: isHighQuality ? 1.65 : 1.5,
				sparkLife: 1400,
				sparkLifeVariation: 3,
			},
			streamer: { sparkFreq: 32, sparkSpeed: 1.05, sparkLife: 620, sparkLifeVariation: 2 },
			willow: { sparkFreq: 120, sparkSpeed: 0.34, sparkLife: 1400, sparkLifeVariation: 3.8 },
		};

		const config = configs[this.glitter];
		if (config) {
			return { ...config, sparkFreq: config.sparkFreq / quality };
		}

		return { sparkFreq: 0, sparkSpeed: 0, sparkLife: 0, sparkLifeVariation: 0.25 };
	}

	private getDeathCallback(): ((star: StarInstance) => void) | undefined {
		if (this.crossette) {
			let playedDeathSound = false;
			return (star) => {
				if (!playedDeathSound) {
					soundManager.playSound('crackleSmall');
					playedDeathSound = true;
				}
				crossetteEffect(star);
			};
		}

		if (this.crackle) {
			let playedDeathSound = false;
			return (star) => {
				if (!playedDeathSound) {
					soundManager.playSound('crackle');
					playedDeathSound = true;
				}
				crackleEffect(star);
			};
		}

		if (this.floral) return floralEffect;
		if (this.fallingLeaves) return fallingLeavesEffect;

		return undefined;
	}

	private renderTextToPositions(): TextRenderResult {
		const textChars = [...this.textString];
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
			ctx.fillText(this.textString, charResolution / 2, canvasHeight / 2);
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

	private applyStarGlitter(star: StarInstance, config: GlitterConfig) {
		if (!this.glitter) return;

		star.sparkFreq = config.sparkFreq;
		star.sparkSpeed = config.sparkSpeed;
		star.sparkLife = config.sparkLife;
		star.sparkLifeVariation = config.sparkLifeVariation;
		star.sparkColor = this.glitterColor;
		star.sparkTimer = Math.random() * star.sparkFreq;
	}

	private createStar(
		x: number,
		y: number,
		angle: number,
		speedMult: number,
		speed: number,
		color: string,
		config: StarConfig
	): StarInstance {
		const standardInitialSpeed = this.spreadSize / 1800;

		const star = Star.add(
			x,
			y,
			color,
			angle,
			speedMult * speed,
			this.starLife + Math.random() * this.starLife * this.starLifeVariation,
			this.horsetail ? this.comet?.speedX : 0,
			this.horsetail ? this.comet?.speedY : -standardInitialSpeed
		);

		if (this.secondColor) {
			star.transitionTime = this.starLife * (Math.random() * 0.05 + 0.32);
			star.secondColor = this.secondColor;
		}

		if (this.strobe) {
			star.transitionTime = this.starLife * (Math.random() * 0.08 + 0.46);
			star.strobe = true;
			star.strobeFreq = Math.random() * 20 + 40;
			if (this.strobeColor) {
				star.secondColor = this.strobeColor;
			}
		}

		star.onDeath = config.onDeath;

		if (this.glitter) {
			star.sparkFreq = config.sparkFreq;
			star.sparkSpeed = config.sparkSpeed;
			star.sparkLife = config.sparkLife;
			star.sparkLifeVariation = config.sparkLifeVariation;
			star.sparkColor = this.glitterColor;
			star.sparkTimer = Math.random() * star.sparkFreq;
		}

		return star;
	}

	private burstText(x: number, y: number, color: string | undefined, glitterConfig: GlitterConfig) {
		const { positions } = this.renderTextToPositions();
		const scale = this.spreadSize * 0.7;
		const textColor = color || randomColor();

		positions.forEach((pos) => {
			const star = Star.add(
				x + pos.x * scale,
				y + pos.y * scale,
				textColor,
				Math.random() * PI_2,
				0.08,
				this.starLife + Math.random() * this.starLife * this.starLifeVariation
			);
			this.applyStarGlitter(star, glitterConfig);
		});
	}

	private burstRing(
		x: number,
		y: number,
		color: string,
		speed: number,
		glitterConfig: GlitterConfig
	) {
		const ringStartAngle = Math.random() * Math.PI;
		const ringSquash = Math.pow(Math.random(), 2) * 0.85 + 0.15;

		createParticleArc(0, PI_2, this.starCount, 0, (angle) => {
			const initSpeedX = Math.sin(angle) * speed * ringSquash;
			const initSpeedY = Math.cos(angle) * speed;
			const newSpeed = Maths.pointDist(0, 0, initSpeedX, initSpeedY);
			const newAngle = Maths.pointAngle(0, 0, initSpeedX, initSpeedY) + ringStartAngle;

			const star = Star.add(
				x,
				y,
				color,
				newAngle,
				newSpeed,
				this.starLife + Math.random() * this.starLife * this.starLifeVariation
			);
			this.applyStarGlitter(star, glitterConfig);
		});
	}

	private burstSingleColor(
		x: number,
		y: number,
		color: string | undefined,
		speed: number,
		starConfig: StarConfig
	) {
		const starFactory = (angle: number, speedMult: number) => {
			this.createStar(x, y, angle, speedMult, speed, color || randomColor(), starConfig);
		};

		if (this.textString) {
			this.burstText(x, y, color, starConfig);
		} else if (this.ring) {
			this.burstRing(x, y, color!, speed, starConfig);
		} else {
			createBurst(this.starCount, starFactory);
		}
	}

	private burstMultiColor(x: number, y: number, speed: number, starConfig: StarConfig) {
		const colors = this.color as string[];

		if (Math.random() < 0.5) {
			const start = Math.random() * Math.PI;
			const start2 = start + Math.PI;
			const arc = Math.PI;

			starConfig.color = colors[0];
			const starFactory1 = (angle: number, speedMult: number) => {
				this.createStar(x, y, angle, speedMult, speed, colors[0], starConfig);
			};
			createBurst(this.starCount, starFactory1, start, arc);

			starConfig.color = colors[1];
			const starFactory2 = (angle: number, speedMult: number) => {
				this.createStar(x, y, angle, speedMult, speed, colors[1], starConfig);
			};
			createBurst(this.starCount, starFactory2, start2, arc);
		} else {
			const starFactory1 = (angle: number, speedMult: number) => {
				this.createStar(x, y, angle, speedMult, speed, colors[0], starConfig);
			};
			createBurst(this.starCount / 2, starFactory1);

			const starFactory2 = (angle: number, speedMult: number) => {
				this.createStar(x, y, angle, speedMult, speed, colors[1], starConfig);
			};
			createBurst(this.starCount / 2, starFactory2);
		}
	}

	private createPistil(x: number, y: number) {
		const innerShell = new Shell({
			spreadSize: this.spreadSize * 0.5,
			starLife: this.starLife * 0.6,
			starLifeVariation: this.starLifeVariation,
			starDensity: 1.4,
			color: this.pistilColor as string,
			glitter: 'light',
			glitterColor: this.pistilColor === COLOR.Gold ? COLOR.Gold : COLOR.White,
			shellSize: this.shellSize,
		});
		innerShell.burst(x, y);
	}

	private createStreamers(x: number, y: number) {
		const innerShell = new Shell({
			spreadSize: this.spreadSize * 0.9,
			starLife: this.starLife * 0.8,
			starLifeVariation: this.starLifeVariation,
			starCount: Math.floor(Math.max(6, this.spreadSize / 45)),
			color: COLOR.White,
			glitter: 'streamer',
			shellSize: this.shellSize,
		});
		innerShell.burst(x, y);
	}

	burst(x: number, y: number) {
		const speed = this.spreadSize / 96;
		const glitterConfig = this.getGlitterConfig();
		const onDeath = this.getDeathCallback();

		const starConfig: StarConfig = {
			color: undefined,
			onDeath,
			...glitterConfig,
		};

		if (typeof this.color === 'string') {
			const color = this.color === 'random' ? undefined : this.color;
			this.burstSingleColor(x, y, color, speed, starConfig);
		} else if (Array.isArray(this.color)) {
			this.burstMultiColor(x, y, speed, starConfig);
		} else {
			throw new Error(
				'Invalid shell color. Expected string or array of strings, but got: ' + this.color
			);
		}

		if (this.pistil) {
			this.createPistil(x, y);
		}

		if (this.streamers) {
			this.createStreamers(x, y);
		}

		BurstFlash.add(x, y, this.spreadSize / 4);

		if (this.comet) {
			const maxDiff = 2;
			const sizeDifferenceFromMaxSize = Math.min(maxDiff, shellSizeSelector() - this.shellSize);
			const soundScale = (1 - sizeDifferenceFromMaxSize / maxDiff) * 0.3 + 0.7;
			soundManager.playSound('burst', soundScale);
		}
	}
}

export { Shell };
