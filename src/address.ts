import path from 'path'
import type { PostGrid, PostGridOptions, PostGridError } from './'

export interface Address {
  recipient?: string;
  line1: string;
  line2?: string;
  city?: string;
  provinceOrState?: string;
  postalOrZip?: string;
  zipPlus4?: string;
  firmName?: string;
  country?: string;
  countryName?: string;
  status?: string;
}

export interface LookupInfo {
  used: number;
  freeLimit: number;
}

export interface CityState {
  city: string;
  provinceOrState: string;
  country?: string;
}

import { mkError } from './'

export class AddressApi {
  client: PostGrid;
  baseRoute: string;

  constructor(client: PostGrid, options?: PostGridOptions) {  // eslint-disable-line no-unused-vars
    this.client = client
    this.baseRoute = 'v1/addver'
  }

  /*
   * Function to ask the PostGrid Address Verification service what the counts
   * are on the free lookups, and how many have been used to this point on this
   * API Key. This is a simple call to get useful data to make sure things are
   * working well.
   */
  async lookupInfo(): Promise<{
    success: boolean,
    info?: {
      status: string;
      message: string;
      data: LookupInfo;
    },
    error?: PostGridError,
  }> {
    // make sure we have the API Key for this call
    if (!this.client.apiKeys.addr) {
      return { success: false, error: mkError('Missing PostGrid Address API Key!') }
    }
    // ... now we can make the call...
    const resp = await this.client.fire(
      'GET',
      this.baseRoute,
      { 'x-api-key': this.client.apiKeys.addr },
    )
    if (resp?.response?.status >= 400) {
      return { success: false, error: resp?.payload?.error }
    }
    return {
      success: (resp && !resp.payload?.error),
      info: resp.payload,
    }
  }

  /*
   * Function to take a freeform address of the form:
   *
   *   '3288 Tara Ln, Indianapolis, IN 46224'
   *
   * or a structured address of the form:
   *
   *   {
   *     line1: '3288 Tara Ln',
   *     city: 'Indianapolis',
   *     postalOrZip: '46224',
   *     provinceOrState: 'IN',
   *   }
   *
   * and validate it with the service, and return the Address - if it validates.
   */
  async verify(address: string | Partial<Address>): Promise<{
    success: boolean,
    verified: boolean,
    address?: {
      status: string;
      message: string;
      data: Address;
    },
    error?: PostGridError,
  }> {
    // make sure we have the API Key for this call
    if (!this.client.apiKeys.addr) {
      return {
        success: false,
        verified: false,
        error: mkError('Missing PostGrid Address API Key!'),
      }
    }
    // ... now we can make the call...
    const resp = await this.client.fire(
      'POST',
      path.join(this.baseRoute, 'verifications'),
      { 'x-api-key': this.client.apiKeys.addr },
      { properCase: true },
      { address }
    )
    if (resp?.response?.status >= 400) {
      return {
        success: false,
        verified: false,
        error: resp?.payload?.error,
      }
    }
    return {
      success: (resp && !resp.payload?.error),
      verified: (resp && ['verified', 'corrected'].includes(resp.payload?.data?.status)),
      address: resp.payload,
    }
  }

  /*
   * Function to look for possible autocomplete matches for the provided
   * street and country - defaulting to the 'US'. This will return something
   * like:
   *
   *   {
   *     success: true,
   *     previews: {
   *       status: 'success',
   *       message: 'Retrieved verified address completions successfully.',
   *       data: [
   *         { line1: '77 N MAIN ST', city: undefined, provinceOrState: 'UT' },
   *         { line1: '77 S MAIN ST', city: undefined, provinceOrState: 'UT' },
   *         { line1: '77 N MAIN ST', city: undefined, provinceOrState: 'UT' },
   *         { line1: '77 S MAIN ST', city: undefined, provinceOrState: 'UT' },
   *         { line1: '77 E MAIN ST', city: undefined, provinceOrState: 'UT' },
   *         { line1: '77 W MAIN ST', city: undefined, provinceOrState: 'UT' },
   *         { line1: '77 N MAIN ST', city: 'ABERDEEN', provinceOrState: 'ID' },
   *         { line1: '77 S MAIN ST', city: 'ABERDEEN', provinceOrState: 'ID' },
   *         { line1: '77 N MAIN ST', city: 'ABERDEEN', provinceOrState: 'SD' },
   *         { line1: '77 S MAIN ST', city: 'ABERDEEN', provinceOrState: 'SD' }
   *       ]
   *     }
   *   }
   *
   * with the street argument of: '77 main st'.
   */
  async autocompletePreviews(street: string, country?: string): Promise<{
    success: boolean,
    previews?: {
      status: string;
      message: string;
      data: Partial<Address>[];
    },
    error?: PostGridError,
  }> {
    // make sure we have the API Key for this call
    if (!this.client.apiKeys.addr) {
      return { success: false, error: mkError('Missing PostGrid Address API Key!') }
    }
    // ... now we can make the call...
    const resp = await this.client.fire(
      'GET',
      path.join(this.baseRoute, 'completions'),
      { 'x-api-key': this.client.apiKeys.addr },
      {
        properCase: true,
        partialStreet: street,
        countryFilter: country || 'US',
        provInsteadOfPC: true,
      },
    )
    if (resp?.response?.status >= 400) {
      return { success: false, error: resp?.payload?.error }
    }
    // map the data to look like Address records for consistency...
    if (Array.isArray(resp.payload.data)) {
      resp.payload.data = resp.payload.data
        .map((p: any) => p.preview)
        .map((p: any) => {
          return { line1: p.address, city: p.city, provinceOrState: p.prov }
        })
    }
    return {
      success: (resp && !resp.payload?.error),
      previews: resp.payload,
    }
  }

