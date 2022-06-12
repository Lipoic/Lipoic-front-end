import HttpConfig from '@/config/http';

export interface Config {
  /** Request and http configuration */
  http: HttpConfig;
}

const defaultHttpConfig: HttpConfig = {
  headers: {
    'content-type': 'application/json;charset=UTF-8',
  },
  reconnect: true,
  retry: 2,
  baseURL:
    import.meta.env.MODE === 'production'
      ? 'https://lipoic-test-server.herokuapp.com' // TODO: change to https://api.lipoic.org
      : 'https://lipoic-test-server.herokuapp.com',
};

export const globalConfig: Config = {
  http: defaultHttpConfig,
};

export default globalConfig;
