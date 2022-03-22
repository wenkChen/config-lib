import { IConfigFromPlugins } from "@/.umi/core/pluginConfig"

const routes: IConfigFromPlugins['routes'] = [
  {
    path: '/',
    component: '@/layouts/index',
    routes: [
      { path: '/user', redirect: '/user/login' },
      { path: '/user/login', component: './user/login' },
    ],
  },
]
export default routes 