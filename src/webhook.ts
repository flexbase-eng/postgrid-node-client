import path from 'path'
import type { PostGrid, PostGridOptions, PostGridError } from './'

export interface Webhook {
  id: string;
  object: string;
  live: boolean;
  url: string;
  description?: string;
  secret: string;
  enabledEvents: string[];
  enabled: boolean;
  metadata?: any;
}

export interface WebhookList {
  object: string;
  limit: number;
  skip: number;
  totalCount: number;
  data: Webhook[];
}

export interface WebhookInvocation {
  id: string;
  object: string;
  webhook: string;
  type: string;
  statusCode: number;
  orderID?: string;
}

export interface WebhookInvocationList {
  object: string;
  limit: number;
  skip: number;
  totalCount: number;
  data: WebhookInvocation[];
}

import { NO_MAIL_API_KEY } from './'

export class WebhookApi {
  client: PostGrid;
  baseRoute: string;

  constructor(client: PostGrid, options?: PostGridOptions) {  // eslint-disable-line no-unused-vars
    this.client = client
    this.baseRoute = 'print-mail/v1/'
  }

  /*
   * Function to take a Webhook id and return the Webhook object in the
   * response. If the webhook isn't in the system, then we will return
   * the appropriate error.
   */
  async get(id: string): Promise<{
    success: boolean,
    webhook?: Webhook,
    error?: PostGridError,
  }> {
    // make sure we have the API Key for this call
    if (!this.client.apiKeys.mail) {
      return NO_MAIL_API_KEY
    }
    // ...and now we can make the call...
    const resp = await this.client.fire(
      'GET',
      path.join(this.baseRoute, 'webhooks', id),
      { 'x-api-key': this.client.apiKeys.mail },
    )
    if (resp?.response?.status >= 400) {
      return {
        success: false,
        error: resp?.payload?.error,
      }
    }
    return { success: (resp && !resp.payload?.error), webhook: resp.payload }
  }

  /*
   * Function to list all the Webhooks registered at PostGrid by this account,
   * and return them in the response. This will be based on the PostGrid
   * 'List' paging scheme - so there's that.
   */
  async list(limit?: number, skip?: number): Promise<{
    success: boolean,
    webhooks?: WebhookList,
    error?: PostGridError,
  }> {
    // make sure we have the API Key for this call
    if (!this.client.apiKeys.mail) {
      return NO_MAIL_API_KEY
    }
    // ...and now we can make the call...
    const resp = await this.client.fire(
      'GET',
      path.join(this.baseRoute, 'webhooks'),
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
      webhooks: resp.payload,
    }
  }

  /*
   * Function to list all the invocations of a specific Webhook by the
   * PostGrid service and return them in the response. This will be based
   * on the PostGrid 'List' paging scheme - so there's that.
   */
  async invocations(id: string, limit?: number, skip?: number): Promise<{
    success: boolean,
    invocations?: WebhookInvocationList,
    error?: PostGridError,
  }> {
    // make sure we have the API Key for this call
    if (!this.client.apiKeys.mail) {
      return NO_MAIL_API_KEY
    }
    // ...and now we can make the call...
    const resp = await this.client.fire(
      'GET',
      path.join(this.baseRoute, 'webhooks', id, 'invocations'),
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
      invocations: resp.payload,
    }
  }

  /*
   * Function to create a webhook within PostGrid, and PostGrid wants to keep
   * the creation separate from the updating, so this is just to make a new
   * one, and the updates are handled in the update() function.
   */
  async create(webhook: {
    url: string;
    description?: string;
    secret?: string;
    enabledEvents: string[];
    enabled?: boolean;
    metadata?: any;
  }): Promise<{
    success: boolean,
    webhook?: Webhook,
    error?: PostGridError,
  }> {
    // make sure we have the API Key for this call
    if (!this.client.apiKeys.mail) {
      return NO_MAIL_API_KEY
    }
    // ...and now we can make the call...
    const body = webhook
    const resp = await this.client.fire(
      'POST',
      path.join(this.baseRoute, 'webhooks'),
      { 'x-api-key': this.client.apiKeys.mail },
      undefined,
      body)
    if (resp?.response?.status >= 400) {
      return {
        success: false,
        error: resp?.payload?.error,
      }
    }
    return { success: (resp && !resp.payload?.error), webhook: resp.payload }
  }

  /*
   * Function to update an existing webhook within PostGrid, and PostGrid
   * wants to keep the creation separate from the updating, so this is just
   * to make changes to an existing one, and the creation is handled in the
   * create() function.
   */
  async update(id: string, webhook: {
    url: string;
    description?: string;
    secret?: string;
    enabledEvents: string[];
    enabled?: boolean;
    metadata?: any;
  }): Promise<{
    success: boolean,
    webhook?: Webhook,
    error?: PostGridError,
  }> {
    // make sure we have the API Key for this call
    if (!this.client.apiKeys.mail) {
      return NO_MAIL_API_KEY
    }
    // ...and now we can make the call...
    const body = webhook
    const resp = await this.client.fire(
      'POST',
      path.join(this.baseRoute, 'webhooks', id),
      { 'x-api-key': this.client.apiKeys.mail },
      undefined,
      body)
    if (resp?.response?.status >= 400) {
      return {
        success: false,
        error: resp?.payload?.error,
      }
    }
    return { success: (resp && !resp.payload?.error), webhook: resp.payload }
  }

  /*
   * Function to take a Webhook id and delete that Webhook from the set
   * at PostGrid. If the webhook isn't in the system, then we will return
   * the appropriate error.
   */
  async delete(id: string): Promise<{
    success: boolean,
    webhook?: Webhook,
    error?: PostGridError,
  }> {
    // make sure we have the API Key for this call
    if (!this.client.apiKeys.mail) {
      return NO_MAIL_API_KEY
    }
    // ...and now we can make the call...
    const resp = await this.client.fire(
      'DELETE',
      path.join(this.baseRoute, 'webhooks', id),
      { 'x-api-key': this.client.apiKeys.mail },
    )
    if (resp?.response?.status >= 400) {
      return {
        success: false,
        error: resp?.payload?.error,
      }
    }
    return { success: (resp && !resp.payload?.error), webhook: resp.payload }
  }
}
