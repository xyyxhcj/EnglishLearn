import {createApp} from 'vue'
import App from './App.vue'
import {createI18n} from "vue-i18n";
import enUS from 'vant/es/locale/lang/en-US';
import {
    ActionBar,
    ActionBarButton,
    Locale,
    Button,
    Calendar,
    Cell,
    CellGroup,
    Checkbox,
    CheckboxGroup,
    Collapse,
    CollapseItem,
    DropdownMenu,
    DropdownItem,
    Icon,
    Image as VanImage,
    Loading,
    Overlay,
    Popup,
    Skeleton,
    Switch,
    Tag,
    Toast
} from 'vant';
import 'vant/es/action-bar/style';
import 'vant/es/action-bar-button/style';
import 'vant/es/button/style';
import 'vant/es/calendar/style';
import 'vant/es/cell/style';
import 'vant/es/cell-group/style';
import 'vant/es/checkbox/style';
import 'vant/es/checkbox-group/style';
import 'vant/es/collapse/style';
import 'vant/es/collapse-item/style';
import 'vant/es/dropdown-menu/style';
import 'vant/es/dropdown-item/style';
import 'vant/es/icon/style';
import 'vant/es/image/style';
import 'vant/es/loading/style';
import 'vant/es/overlay/style';
import 'vant/es/popup/style';
import 'vant/es/skeleton/style';
import 'vant/es/switch/style';
import 'vant/es/tag/style';
import 'vant/es/toast/style';


const i18n = createI18n({
    locale: 'en',
})
Locale.use('en-US', enUS);
createApp(App)
    .use(i18n)
    .use(ActionBar)
    .use(ActionBarButton)
    .use(Button)
    .use(Calendar)
    .use(Cell)
    .use(CellGroup)
    .use(Checkbox)
    .use(CheckboxGroup)
    .use(Collapse)
    .use(CollapseItem)
    .use(DropdownMenu)
    .use(DropdownItem)
    .use(Icon)
    .use(VanImage)
    .use(Loading)
    .use(Overlay)
    .use(Popup)
    .use(Skeleton)
    .use(Switch)
    .use(Tag)
    .use(Toast)
    .mount('#app');
