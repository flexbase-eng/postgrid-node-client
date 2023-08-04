import path from 'path'
import type { PostGrid, PostGridOptions, PostGridError } from './'
import type { Contact } from './contact'

export interface Postcard {
  id: string;
  object: string;
  live: boolean;
  description?: string;
  sendDate: Date;
  size: string;
  to: Contact;
  from?: Contact;
  frontHTML?: string;
  backHTML?: string;
  frontTemplate?: string;
  backTemplate?: string;
  uploadedPDF?: string;
  url?: string;
  mergeVariables?: any;
  metadata?: any;
}

export interface PostcardList {
  object: string;
  limit: number;
  skip: number;
  totalCount: number;
  data: Postcard[];
}

import FormData from 'form-data'
import { NO_MAIL_API_KEY } from './'

export class PostcardApi {
  client: PostGrid;
  baseRoute: string;

  constructor(client: PostGrid, options?: PostGridOptions) {  // eslint-disable-line no-unused-vars
    this.client = client
    this.baseRoute = 'print-mail/v1/'
  }

  /*
   * Function to take a Postcard id and return the Postcard object in the
   * response. If the postcard isn't in the system, then we will return
   * the appropriate error.
   */
  async get(id: string): Promise<{
    success: boolean,
    postcard?: Postcard,
    error?: PostGridError,
  }> {
    // make sure we have the API Key for this call
    if (!this.client.apiKeys.mail) {
      return NO_MAIL_API_KEY
    }
    // ...and now we can make the call...
    const resp = await this.client.fire(
      'GET',
      path.join(this.baseRoute, 'postcards', id),
      { 'x-api-key': this.client.apiKeys.mail },
    )
    if (resp?.response?.status >= 400) {
      return {
        success: false,
        error: resp?.payload?.error,
      }
    }
    return { success: (resp && !resp.payload?.error), postcard: resp.payload }
  }

  /*
   * Function to list all the available Postcards in the PostGrid set and
   * return them in the response. This will be based on the PostGrid 'List'
   * paging scheme - so there's that.
   */
  async list(limit?: number, skip?: number): Promise<{
    success: boolean,
    postcards?: PostcardList,
    error?: PostGridError,
  }> {
    // make sure we have the API Key for this call
    if (!this.client.apiKeys.mail) {
      return NO_MAIL_API_KEY
    }
    // ...and now we can make the call...
    const resp = await this.client.fire(
      'GET',
      path.join(this.baseRoute, 'postcards'),
      { 'x-api-key': this.client.apiKeys.mail },
      { skip: skip || 0, limit: limit || 40 },
    )
    if (resp?.response?.status >= 400) {
      return {
        success: false,
        error: resp?.payload?.error,
      }
    }
    return { success: (resp && !resp.payload?.error), postcards: resp.payload }
  }

  /*
   * Function to create a Postcard within PostGrid, and this will allow for
   * the use of inline HTML, or a Template, or a PDF, or a URL for a PDF.
   * It's all the same to PostGrid, it's just what you provide to it.
   */
  async create(postcard: {
    description?: string;
    sendDate?: Date | string;
    size: string;
    to: Partial<Contact> | string;
    from?: Partial<Contact> | string;
    frontHTML?: string;
    backHTML?: string;
    frontTemplate?: string;
    backTemplate?: string;
    pdf?: Buffer | string;
    url?: string;
    mergeVariables?: any;
    metadata?: any;
    express?: boolean;
  }, options?: {
    idempotencyKey?: string;
  }): Promise<{
    success: boolean,
    postcard?: Postcard,
    error?: PostGridError,
    message?: string,
  }> {
    // make sure we have the API Key for this call
    if (!this.client.apiKeys.mail) {
      return NO_MAIL_API_KEY
    }
    // ...and now we can make the call...
    let body = postcard
    if (Buffer.isBuffer(postcard.pdf)) {
      const form = new FormData()
      for (const [k, v] of Object.entries(postcard)) {
        // only add in the entries that have a non-null or defined, value...
        if (v || v === false || v === 0 || v === '') {
          switch (k) {
            case 'to':
            case 'from':
            case 'mergeVariables':
            case 'metadata':
              if (typeof v === 'object') {
                Object.entries(v).forEach(([sk, sv]) => {
                  if (sv || sv === false || sv === 0 || sv === '') {
                    form.append(`${k}[${sk}]`, sv)
                  }
                })
              } else {
                form.append(k, v.toString())
              }
              break
            case 'pdf':
              form.append(k, postcard.pdf, 'upload-content.pdf')
              break
            case 'sendDate':
              if (Object.prototype.toString.call(v) === '[object Date]') {
                form.append(k, v.toISOString())
              } else {
                form.append(k, v.toString())
              }
              break
            default:
              form.append(k, v.toString())
              break
          }
        }
      }
      // ...and this is what is sent to PostGrid
      body = form as any
    }
    // now build up the headers - including the optional idempotencyKey
    let headers = { 'x-api-key': this.client.apiKeys.mail } as any
    if (options?.idempotencyKey) {
      headers['Idempotency-Key'] = options!.idempotencyKey
    }
    const resp = await this.client.fire(
      'POST',
      path.join(this.baseRoute, 'postcards'),
      headers,
      undefined,
      body)
    if (resp?.response?.status >= 400) {
      return {
        success: false,
        error: resp?.payload?.error,
      }
    }
    return { success: (resp && !resp.payload?.error), postcard: resp.payload }
  }

  /*
   * Function to progress a Test Postcard - but only a Test Postcard, to it's
   * next state. This can be used to test the webhooks to make sure all the
   * messages are making it back correctly.
   */
  async progress(id: string): Promise<{
    success: boolean,
    postcard?: Postcard,
    error?: PostGridError,
  }> {
    // make sure we have the API Key for this call
    if (!this.client.apiKeys.mail) {
      return NO_MAIL_API_KEY
    }
    // ...and now we can make the call...
    const resp = await this.client.fire(
      'POST',
      path.join(this.baseRoute, 'postcards', id, 'progressions'),
      { 'x-api-key': this.client.apiKeys.mail },
    )
    if (resp?.response?.status >= 400) {
      return {
        success: false,
        error: resp?.payload?.error,
      }
    }
    return { success: (resp && !resp.payload?.error), postcard: resp.payload }
  }

  /*
   * Function to take a Postcard id and delete that Postcard from the set
   * at PostGrid. If the postcard isn't in the system, then we will return
   * the appropriate error.
   */
  async delete(id: string): Promise<{
    success: boolean,
    postcard?: Postcard,
    error?: PostGridError,
  }> {
    // make sure we have the API Key for this call
    if (!this.client.apiKeys.mail) {
      return NO_MAIL_API_KEY
    }
    // ...and now we can make the call...
    const resp = await this.client.fire(
      'DELETE',
      path.join(this.baseRoute, 'postcards', id),
      { 'x-api-key': this.client.apiKeys.mail },
    )
    if (resp?.response?.status >= 400) {
      return {
        success: false,
        error: resp?.payload?.error,
      }
    }
    return { success: (resp && !resp.payload?.error), postcard: resp.payload }
  }
}
