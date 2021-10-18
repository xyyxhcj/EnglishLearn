import {createApp} from 'vue'
import App from './App.vue'
import {createI18n} from "vue-i18n";
import enUS from 'vant/es/locale/lang/en-US';
import {
    Locale,
    Button,
    Calendar,
    Cell,
    Collapse,
    CollapseItem,
    DropdownMenu,
    DropdownItem,
    Loading,
    Overlay,
    Switch,
    Tag
} from 'vant';
import 'vant/es/button/style';
import 'vant/es/calendar/style';
import 'vant/es/cell/style';
import 'vant/es/collapse/style';
import 'vant/es/collapse-item/style';
import 'vant/es/dropdown-menu/style';
import 'vant/es/dropdown-item/style';
import 'vant/es/loading/style';
import 'vant/es/overlay/style';
import 'vant/es/switch/style';
import 'vant/es/tag/style';


const i18n = createI18n({
    locale: 'en',
})
Locale.use('en-US', enUS);
createApp(App)
    .use(i18n)
    .use(Button)
    .use(Calendar)
    .use(Cell)
    .use(Collapse)
    .use(CollapseItem)
    .use(DropdownMenu)
    .use(DropdownItem)
    .use(Loading)
    .use(Overlay)
    .use(Switch)
    .use(Tag)
    .mount('#app');
