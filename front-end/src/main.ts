import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import axios from 'axios';
import VueAxios from 'vue-axios';
import './index.css';
import BaseButton from '@/components/BaseButton.vue';
import BaseCard from '@/components/BaseCard.vue';
import TheFooter from '@/components/TheFooter.vue';
import TheHeader from '@/components/TheHeader.vue';
import BaseUi from '@/components/BaseUi.vue';

if (process.env.NODE_ENV === 'development') {
	const { worker } = await import('./mocks/browser');
	worker.start();
}

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(VueAxios, axios);
app.provide('axios', app.config.globalProperties.axios);

app.component('base-button', BaseButton);
app.component('base-card', BaseCard);
app.component('the-footer', TheFooter);
app.component('the-header', TheHeader);
app.component('base-ui', BaseUi);

app.mount('#app');
