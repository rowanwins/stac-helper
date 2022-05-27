import {createApp} from 'vue'
import App from './App.vue'
import {
  Alert,
  Button,
  Col,
  Row,
  Select,
  Skeleton,
  Steps,
  Table,
  Tabs,
  Tag
} from 'ant-design-vue'

import dayjs from 'dayjs'
import 'dayjs/locale/en-au'
import router from './router/router'
import store from './store/store'

dayjs.locale('en-au')

const app = createApp(App)
app.use(Alert)
app.use(Button)
app.use(Col)
app.use(Row)
app.use(Select)
app.use(Steps)
app.use(Skeleton)
app.use(Table)
app.use(Tabs)
app.use(Tag)

app.use(router)
router.app = app

app.use(store)

app.mount('#app')
