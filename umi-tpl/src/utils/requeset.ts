import { extend } from 'umi-request';
import { history } from 'umi';
import { message } from 'antd';
import { stringify } from 'querystring';
import type { ResponseError } from 'umi-request/types'
const API_URL = ''

const codeMessage: Record<string, string> = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
}

/** 异常处理程序 */
const errorHandler = (error: ResponseError) => {
  if (error) {
    console.log(`[REQUEST]:${codeMessage[error.data.code]}`)
    if (error.data.code === '401') { //在这里对token过期或者没有登录时的情况跳转到登录页面
      history.replace({
        pathname: '/login',
        search: stringify({
          redirect: window.location.hash.substring(1),//记录是从哪个页面跳转到登录页的，登录后直接跳转到对应的页面
        }),
      });
      localStorage.clear();
    }
    message.error(error.message, 1);
  } else {
    message.error('您的网络发生异常，无法连接服务器', 1);
  }
};

/** 配置request请求时的默认参数 */
const request = extend({
  prefix: API_URL,
  timeout: 60000,
  errorHandler: errorHandler, // 默认错误处理
  credentials: 'include', // 默认请求是否带上cookie
});

// request拦截器, 改变url 或 options.
request.interceptors.request.use((url, options) => {
  const token = localStorage.getItem('token');//获取存储在本地的token
  const { headers = {} } = options || {};
  const tokenHeaders = {
    'cwk-token': token,
    ...headers,
  };

  if (options.method?.toUpperCase() === 'GET') {
    options.params = options.data;
  } else {
    // 请求参数和后端约定的是除了一些特殊情况使用formData 其他都使用json格式，因此默认是使用json格式
    options.requestType = options.requestType ? options.requestType : 'json';
  }

  if (token) {
    return {
      url,
      options: { ...options, tokenHeaders },
    };
  }
  return {
    url,
    options: { ...options },
  };
});

request.interceptors.response.use(async (response) => {
  const data = await response.clone().json();
  if (data.success) {
    return response; //我们的项目是通过success来判断是否请求成功
  }
  return Promise.reject(data);//注意：需要reject出去才会在请求不成功或返回错误的code时调用errorHandler
});

export default request;