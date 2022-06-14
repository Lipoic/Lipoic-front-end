import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { useUserStore } from '@/stores/models/user';
import globalConfig from '@/config';
import { deepAssign } from '@/utils/Object';
import { Code } from '@/api/code';

export const useToken: AxiosRequestConfig = { token: true };

export class HttpClient {
  public readonly axios: AxiosInstance;
  private readonly config: Partial<AxiosRequestConfig>;

  constructor(config: Partial<AxiosRequestConfig> = globalConfig.http) {
    this.config = <AxiosRequestConfig>deepAssign(globalConfig.http, config);
    this.axios = axios.create(this.config);

    this.axios.interceptors.request.use(this.requestHandler.bind(this));
    this.axios.interceptors.response.use(
      this.responseHandler.bind(this),
      this.responseErrorHandler.bind(this)
    );
  }

  public async post<T, G = Response<T>>(
    path: PathType,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<G> {
    return this.getRequestData(this.axios.post(path, data, config));
  }

  public async postForm<T, G = Response<T>>(
    path: PathType,
    data?: PostFormType,
    config?: AxiosRequestConfig
  ): Promise<G> {
    const formBody = new FormData();

    for (const [key, value] of Object.entries(data || {})) {
      if (value instanceof Blob || typeof value === 'string') {
        formBody.append(key, value);
      } else formBody.append(key, value.value, value.fileName);
    }

    return this.post(
      path,
      formBody,
      <AxiosRequestConfig>deepAssign({
        headers: { 'Content-Type': 'multipart/form-data' },
        config,
      })
    );
  }

  public async get<T, G = Response<T>>(
    path: PathType,
    params?: unknown,
    config?: AxiosRequestConfig
  ): Promise<G> {
    return this.getRequestData(this.axios.get(path, { params, ...config }));
  }

  public async patch<T, G = Response<T>>(
    path: PathType,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<G> {
    return this.getRequestData(this.axios.patch(path, data, config));
  }

  public async delete<T, G = Response<T>>(
    path: PathType,
    config?: AxiosRequestConfig
  ): Promise<G> {
    return this.getRequestData(this.axios.delete(path, config));
  }

  private async getRequestData<T>(
    response: Promise<AxiosResponse>
  ): Promise<T> {
    return (await response).data;
  }

  private requestHandler(config: AxiosRequestConfig) {
    const userStore = useUserStore();

    config.headers = { ...this.config.headers, ...config.headers };

    let { token } = this.config;

    if (config.token === true) token = userStore.getToken;
    else if (typeof config.token === 'string') token = config.token;

    token && (config.headers.Authorization = `Bearer ${token}`);

    return config;
  }

  private responseHandler(response: AxiosResponse<unknown, unknown>) {
    // TODO: success callback
    return response;
  }

  private async responseErrorHandler<T>(error: {
    response?: AxiosResponse<Response<T>, unknown>;
    config: AxiosRequestConfig;
  }) {
    const { config } = error;

    if (error.response) {
      const errorData: ResponseErrorData<T> = {
        ...error.response.data,
        config,
      };

      return Promise.reject(errorData);
    }

    config.__retryCount ||= 0;
    if (
      config.reconnect === false ||
      config.__retryCount >= (config.retry ?? (globalConfig.http.retry || 0))
    ) {
      // TODO: error callback

      return Promise.reject(error);
    }
    config.__retryCount += 1;

    return await this.axios(config);
  }
}

declare module 'axios' {
  interface AxiosRequestConfig {
    /** retry count don'ts touch
     * @private
     */
    __retryCount?: number;
    /** use token */
    token?: boolean | string;
    /** number of retry */
    retry?: number;
    /** try reconnect */
    reconnect?: boolean;
  }
}

/** API Response
 * @url https://github.com/Lipoic/Lipoic-Server/blob/7b678356a6079a7255cd42cd708780e9093d056c/src/router/src/data/response.rs#L8
 */
export interface Response<D = unknown> {
  code: Code;
  message: string;
  data?: D;
}

export interface ResponseErrorData<T> extends Response<T> {
  config: AxiosRequestConfig;
}

export type PathType = `/${string}`;
export type PostFormType = Record<
  string,
  string | Blob | { value: string | Blob; fileName?: string }
>;

const httpClient = new HttpClient();
export default httpClient;
