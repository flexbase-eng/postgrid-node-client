import { PostGrid } from '../src/index'

(async () => {
  const client = new PostGrid(process.env.POSTGRID_API_KEY!)

  console.log('creating a single Template...')
  const what = {
    description: 'Cool new template',
    html: '<b>Hello</b> {{to.firstName}}',
  }
  const one = await client.template.create(what)
  if (one.success) {
    console.log('Success!')
  } else {
    console.log('Error! Creating the template failed, and the output is:')
    console.log(one)
  }

  if (one.success) {
    console.log('fetching a single Template...')
    const two = await client.template.get(one.template!.id)
    if (two.success) {
      console.log('Success!')
    } else {
      console.log('Error! Fetching the template failed, and the output is:')
      console.log(two)
    }
  }

  console.log('listing the first page of 40 Templates...')
  const tre = await client.template.list()
  if (tre.success) {
    console.log('Success!')
  } else {
    console.log('Error! Listing the templates failed, and the output is:')
    console.log(tre)
  }

  if (one.success) {
    console.log('deleting a single Template...')
    const fou = await client.template.delete(one.template!.id)
    if (fou.success) {
      console.log('Success!')
    } else {
      console.log('Error! Deleting the template failed, and the output is:')
      console.log(fou)
    }
  }

})()
