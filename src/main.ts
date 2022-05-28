import { createApp } from 'vue';
import 'virtual:svg-icons-register';

import '@/scss/global.scss';
import '@/scss/themes/dark.scss';
import '@/scss/themes/light.scss';

import I18nHelper from './helper/I18nHelper';
import FirebaseHelper from './helper/FirebaseHelper';

import router from '@/router';
import plugin from '@/plugin';
import App from '@/MainApp.vue';
import SvgIconComponent from '@/components/SvgIcon.vue';

(async () => {
  FirebaseHelper.init();
  const i18n = await I18nHelper.load();

  const app = createApp(App)
    .use(i18n)
    .use(plugin)
    .use(router)
    .component('SvgIcon', SvgIconComponent)
    .mount('#app');
})();
