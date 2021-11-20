import path from 'path'
import type { PostGrid, PostGridOptions, PostGridError } from './'

export interface Template {
  id: string;
  object: string;
  live: boolean;
  description?: string;
  html: string;
  metadata?: any;
}

export interface TemplateList {
  object: string;
  limit: number;
  skip: number;
  totalCount: number;
  data: Template[];
}

import { NO_MAIL_API_KEY } from './'

export class TemplateApi {
  client: PostGrid;
  baseRoute: string;

  constructor(client: PostGrid, options?: PostGridOptions) {  // eslint-disable-line no-unused-vars
    this.client = client
    this.baseRoute = 'print-mail/v1/'
  }

  /*
   * Function to take a Template id and return the Template object in the
   * response. If the template isn't in the system, then we will return
   * the appropriate error.
   */
  async get(id: string): Promise<{
    success: boolean,
    template?: Template,
    error?: PostGridError,
  }> {
    // make sure we have the API Key for this call
    if (!this.client.apiKeys.mail) {
      return NO_MAIL_API_KEY
    }
    // ...and now we can make the call...
    const resp = await this.client.fire(
      'GET',
      path.join(this.baseRoute, 'templates', id),
      { 'x-api-key': this.client.apiKeys.mail },
    )
    if (resp?.response?.status >= 400) {
      return {
        success: false,
        error: resp?.payload?.error,
      }
    }
    return { success: (resp && !resp.payload?.error), template: resp.payload }
  }

  /*
   * Function to list all the available Templates in the PostGrid set and
   * return them in the response. This will be based on the PostGrid 'List'
   * paging scheme - so there's that.
   */
  async list(limit?: number, skip?: number): Promise<{
    success: boolean,
    templates?: TemplateList,
    error?: PostGridError,
  }> {
    // make sure we have the API Key for this call
    if (!this.client.apiKeys.mail) {
      return NO_MAIL_API_KEY
    }
    // ...and now we can make the call...
    const resp = await this.client.fire(
      'GET',
      path.join(this.baseRoute, 'templates'),
      { 'x-api-key': this.client.apiKeys.mail },
      { skip: skip || 0, limit: limit || 40 },
    )
    if (resp?.response?.status >= 400) {
      return {
        success: false,
        error: resp?.payload?.error,
      }
    }
    return {
      success: (resp && !resp.payload?.error),
      templates: resp.payload,
    }
  }

  /*
   * Function to create a template within PostGrid, and there is a different
   * function for updating a template, where you have to provide a valid
   * template id... so this is for new ones, and the other is for updates.
   */
  async create(template: {
    description?: string;
    html: string;
    metadata?: any;
  }): Promise<{
    success: boolean,
    template?: Template,
    error?: PostGridError,
  }> {
    // make sure we have the API Key for this call
    if (!this.client.apiKeys.mail) {
      return NO_MAIL_API_KEY
    }
    // ...and now we can make the call...
    const body = template
    const resp = await this.client.fire(
      'POST',
      path.join(this.baseRoute, 'templates'),
      { 'x-api-key': this.client.apiKeys.mail },
      undefined,
      body)
    if (resp?.response?.status >= 400) {
      return {
        success: false,
        error: resp?.payload?.error,
      }
    }
    return { success: (resp && !resp.payload?.error), template: resp.payload }
  }

  /*
   * Function to update a template within PostGrid, and there is a different
   * function for creating a template, where you do not have to provide a
   * valid template id... so this is for updates, and the other is for new
   * ones.
   */
  async update(id: string, template: {
    description?: string;
    html: string;
    metadata?: any;
  }): Promise<{
    success: boolean,
    template?: Template,
    error?: PostGridError,
  }> {
    // make sure we have the API Key for this call
    if (!this.client.apiKeys.mail) {
      return NO_MAIL_API_KEY
    }
    // ...and now we can make the call...
    const body = template
    const resp = await this.client.fire(
      'POST',
      path.join(this.baseRoute, 'templates', id),
      { 'x-api-key': this.client.apiKeys.mail },
      undefined,
      body)
    if (resp?.response?.status >= 400) {
      return {
        success: false,
        error: resp?.payload?.error,
      }
    }
    return { success: (resp && !resp.payload?.error), template: resp.payload }
  }

  /*
   * Function to take a Template id and delete that Template from the set
   * at PostGrid. If the template isn't in the system, then we will return
   * the appropriate error.
   */
  async delete(id: string): Promise<{
    success: boolean,
    template?: Template,
    error?: PostGridError,
  }> {
    // make sure we have the API Key for this call
    if (!this.client.apiKeys.mail) {
      return NO_MAIL_API_KEY
    }
    // ...and now we can make the call...
    const resp = await this.client.fire(
      'DELETE',
      path.join(this.baseRoute, 'templates', id),
      { 'x-api-key': this.client.apiKeys.mail },
    )
    if (resp?.response?.status >= 400) {
      return {
        success: false,
        error: resp?.payload?.error,
      }
    }
    return { success: (resp && !resp.payload?.error), template: resp.payload }
  }
}
