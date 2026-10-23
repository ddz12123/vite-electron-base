import '@renderer/styles/main.css';

import { createApp } from 'vue';
import App from './App.vue';
import router from '@renderer/router';
import pinia from '@renderer/store';
import { setupErrorReporting } from '@renderer/utils/error-report';

const app = createApp(App);

setupErrorReporting(app);
app.use(pinia);
app.use(router);
app.mount('#app');
