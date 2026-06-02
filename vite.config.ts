import { defineConfig, type ViteDevServer } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { execSync } from 'node:child_process';

function iconifyExtractPlugin() {
	const scriptPath = resolve(__dirname, 'scripts/extract-icons.mjs');

	function runExtract() {
		execSync(`node "${scriptPath}"`, { stdio: 'inherit' });
	}

	return {
		name: 'vite-plugin-iconify-extract',
		buildStart() {
			runExtract();
		},
		configureServer(server: ViteDevServer) {
			server.watcher.add(scriptPath);
			server.watcher.on('change', (file: string) => {
				if (file === scriptPath) {
					runExtract();
				}
			});
		},
	};
}

export default defineConfig({
	root: '.',
	publicDir: 'public',
	plugins: [vue(), iconifyExtractPlugin()],
	build: {
		outDir: 'dist',
		rollupOptions: {
			output: {
				manualChunks(id: string) {
					if (id.includes('node_modules/vue')) {
						return 'vue';
					}
					if (id.includes('node_modules/vue-i18n') || id.includes('node_modules/@iconify')) {
						return 'vue-ecosystem';
					}
					return undefined;
				},
			},
		},
	},
	resolve: {
		alias: {
			'@': resolve(__dirname, 'src'),
		},
	},
});
