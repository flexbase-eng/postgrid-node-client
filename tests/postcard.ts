import { PostGrid } from '../src/index'

(async () => {
  const client = new PostGrid({
    mail: process.env.POSTGRID_MAIL_API_KEY,
    addr: process.env.POSTGRID_ADDR_API_KEY,
  })

  console.log('creating a single Postcard...')
  const what = {
    description: 'Cool new postcard',
    size: '6x4',
    frontHTML: 'Hello, {{to.firstName}}',
    backHTML: 'Hello again, {{to.firstName}}',
    to: {
      firstName: 'Steve',
      lastName: 'Smith',
      companyName: 'Acme Rentals',
      addressLine1: '5454 West 34th Street',
      city: 'Indianapolis',
      provinceOrState: 'IN',
      postalOrZip: '46224',
      countryCode: 'US',
    },
    from: {
      firstName: 'John',
      lastName: 'Quincy',
      companyName: 'US Steel',
      addressLine1: '123 Main Street',
      city: 'Atlanta',
      provinceOrState: 'GA',
      postalOrZip: '12345',
      countryCode: 'US',
    },
  }

  const one = await client.postcard.create(what)
  if (one.success) {
    console.log('Success!')
  } else {
    console.log('Error! Creating the postcard failed, and the output is:')
    console.log(one)
  }

  if (one.success) {
    console.log('fetching a single Postcard...')
    const two = await client.postcard.get(one.postcard!.id)
    if (two.success) {
      console.log('Success!')
    } else {
      console.log('Error! Fetching the postcard failed, and the output is:')
      console.log(two)
    }
  }

  console.log('listing the first page of 40 Postcards...')
  const tre = await client.postcard.list()
  if (tre.success) {
    console.log(`Success! The list contained ${tre.postcards!.data!.length} postcards...`)
  } else {
    console.log('Error! Listing the postcards failed, and the output is:')
    console.log(tre)
  }

  if (one.success) {
    console.log('deleting a single Postcard...')
    const fou = await client.postcard.delete(one.postcard!.id)
    if (fou.success) {
      console.log('Success!')
    } else {
      console.log('Error! Deleting the postcard failed, and the output is:')
      console.log(fou)
    }
  }

})()
