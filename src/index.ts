import fetch from 'node-fetch'
import FormData = require('formdata')
import path from 'path'
import camelCaseKeys from 'camelcase-keys'

import { ContactApi } from './contact'
import { TemplateApi } from './template'
import { LetterApi } from './letter'
import { WebhookApi } from './webhook'

const ClientVersion = require('../package.json').version
const PROTOCOL = 'https'
const POSTGRID_HOST = 'api.postgrid.com/print-mail/v1/'

/*
 * These are the acceptable options to the creation of the Client:
 *
 *   {
 *     webhookUrl: "https://my.service.com/postgrid/webhook"
 *   }
 *
 * and the construction of the Client will set the webhook to this URL
 * regardless of it's previous value.
 */
export interface PostGridOptions {
  host?: string;
  apiKey?: string;
  webhookUrl?: string;
  webhookSecret?: string;
  webhookEvents?: string[];
}

/*
 * These are the standard error objects from PostGrid - and will be returned
 * from PostGrid for any bad condition. We will allow these - as well as just
 * strings in the errors being returned from the calls.
 */
export interface PostGridError {
  type: string;
  message: string;
}

/*
 * This is the main constructor of the PostGrid Client, and will be called
 * with something like:
 *
 *   import { PostGrid } from "postgrid-node-client"
 */
export class PostGrid {
  host: string
  apiKey: string
  webhookUrl?: string
  webhookSecret?: string
  webhookEvents?: string[]
  contact: ContactApi
  template: TemplateApi
  letter: LetterApi
  webhook: WebhookApi

  constructor (apiKey: string, options?: PostGridOptions) {
    this.host = options?.host || POSTGRID_HOST
    this.apiKey = apiKey
    this.webhookUrl = options?.webhookUrl
    this.webhookSecret = options?.webhookSecret
    this.webhookEvents = options?.webhookEvents
    // now construct all the specific domain objects
    this.contact = new ContactApi(this, options)
    this.template = new TemplateApi(this, options)
    this.letter = new LetterApi(this, options)
    this.webhook = new WebhookApi(this, options)

    // if we have a webhook, then create that now
    if (this.webhookUrl) {
      this.webhook.create({
        url: this.webhookUrl,
        secret: this.webhookSecret,
        enabledEvents: this.webhookEvents!,
      })
    }
  }

  /*
   * Function to fire off a GET, PUT, POST, (method) to the uri, preceeded
   * by the host, with the optional query params, and optional body, and
   * puts the 'apiKey' into the headers for the call, and fires off the call
   * to the PostGrid host and returns the response.
   */
  async fire(
    method: string,
    uri: string,
    query?: { [index:string] : number | string },
    body?: object | object[] | FormData,
  ): Promise<{ response: any, payload?: any }> {
    // build up the complete url from the provided 'uri' and the 'host'
    let url = new URL(PROTOCOL+'://'+path.join(this.host, uri))
    if (query) {
      Object.keys(query).forEach(k =>
        url.searchParams.append(k, query[k].toString()))
    }
    const isForm = isFormData(body)
    // make the appropriate headers
    let headers = {
      Accept: 'application/json',
      'x-api-key': this.apiKey,
      'X-PostGrid-Client-Ver': ClientVersion,
    } as any
    if (!isForm) {
      headers = { ...headers, 'Content-Type': 'application/json' }
    }
    // now we can make the call... see if it's a JSON body or a FormData one...
    const response = await fetch(url, {
      method: method,
      body: isForm ? (body as any) : (body ? JSON.stringify(body) : undefined),
      headers,
    })
    try {
      const payload = camelCaseKeys((await response.json()), {deep: true})
      return { response, payload }
    } catch (err) {
      return { response }
    }
  }
}

/*
 * Simple predicate function to return 'true' if the argument is a FormData
 * object - as that is one of the possible values of the 'body' in the fire()
 * function. We have to handle that differently on the call than when it's
 * a more traditional JSON object body.
 */
function isFormData(arg: any): boolean {
  let ans = false
  if (arg && typeof arg === 'object') {
    ans = (typeof arg._boundary === 'string' &&
           arg._boundary.length > 20 &&
           Array.isArray(arg._streams))
  }
  return ans
}
