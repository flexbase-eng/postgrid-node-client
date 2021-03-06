import path from 'path'
import type { PostGrid, PostGridOptions, PostGridError } from './'

export interface BankAccount {
  id: string;
  object: string;
  live: boolean;
  description?: string;
  bankName: string;
  bankPrimaryLine?: string;
  bankSecondaryLine?: string;
  bankCountryCode: string;
  transitNumber: string;
  routeNumber: string;
  routingNumber: string;
  accountNumber: string;
  accountNumberLast4: string;
  signatureImage?: Buffer | string;
  signatureText?: string;
  metadata?: any;
}

export interface BankAccountList {
  object: string;
  limit: number;
  skip: number;
  totalCount: number;
  data: BankAccount[];
}

import fs from 'fs'
import FormData from 'form-data'
import { mkError, NO_MAIL_API_KEY } from './'

export class BankAccountApi {
  client: PostGrid;
  baseRoute: string;

  constructor(client: PostGrid, options?: PostGridOptions) {  // eslint-disable-line no-unused-vars
    this.client = client
    this.baseRoute = 'print-mail/v1/'
  }

  /*
   * Function to take a Bank Account id and return the Bank Account object
   * in the response. If the account isn't in the system, then we will return
   * the appropriate error.
   */
  async get(id: string): Promise<{
    success: boolean,
    account?: BankAccount,
    error?: PostGridError,
  }> {
    // make sure we have the API Key for this call
    if (!this.client.apiKeys.mail) {
      return NO_MAIL_API_KEY
    }
    // ...and now we can make the call...
    const resp = await this.client.fire(
      'GET',
      path.join(this.baseRoute, 'bank_accounts', id),
      { 'x-api-key': this.client.apiKeys.mail }
    )
    if (resp?.response?.status >= 400) {
      return {
        success: false,
        error: resp?.payload?.error,
      }
    }
    return { success: (resp && !resp.payload?.error), account: resp.payload }
  }

  /*
   * Function to list all the available Bank Accounts in the PostGrid set
   * and return them in the response. This will be based on the PostGrid
   * 'List' paging scheme - so there's that.
   */
  async list(limit?: number, skip?: number): Promise<{
    success: boolean,
    accounts?: BankAccountList,
    error?: PostGridError,
  }> {
    // make sure we have the API Key for this call
    if (!this.client.apiKeys.mail) {
      return NO_MAIL_API_KEY
    }
    // ...and now we can make the call...
    const resp = await this.client.fire(
      'GET',
      path.join(this.baseRoute, 'bank_accounts'),
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
      accounts: resp.payload,
    }
  }

  /*
   * Function to create a Bank Account within PostGrid, and this will
   * allow for the sugnature text, or signature image - and the latter
   * could be a local file, or it could be a Buffer with the added
   * properties of `name`, `path`, and `contactType` - to make sure it
   * is added to the FormData properly. It's all the same to PostGrid,
   * it's just what you provide to it.
   */
  async create(bankAccount: {
    description?: string;
    bankName: string;
    bankPrimaryLine?: string;
    bankSecondaryLine?: string;
    bankCountryCode: string;
    transitNumber?: string;
    routeNumber?: string;
    routingNumber?: string;
    accountNumber?: string;
    accountNumberLast4?: string;
    signatureImage?: Buffer | string;
    signatureText?: string;
    metadata?: any;
  }): Promise<{
    success: boolean,
    account?: BankAccount,
    error?: PostGridError,
    message?: string,
  }> {
    // make sure we have the API Key for this call
    if (!this.client.apiKeys.mail) {
      return NO_MAIL_API_KEY
    }
    // ...and now we can make the call...
    const form = new FormData()
    for (const [k, v] of Object.entries(bankAccount)) {
      // only add in the entries that have a non-null or defined, value...
      if (v || v === false || v === 0 || v === '') {
        switch (k) {
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
          case 'signatureImage':
            if (typeof v === 'string') {
              // this is supposed to be a file to read and insert...
              form.append(k, fs.createReadStream(v))
            } else if (Buffer.isBuffer(v)) {
              // this Buffer needs: name, path, and contentType to be used...
              form.append(k, v)
            } else {
              return {
                success: false,
                error: mkError(
                  "The provided value of 'signatureImage' could not be understood. " +
                  `The type of the 'signatureImage' value is: '${typeof v}'`
                )
              }
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
      path.join(this.baseRoute, 'bank_accounts'),
      { 'x-api-key': this.client.apiKeys.mail },
      undefined,
      form)
    if (resp?.response?.status >= 400) {
      return {
        success: false,
        error: resp?.payload?.error,
      }
    }
    return { success: (resp && !resp.payload?.error), account: resp.payload }
  }

  /*
   * Function to take a Bank Account id and delete that Bank Account from
   * the set at PostGrid. If the account isn't in the system, then we will
   * return the appropriate error.
   */
  async delete(id: string): Promise<{
    success: boolean,
    account?: BankAccount,
    error?: PostGridError,
  }> {
    // make sure we have the API Key for this call
    if (!this.client.apiKeys.mail) {
      return NO_MAIL_API_KEY
    }
    // ...and now we can make the call...
    const resp = await this.client.fire(
      'DELETE',
      path.join(this.baseRoute, 'bank_accounts', id),
      { 'x-api-key': this.client.apiKeys.mail }
    )
    if (resp?.response?.status >= 400) {
      return {
        success: false,
        error: resp?.payload?.error,
      }
    }
    return { success: (resp && !resp.payload?.error), account: resp.payload }
  }
}
