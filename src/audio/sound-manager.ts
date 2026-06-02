/**
 * @module sound-manager
 * @description 音效管理模块，负责音频资源的预加载、播放控制以及音量/播放速率的动态调节。
 * 基于 Web Audio API 实现，支持多种烟花音效（升空、爆炸、小型爆炸、噼啪声等）的加载与播放。
 */

import { Maths } from '@/core/math';
import { canPlaySoundSelector } from '@/store/selectors';
import { simSpeed } from '@/core/state';

/**
 * 单种音效资源的配置接口。
 * 定义了音效的基础音量、播放速率范围、文件名列表以及解码后的音频缓冲区。
 */
interface SoundSource {
	/** 基础音量，取值范围 0~1 */
	volume: number;
	/** 播放速率随机最小值 */
	playbackRateMin: number;
	/** 播放速率随机最大值 */
	playbackRateMax: number;
	/** 音频文件名列表，播放时从中随机选取 */
	fileNames: string[];
	/** 解码后的音频缓冲区数组，由 preload 方法填充 */
	buffers?: AudioBuffer[];
}

/**
 * 所有音效资源的集合接口。
 * 键为音效类型名称，值为对应的 SoundSource 配置。
 */
interface SoundSources {
	/** 音效类型名称到其配置的映射 */
	[key: string]: SoundSource;
}

/**
 * 音效管理器对象，负责音频的预加载、暂停/恢复以及播放控制。
 * 包含升空（lift）、爆炸（burst）、小型爆炸（burstSmall）、
 * 噼啪声（crackle）和小型噼啪声（crackleSmall）等音效类型。
 */
const soundManager = {
	/** 音频文件的基础 URL 路径 */
	baseURL: 'audio/',
	/** Web Audio API 的音频上下文实例 */
	ctx: new (window.AudioContext || (window as any).webkitAudioContext)() as AudioContext,
	/** 所有音效资源的配置集合 */
	sources: {
		lift: {
			volume: 1,
			playbackRateMin: 0.85,
			playbackRateMax: 0.95,
			fileNames: ['lift1.mp3', 'lift2.mp3', 'lift3.mp3'],
		},
		burst: {
			volume: 1,
			playbackRateMin: 0.8,
			playbackRateMax: 0.9,
			fileNames: ['burst1.mp3', 'burst2.mp3'],
		},
		burstSmall: {
			volume: 0.25,
			playbackRateMin: 0.8,
			playbackRateMax: 1,
			fileNames: ['burst-sm-1.mp3', 'burst-sm-2.mp3'],
		},
		crackle: {
			volume: 0.2,
			playbackRateMin: 1,
			playbackRateMax: 1,
			fileNames: ['crackle1.mp3'],
		},
		crackleSmall: {
			volume: 0.3,
			playbackRateMin: 1,
			playbackRateMax: 1,
			fileNames: ['crackle-sm-1.mp3'],
		},
	} as SoundSources,

	/**
	 * 预加载所有音效资源。
	 * 遍历所有音效类型，逐个获取音频文件并解码为 AudioBuffer，
	 * 解码后的缓冲区存储到对应 SoundSource 的 buffers 数组中。
	 * @returns 返回一个 Promise，当所有音频文件加载并解码完成后 resolve
	 */
	preload(): Promise<void[]> {
		const allFilePromises: Promise<void>[] = [];

		function checkStatus(response: Response) {
			if (response.status >= 200 && response.status < 300) {
				return response;
			}
			const customError = new Error(response.statusText) as Error & { response: Response };
			customError.response = response;
			throw customError;
		}

		const types = Object.keys(this.sources);
		types.forEach((type) => {
			const source = this.sources[type];
			const { fileNames } = source;
			const filePromises: Promise<void>[] = [];
			fileNames.forEach((fileName) => {
				const fileURL = this.baseURL + fileName;
				const promise = fetch(fileURL)
					.then(checkStatus)
					.then((response) => response.arrayBuffer())
					.then((data) => this.ctx.decodeAudioData(data))
					.then((buffer) => {
						if (!source.buffers) source.buffers = [];
						source.buffers.push(buffer);
					});

				filePromises.push(promise);
				allFilePromises.push(promise);
			});
		});

		return Promise.all(allFilePromises);
	},

	/**
	 * 暂停所有音频播放。
	 * 通过挂起 AudioContext 来停止所有音频输出。
	 */
	pauseAll() {
		this.ctx.suspend();
	},

	/**
	 * 恢复所有音频播放。
	 * 先静音播放一次升空音效以满足浏览器自动播放策略，
	 * 延迟 250ms 后恢复 AudioContext。
	 */
	resumeAll() {
		this.playSound('lift', 0);
		setTimeout(() => {
			this.ctx.resume();
		}, 250);
	},

	/** 上次播放小型爆炸音效的时间戳，用于节流控制，避免短时间内重复播放 */
	_lastSmallBurstTime: 0,

	/**
	 * 播放指定类型的音效。
	 * 根据缩放比例动态调整音量和播放速率，并从预加载的缓冲区中随机选取音频进行播放。
	 * 对于 burstSmall 类型，内置 20ms 的节流机制防止过于频繁的播放。
	 * @param type - 音效类型名称，如 'lift'、'burst'、'burstSmall'、'crackle'、'crackleSmall'
	 * @param scale - 音量缩放比例，取值范围 0~1，默认为 1。值越小音量越低、播放速率越高
	 */
	playSound(type: string, scale: number = 1) {
		scale = Maths.clamp(scale, 0, 1);

		if (!canPlaySoundSelector() || simSpeed < 0.95) {
			return;
		}

		if (type === 'burstSmall') {
			const now = Date.now();
			if (now - this._lastSmallBurstTime < 20) {
				return;
			}
			this._lastSmallBurstTime = now;
		}

		const source = this.sources[type];

		if (!source || !source.buffers || !source.buffers.length) {
			return;
		}

		const initialVolume = source.volume;
		const initialPlaybackRate = Maths.random(source.playbackRateMin, source.playbackRateMax);

		const scaledVolume = initialVolume * scale;
		const scaledPlaybackRate = initialPlaybackRate * (2 - scale);

		const gainNode = this.ctx.createGain();
		gainNode.gain.value = scaledVolume;

		const buffer = Maths.randomChoice(source.buffers) as AudioBuffer;
		const bufferSource = this.ctx.createBufferSource();
		bufferSource.playbackRate.value = scaledPlaybackRate;
		bufferSource.buffer = buffer;
		bufferSource.connect(gainNode);
		gainNode.connect(this.ctx.destination);
		bufferSource.start(0);
	},
};

export { soundManager };
