import fetch, { Response, RequestInit } from 'node-fetch';
import { GET_USER } from '../../src/graphql/requests/user-requests';
import { User } from 'mantle';

export type Headers = { [name: string]: string };

/**
 * Represents an agent that can make calls to the backend
 */
export default class Agent {
  public host: string;
  public cookie: string;
  public username: string;
  public password: string;
  public email: string;

  constructor(host: string, cookie: string | null, username: string, password: string, email: string) {
    this.host = host;
    this.cookie = cookie || '';
    this.username = username;
    this.password = password;
    this.email = email;
  }

  async getUser(username: string) {
    const resp = await this.graphql<{ user: User }>(GET_USER, { user: username });
    return resp.data.user;
  }

  async graphql<T>(query: string, variables: any, headerOptions?: Headers) {
    const headers: Headers = {
      cookie: this.cookie,
      'content-type': 'application/json',
      ...headerOptions,
    };

    const resp = await fetch(`${this.host}/graphql`, {
      method: 'post',
      body: JSON.stringify({
        query,
        variables,
      }),
      headers: headers,
    });

    const json = await resp.json();
    const data = json.data as T;
    const errors = json.errors as { message: string }[];
    if (errors && errors.length > 0) throw new Error(errors[0].message);

    return { data, response: resp };
  }

  async get(url: string, options: Headers = {}, init?: RequestInit) {
    const headers: Headers = {
      cookie: this.cookie,
      'content-type': 'application/json',
      ...options,
    };

    return await fetch(`${this.host}${url}`, {
      method: 'GET',
      headers: headers,
      ...init,
    });
  }

  async put(url: string, data?: any, options: Headers = {}) {
    const headers: Headers = {
      cookie: this.cookie,
      'content-type': 'application/json',
      ...options,
    };

    const contentType = headers['content-type'] || headers['Content-Type'];

    return await fetch(`${this.host}${url}`, {
      method: 'PUT',
      headers: headers,
      body: contentType === 'application/json' ? JSON.stringify(data) : data,
    });
  }

  async post(url: string, data?: any, options: Partial<Headers> = {}) {
    const headers: Headers = {
      cookie: this.cookie,
      'content-type': 'application/json',
      ...options,
    };

    if (headers['content-type'] === 'multipart/form-data') delete headers['content-type'];

    const contentType = headers['content-type'] || headers['Content-Type'];

    return await fetch(`${this.host}${url}`, {
      method: 'POST',
      headers: headers,
      body: contentType === 'application/json' ? JSON.stringify(data) : data,
    });
  }

  async delete(url: string, options: Headers = {}) {
    const headers: Headers = {
      cookie: this.cookie,
      'content-type': 'application/json',
      ...options,
    };

    return await fetch(`${this.host}${url}`, {
      method: 'DELETE',
      headers: headers,
    });
  }

  async getJson<T>(url: string, options: Headers = {}) {
    return this.json<T>(url, 'get', undefined, options);
  }

  async putJson<T>(url: string, data: any, options: Headers = {}) {
    return this.json<T>(url, 'put', data, options);
  }

  async postJson<T>(url: string, data: any, options: Headers = {}) {
    return this.json<T>(url, 'post', data, options);
  }

  private async json<T>(url: string, type: string, data?: any, options: Headers = {}) {
    const headers: Headers = {
      method: type,
      'content-type': 'application/json',
      cookie: this.cookie,
      ...options,
    };

    const contentType = headers['content-type'] || headers['Content-Type'];

    const response = await fetch(`${this.host}${url}`, {
      method: 'PUT',
      headers: headers,
      body: contentType === 'application/json' ? JSON.stringify(data) : data,
    });

    const json: T = await response.json();
    return json;
  }

  getSID() {
    return this.cookie ? this.cookie.split('=')[1] : '';
  }

  /**
   * Updates the cookie of the agent
   * @param {string} response
   */
  updateCookie(response: Response) {
    this.cookie = response.headers.get('set-cookie')!.split(';')[0];
  }
}
