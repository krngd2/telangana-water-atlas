import {defineConfig} from 'vite';
// Terrain is pre-generated: restart Vite after adding tiles so its public-file
// index includes them. Watchers stay disabled for the large tile archive.
export default defineConfig({server:{watch:{ignored:['**/public/data/terrain/**']}},build:{rollupOptions:{output:{manualChunks:{three:['three','three/addons/controls/OrbitControls.js']}}}}});
