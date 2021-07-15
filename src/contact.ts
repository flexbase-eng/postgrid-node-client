import type { PostGrid, PostGridOptions, PostGridError } from './'

export interface Contact {
  id: string;
  object: string;
  live: boolean;
  description?: string;
  addressLine1?: string;
  addressLine2?: string;
  provinceOrState?: string;
  postalOrZip?: string;
  country?: string;
  countryCode?: string;
  addressStatus: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  companyName?: string;
  jobTitle?: string;
  metadata?: any;
}

export interface ContactList {
  object: string;
  limit: number;
  skip: number;
  totalCount: number;
  data: Contact[];
}

export class ContactApi {
  client: PostGrid;

  constructor(client: PostGrid, options?: PostGridOptions) {  // eslint-disable-line no-unused-vars
    this.client = client
  }

  /*
   * Function to take a Contact id and return the Contact object in the
   * response. If the contact isn't in the system, then we will return
   * the appropriate error.
   */
  async get(id: string): Promise<{
    success: boolean,
    contact?: Contact,
    errors?: string[] | PostGridError,
  }> {
    const resp = await this.client.fire(
      'GET',
      `contacts/${id}`
    )
    if (resp?.response?.status === 404) {
      return {
        success: false,
        errors: resp?.payload?.error,
      }
    }
    return { success: (resp && !resp.payload?.error), contact: resp.payload }
  }

  /*
   * Function to list all the available Contacts in the PostGrid set and
   * return them in the response. This will be based on the PostGrid 'List'
   * paging scheme - so there's that.
   */
  async list(limit?: number, skip?: number): Promise<{
    success: boolean,
    contacts?: ContactList,
    errors?: string[] | PostGridError,
  }> {
    const resp = await this.client.fire(
      'GET',
      'contacts',
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
      contacts: resp.payload,
    }
  }

  /*
   * Function to create/update a contact within PostGrid, and PostGrid says
   * that if this information is identical to another Contact, they will simply
   * update the description of the existing contact, and return it.
   */
  async create(contact: {
    description?: string;
    addressLine1?: string;
    addressLine2?: string;
    provinceOrState?: string;
    postalOrZip?: string;
    country?: string;
    countryCode?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    companyName?: string;
    jobTitle?: string;
    metadata?: any;
  }): Promise<{
    success: boolean,
    contact?: Contact,
    errors?: string[] | PostGridError,
  }> {
    const body = contact
    const resp = await this.client.fire(
      'POST',
      `contacts`,
      undefined,
      body)
    if (resp?.response?.status === 422) {
      return {
        success: false,
        errors: resp?.payload?.error,
      }
    }
    return { success: (resp && !resp.payload?.error), contact: resp.payload }
  }

  /*
   * Function to take a Contact id and delete that Contact from the set
   * at PostGrid. If the contact isn't in the system, then we will return
   * the appropriate error.
   */
  async delete(id: string): Promise<{
    success: boolean,
    contact?: Contact,
    errors?: string[] | PostGridError,
  }> {
    const resp = await this.client.fire(
      'DELETE',
      `contacts/${id}`
    )
    if (resp?.response?.status === 404) {
      return {
        success: false,
        errors: resp?.payload?.error,
      }
    }
    return { success: (resp && !resp.payload?.error), contact: resp.payload }
  }
}