  /*
   * Function to take something like an address preview, above:
   *
   *   {
   *     line1: '77 N MAIN ST',
   *     city: 'ABERDEEN',
   *     provinceOrState: 'ID'
   *   }
   *
   * and do the complete address validation and completion on it returning
   * something like:
   *
   *   {
   *     success: true,
   *     previews: {
   *       status: 'success',
   *       message: 'Retrieved verified address completions successfully.',
   *       data: [
   *         {
   *           line1: '77 S MAIN ST',
   *           city: 'ABERDEEN',
   *           provinceOrState: 'SD',
   *           postalOrZip: '57401',
   *           country: 'US'
   *         }
   *       ]
   *     }
   *   }
   */
  async autocompleteAddress(address: Partial<Address>): Promise<{
    success: boolean,
    addresses?: {
      status: string;
      message: string;
      data: Address[];
    },
    error?: PostGridError,
  }> {
    // make sure we have the API Key for this call
    if (!this.client.apiKeys.addr) {
      return { success: false, error: mkError('Missing PostGrid Address API Key!') }
    }
    // ... now we can make the call...
    const resp = await this.client.fire(
      'POST',
      path.join(this.baseRoute, 'completions'),
      { 'x-api-key': this.client.apiKeys.addr },
      { properCase: true },
      {
        partialStreet: address.line1,
        cityFilter: address.city,
        stateFilter: address.provinceOrState,
        pcFilter: address.postalOrZip,
        countryFilter: address.country || 'US',
      },
    )
    if (resp?.response?.status >= 400) {
      return { success: false, error: resp?.payload?.error }
    }
    // map the data to look like Address records for consistency...
    if (Array.isArray(resp.payload.data)) {
      resp.payload.data = resp.payload.data
        .map((p: any) => p.address)
        .map((p: any) => {
          return {
            line1: p.address,
            city: p.city,
            provinceOrState: p.prov,
            postalOrZip: p.pc,
            country: p.country,
          }
        })
    }
    return {
      success: (resp && !resp.payload?.error),
      addresses: resp.payload,
    }
  }

  /*
   * Function to take a batch of up to 2000 freeform or structured addresses
   * and return each one verified - or not - and complete. The output will
   * look something like this:
   *
   *   {
   *     success: true,
   *     addresses: {
   *       status: 'success',
   *       message: 'Verified address batch successfully.',
   *       data: [
   *         {
   *           line1: '3288 Tara Ln',
   *           city: 'Indianapolis',
   *           postalOrZip: '46224',
   *           provinceOrState: 'IN',
   *           country: 'us',
   *           countryName: 'UNITED STATES',
   *           zipPlus4: '2231',
   *           status: 'verified',
   *           errors: {}
   *         },
   *         {
   *           line1: '3000 Tara Ln  ',
   *           city: 'Indianapolis',
   *           postalOrZip: '46224',
   *           provinceOrState: 'in',
   *           status: 'failed',
   *           errors: {}
   *         },
   *         {
   *           line1: '77 S Main St',
   *           city: 'Aberdeen',
   *           postalOrZip: '57401',
   *           provinceOrState: 'SD',
   *           country: 'us',
   *           countryName: 'UNITED STATES',
   *           zipPlus4: '4218',
   *           status: 'verified',
   *           errors: {}
   *         }
   *       ]
   *     }
   *   }
   */
  async batchVerify(addresses: (string | Partial<Address>)[]): Promise<{
    success: boolean,
    addresses?: {
      status: string;
      message: string;
      data: Address[];
    },
    error?: PostGridError,
  }> {
    // make sure we have the API Key for this call
    if (!this.client.apiKeys.addr) {
      return { success: false, error: mkError('Missing PostGrid Address API Key!') }
    }
    // ... now we can make the call...
    const resp = await this.client.fire(
      'POST',
      path.join(this.baseRoute, 'verifications/batch'),
      { 'x-api-key': this.client.apiKeys.addr },
      { properCase: true },
      { addresses },
    )
    if (resp?.response?.status >= 400) {
      return { success: false, error: resp?.payload?.error }
    }
    // map the data to look like Address records for consistency...
    if (Array.isArray(resp.payload.data.results)) {
      resp.payload.data = resp.payload.data.results
        .map((p: any) => p.verifiedAddress)
    }
    return {
      success: (resp && !resp.payload?.error),
      addresses: resp.payload,
    }
  }

