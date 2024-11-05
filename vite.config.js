import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	plugins: [
		react(),
		VitePWA({
			registerType: 'autoUpdate',
			manifest: {
				name: 'Rezepte App',
				short_name: 'Rezepte',
				start_url: '/',
				display: 'standalone',
				background_color: '#ffffff',
				theme_color: '#000000',
				icons: [
					{
						src: 'koch2.jpg', // 192x192
						sizes: '192x192',
						type: 'image/jpg',
						purpose: 'any maskable', // Unterstützt auch maskierbare Icons
					},
					{
						src: 'koch2.jpg', // 512x512
						sizes: '512x512',
						type: 'image/jpg',
						purpose: 'any maskable',
					},
					{
						src: 'koch2.jpg', // 180x180, für iOS wichtig
						sizes: '180x180',
						type: 'image/jpg',
						purpose: 'any',
					},
					{
						src: 'koch2.jpg', // 167x167, weitere iOS-Größe
						sizes: '167x167',
						type: 'image/jpg',
						purpose: 'any',
					},
					{
						src: 'koch2.jpg', // 120x120, für ältere iOS-Geräte
						sizes: '120x120',
						type: 'image/jpg',
						purpose: 'any',
					},
				],
			},
		}),
	],
});
