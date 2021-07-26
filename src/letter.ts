import type { PostGrid, PostGridOptions, PostGridError } from './'
import type { Contact } from './contact'

export interface Letter {
  id: string;
  object: string;
  live: boolean;
  description?: string;
  sendDate: Date;
  to: Contact;
  from: Contact;
  html?: string;
  template?: string;
  uploadedPDF?: string;
  addressPlacement: string;
  color: boolean;
  doubleSided: boolean;
  url?: string;
  pageCount?: number
  mergeVariables?: any;
  metadata?: any;
}

export interface LetterList {
  object: string;
  limit: number;
  skip: number;
  totalCount: number;
  data: Letter[];
}

import FormData from 'form-data'

export class LetterApi {
  client: PostGrid;

  constructor(client: PostGrid, options?: PostGridOptions) {  // eslint-disable-line no-unused-vars
    this.client = client
  }

  /*
   * Function to take a Letter id and return the Letter object in the
   * response. If the letter isn't in the system, then we will return
   * the appropriate error.
   */
  async get(id: string): Promise<{
    success: boolean,
    letter?: Letter,
    errors?: PostGridError,
  }> {
    const resp = await this.client.fire(
      'GET',
      `letters/${id}`
    )
    if (resp?.response?.status >= 400) {
      return {
        success: false,
        errors: resp?.payload?.error,
      }
    }
    return { success: (resp && !resp.payload?.error), letter: resp.payload }
  }

  /*
   * Function to list all the available Letters in the PostGrid set and
   * return them in the response. This will be based on the PostGrid 'List'
   * paging scheme - so there's that.
   */
  async list(limit?: number, skip?: number): Promise<{
    success: boolean,
    letters?: LetterList,
    errors?: PostGridError,
  }> {
    const resp = await this.client.fire(
      'GET',
      'letters',
      { skip: skip || 0, limit: limit || 40 },
    )
    if (resp?.response?.status >= 400) {
      return {
        success: false,
        errors: resp?.payload?.error,
      }
    }
    return {
      success: (resp && !resp.payload?.error),
      letters: resp.payload,
    }
  }

  /*
   * Function to create a Letter within PostGrid, and this will allow for
   * the use of inline HTML, or a Template, or a PDF, or a URL for a PDF.
   * It's all the same to PostGrid, it's just what you provide to it.
   */
  async create(letter: {
    description?: string;
    sendDate?: Date | string;
    to: Partial<Contact> | string;
    from: Partial<Contact> | string;
    html?: string;
    template?: string;
    uploadedPDF?: string;
    addressPlacement?: string;
    color?: boolean;
    doubleSided?: boolean;
    pdf?: Buffer | string;
    url?: string;
    pageCount?: number
    mergeVariables?: any;
    metadata?: any;
  }): Promise<{
    success: boolean,
    letter?: Letter,
    errors?: PostGridError,
    message?: string,
  }> {
    // set some reasonable defaults on the letter
    letter.color = letter.color || false
    letter.doubleSided = letter.doubleSided || false
    letter.addressPlacement = letter.addressPlacement || 'insert_blank_page'
    let body = letter
    if (Buffer.isBuffer(letter.pdf)) {
      const form = new FormData()
      for (const [k, v] of Object.entries(letter)) {
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
              form.append(k, letter.pdf, 'upload-content.pdf')
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
    const resp = await this.client.fire(
      'POST',
      'letters',
      undefined,
      body)
    if (resp?.response?.status >= 400) {
      return {
        success: false,
        errors: resp?.payload?.error,
      }
    }
    return { success: (resp && !resp.payload?.error), letter: resp.payload }
  }

  /*
   * Function to progress a Test Letter - but only a Test Letter, to it's
   * next state. This can be used to test the webhooks to make sure all the
   * messages are making it back correctly.
   */
  async progress(id: string): Promise<{
    success: boolean,
    letter?: Letter,
    errors?: PostGridError,
  }> {
    const resp = await this.client.fire(
      'POST',
      `letters/${id}/progressions`,
    )
    if (resp?.response?.status >= 400) {
      return {
        success: false,
        errors: resp?.payload?.error,
      }
    }
    return { success: (resp && !resp.payload?.error), letter: resp.payload }
  }

  /*
   * Function to take a Letter id and delete that Letter from the set
   * at PostGrid. If the letter isn't in the system, then we will return
   * the appropriate error.
   */
  async delete(id: string): Promise<{
    success: boolean,
    letter?: Letter,
    errors?: PostGridError,
  }> {
    const resp = await this.client.fire(
      'DELETE',
      `letters/${id}`
    )
    if (resp?.response?.status >= 400) {
      return {
        success: false,
        errors: resp?.payload?.error,
      }
    }
    return { success: (resp && !resp.payload?.error), letter: resp.payload }
  }
}