  /*
   * Function to take a _guess_ at a freeform or structured address, and
   * pull back all the suggestions for the correct address that could be
   * returned. This will look at different parts of the address in order
   * to "find" the actual address you're looking for. The result will be
   * something like:
   *
   *   {
   *     success: true,
   *     addresses: {
   *       status: 'success',
   *       message: 'Address suggestions retrieved successfully.',
   *       data: [
   *         {
   *           city: 'Aberdeen',
   *           country: 'us',
   *           countryName: 'UNITED STATES',
   *           errors: {},
   *           line1: '77 N Main St',
   *           postalOrZip: '57401',
   *           provinceOrState: 'SD',
   *           status: 'verified',
   *           zipPlus4: '3428'
   *         },
   *         {
   *           city: 'Aberdeen',
   *           country: 'us',
   *           countryName: 'UNITED STATES',
   *           errors: {},
   *           line1: '77 S Main St',
   *           postalOrZip: '57401',
   *           provinceOrState: 'SD',
   *           status: 'verified',
   *           zipPlus4: '4218'
   *         },
   *         ...
   *       },
   *     ]
   *   }
   */
  async suggestAddresses(address: string | Partial<Address>): Promise<{
    success: boolean,
    addresses?: {
      status: string;
      message: string;
      data: any;
    },
    error?: PostGridError,
  }> {
    // make sure we have the API Key for this call
    if (!this.client.apiKeys.addr) {
      return { success: false, error: mkError('Missing PostGrid Address API Key!') }
    }
    // ... now we can make the call...
    const resp = await this.client.fire(
      'POST',
      path.join(this.baseRoute, 'suggestions'),
      { 'x-api-key': this.client.apiKeys.addr },
      { properCase: true },
      { address },
    )
    if (resp?.response?.status >= 400) {
      return { success: false, error: resp?.payload?.error }
    }
    return {
      success: (resp && !resp.payload?.error),
      addresses: resp.payload,
    }
  }

  /*
   * Function to take a freeform address and parse it into all the components
   * that PostGrid recognizes. If the address argument is:
   *
   *   '3288 Tara Ln, Indianapolis, IN 46224'
   *
   * then the result will be:
   *
   *   {
   *     success: true,
   *     address: {
   *       status: 'success',
   *       message: 'Success.',
   *       data: {
   *         city: 'indianapolis',
   *         houseNumber: '3288',
   *         postcode: '46224',
   *         road: 'tara ln',
   *         state: 'in'
   *       }
   *     }
   *   }
   */
  async parseAddress(address: string): Promise<{
    success: boolean,
    address?: {
      status: string;
      message: string;
      data: any;
    },
    error?: PostGridError,
  }> {
    // make sure we have the API Key for this call
    if (!this.client.apiKeys.addr) {
      return { success: false, error: mkError('Missing PostGrid Address API Key!') }
    }
    // ... now we can make the call...
    const resp = await this.client.fire(
      'POST',
      path.join(this.baseRoute, 'parses'),
      { 'x-api-key': this.client.apiKeys.addr },
      { properCase: true },
      { address },
    )
    if (resp?.response?.status >= 400) {
      return { success: false, error: resp?.payload?.error }
    }
    return {
      success: (resp && !resp.payload?.error),
      address: resp.payload,
    }
  }

  /*
   * Function to take a freeform address and parse it into all the components
   * that PostGrid recognizes. If the address argument is:
   *
   *   '60540'
   *
   * then the result will be:
   *
   *   {
   *     success: true,
   *     address: {
   *       status: 'success',
   *       message: 'Success.',
   *       data: {
   *         city: 'NAPERVILLE',
   *         provinceOrState: 'IL'
   *       }
   *     }
   *   }
   */
  async lookupCityState(postalCode: string): Promise<{
    success: boolean,
    address?: {
      status: string;
      message: string;
      data: CityState;
    },
    error?: PostGridError,
  }> {
    // make sure we have the API Key for this call
    if (!this.client.apiKeys.addr) {
      return { success: false, error: mkError('Missing PostGrid Address API Key!') }
    }
    // ... now we can make the call...
    const resp = await this.client.fire(
      'POST',
      path.join(this.baseRoute, 'city_states'),
      { 'x-api-key': this.client.apiKeys.addr },
      { properCase: true },
      { postalOrZip: postalCode },
    )
    if (resp?.response?.status >= 400) {
      return { success: false, error: resp?.payload?.error }
    }
    return {
      success: (resp && !resp.payload?.error),
      address: resp.payload,
    }
  }
}
