import { PostGrid } from '../src/index'

(async () => {
  const client = new PostGrid(process.env.POSTGRID_API_KEY!)

  console.log('creating a single Webhook...')
  const what = {
    description: 'Cool new webhook',
    url: 'https://peabody.ngrok.io/postgrid/callback',
    enabledEvents: ['letter.created'],
  }
  const one = await client.webhook.create(what)
  if (one.success) {
    console.log('Success!')
  } else {
    console.log('Error! Creating the webhook failed, and the output is:')
    console.log(one)
  }

  if (one.success) {
    console.log('fetching a single Webhook...')
    const two = await client.webhook.get(one.webhook!.id)
    if (two.success) {
      console.log('Success!')
    } else {
      console.log('Error! Fetching the webhook failed, and the output is:')
      console.log(two)
    }
  }

  console.log('listing the first page of 40 Webhooks...')
  const tre = await client.webhook.list()
  if (tre.success) {
    console.log('Success!')
  } else {
    console.log('Error! Listing the webhooks failed, and the output is:')
    console.log(tre)
  }

  if (one.success) {
    console.log('listing the first page of 40 Webhook Invocations...')
    const tre = await client.webhook.invocations(one.webhook!.id)
    if (tre.success) {
      console.log('Success!')
    } else {
      console.log('Error! Listing the webhooks failed, and the output is:')
      console.log(tre)
    }
  }

  if (one.success) {
    console.log('deleting a single Webhook...')
    const fou = await client.webhook.delete(one.webhook!.id)
    if (fou.success) {
      console.log('Success!')
    } else {
      console.log('Error! Deleting the webhook failed, and the output is:')
      console.log(fou)
    }
  }

})()
