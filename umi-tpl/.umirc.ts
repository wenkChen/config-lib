import { defineConfig } from 'umi';
import routes from './config/router'

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  fastRefresh: {},
  antd: {},
  alias: {
    '@utils': 'src/utils',
    '@layout': 'src/layout',
  },
  routes,
  mfsu: {},
  webpack5: {},
});
