import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

const pinia = createPinia();
// 使用持久化存储插件
pinia.use(piniaPluginPersistedstate);

export default pinia;
