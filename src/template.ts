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

export class TemplateApi {
  client: PostGrid;

  constructor(client: PostGrid, options?: PostGridOptions) {  // eslint-disable-line no-unused-vars
    this.client = client
  }

  /*
   * Function to take a Template id and return the Template object in the
   * response. If the template isn't in the system, then we will return
   * the appropriate error.
   */
  async get(id: string): Promise<{
    success: boolean,
    template?: Template,
    errors?: PostGridError,
  }> {
    const resp = await this.client.fire(
      'GET',
      `templates/${id}`
    )
    if (resp?.response?.status >= 400) {
      return {
        success: false,
        errors: resp?.payload?.error,
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
    errors?: PostGridError,
  }> {
    const resp = await this.client.fire(
      'GET',
      'templates',
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
    errors?: PostGridError,
  }> {
    const body = template
    const resp = await this.client.fire(
      'POST',
      'templates',
      undefined,
      body)
    if (resp?.response?.status >= 400) {
      return {
        success: false,
        errors: resp?.payload?.error,
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
    errors?: PostGridError,
  }> {
    const body = template
    const resp = await this.client.fire(
      'POST',
      `templates/${id}`,
      undefined,
      body)
    if (resp?.response?.status >= 400) {
      return {
        success: false,
        errors: resp?.payload?.error,
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
    errors?: PostGridError,
  }> {
    const resp = await this.client.fire(
      'DELETE',
      `templates/${id}`
    )
    if (resp?.response?.status >= 400) {
      return {
        success: false,
        errors: resp?.payload?.error,
      }
    }
    return { success: (resp && !resp.payload?.error), template: resp.payload }
  }
}
