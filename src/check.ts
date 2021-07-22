import type { PostGrid, PostGridOptions, PostGridError } from './'
import type { Contact } from './contact'

export interface Check {
  id: string;
  object: string;
  live: boolean;
  description?: string;
  sendDate: Date;
  to: Contact;
  from: Contact;
  url?: string;
  bankAccount: string;
  currencyCode: string
  amount: number;
  memo?: string;
  logo?: string
  number: number;
  message?: string
  letterHTML?: string;
  letterTemplate?: string;
  letterUploadedPDF?: string;
  mergeVariables?: any;
  metadata?: any;
}

export interface CheckList {
  object: string;
  limit: number;
  skip: number;
  totalCount: number;
  data: Check[];
}

import FormData from 'form-data'

export class CheckApi {
  client: PostGrid;

  constructor(client: PostGrid, options?: PostGridOptions) {  // eslint-disable-line no-unused-vars
    this.client = client
  }

  /*
   * Function to take a Check id and return the Check object in the
   * response. If the check isn't in the system, then we will return
   * the appropriate error.
   */
  async get(id: string): Promise<{
    success: boolean,
    check?: Check,
    errors?: string[] | PostGridError,
  }> {
    const resp = await this.client.fire(
      'GET',
      `cheques/${id}`
    )
    if (resp?.response?.status === 404) {
      return {
        success: false,
        errors: resp?.payload?.error,
      }
    }
    return { success: (resp && !resp.payload?.error), check: resp.payload }
  }

  /*
   * Function to list all the available Checks in the PostGrid set and
   * return them in the response. This will be based on the PostGrid 'List'
   * paging scheme - so there's that.
   */
  async list(limit?: number, skip?: number): Promise<{
    success: boolean,
    checks?: CheckList,
    errors?: string[] | PostGridError,
  }> {
    const resp = await this.client.fire(
      'GET',
      'cheques',
      { skip: skip || 0, limit: limit || 40 },
    )
    if (resp?.response?.status === 404) {
      return {
        success: false,
        errors: resp?.payload?.error,
      }
    }
    return {
      success: (resp && !resp.payload?.error),
      checks: resp.payload,
    }
  }

  /*
   * Function to create a Check within PostGrid, and this will allow for
   * the use of inline HTML, or a Template, or a PDF, or a URL for a PDF.
   * It's all the same to PostGrid, it's just what you provide to it.
   */
  async create(check: {
    description?: string;
    sendDate?: Date | string;
    to: Partial<Contact> | string;
    from: Partial<Contact> | string;
    bankAccount: string;
    currencyCode?: string
    amount: number;
    memo?: string;
    logo?: string
    number?: number;
    message?: string;
    letterHTML?: string;
    letterTemplate?: string;
    letterPDF?: Buffer | string;
    mergeVariables?: any;
    metadata?: any;
  }): Promise<{
    success: boolean,
    check?: Check,
    errors?: string[] | PostGridError,
    message?: string,
  }> {
    const form = new FormData()
    for (const [k, v] of Object.entries(check)) {
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
          case 'letterPDF':
            form.append(k, v, 'upload-content.pdf')
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
    const resp = await this.client.fire(
      'POST',
      'cheques',
      undefined,
      form)
    if (resp?.response?.status === 422) {
      return {
        success: false,
        errors: resp?.payload?.error,
      }
    }
    return { success: (resp && !resp.payload?.error), check: resp.payload }
  }

  /*
   * Function to progress a Test Check - but only a Test Check, to it's
   * next state. This can be used to test the webhooks to make sure all the
   * messages are making it back correctly.
   */
  async progress(id: string): Promise<{
    success: boolean,
    check?: Check,
    errors?: string[] | PostGridError,
  }> {
    const resp = await this.client.fire(
      'POST',
      `cheques/${id}/progressions`,
    )
    if (resp?.response?.status === 404) {
      return {
        success: false,
        errors: resp?.payload?.error,
      }
    }
    return { success: (resp && !resp.payload?.error), check: resp.payload }
  }

  /*
   * Function to take a Check id and delete that Check from the set
   * at PostGrid. If the check isn't in the system, then we will return
   * the appropriate error.
   */
  async delete(id: string): Promise<{
    success: boolean,
    check?: Check,
    errors?: string[] | PostGridError,
  }> {
    const resp = await this.client.fire(
      'DELETE',
      `cheques/${id}`
    )
    if (resp?.response?.status === 404) {
      return {
        success: false,
        errors: resp?.payload?.error,
      }
    }
    return { success: (resp && !resp.payload?.error), check: resp.payload }
  }
}
