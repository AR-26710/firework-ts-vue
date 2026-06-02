/**
 * Vitest 测试环境设置文件。
 * 在所有测试模块加载之前执行，用于设置浏览器 API 的模拟。
 */

// Mock Web Audio API for jsdom
if (typeof window !== 'undefined' && !window.AudioContext) {
	(window as any).AudioContext = class AudioContext {
		createGain() {
			return {
				gain: { value: 1, setValueAtTime: () => {} },
				connect: () => {},
				disconnect: () => {},
			};
		}
		createBufferSource() {
			return {
				buffer: null,
				connect: () => {},
				disconnect: () => {},
				start: () => {},
				stop: () => {},
			};
		}
		decodeAudioData() {
			return Promise.resolve({
				getChannelData: () => new Float32Array(0),
				duration: 0,
				numberOfChannels: 1,
				sampleRate: 44100,
				length: 0,
			});
		}
		close() {}
		resume() {
			return Promise.resolve();
		}
	};
}
if (typeof window !== 'undefined' && !(window as any).webkitAudioContext) {
	(window as any).webkitAudioContext = (window as any).AudioContext;
}
