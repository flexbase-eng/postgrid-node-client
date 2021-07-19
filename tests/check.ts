import { PostGrid } from '../src/index'

(async () => {
  const client = new PostGrid(process.env.POSTGRID_API_KEY!)

  console.log('creating a single Check...')
  const what = {
    description: 'Cool new check',
    letterHTML: 'Hello {{to.firstName}}',
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
    bankAccount: 'bank_gMpKxPyiGzt1ZwACTmLHHn',
    amount: 10000,
    memo: 'Invoice 1233',
    number: 9667,
  }

  const one = await client.check.create(what)
  if (one.success) {
    console.log('Success!')
    console.log(JSON.stringify(one, null, 2))
  } else {
    console.log('Error! Creating the check failed, and the output is:')
    console.log(one)
  }

  if (one.success) {
    console.log('fetching a single Check...')
    const two = await client.check.get(one.check!.id)
    if (two.success) {
      console.log('Success!')
    } else {
      console.log('Error! Fetching the check failed, and the output is:')
      console.log(two)
    }
  }

  console.log('listing the first page of 40 Checks...')
  const tre = await client.check.list()
  if (tre.success) {
    console.log('Success!')
    console.log(JSON.stringify(tre, null, 2))
  } else {
    console.log('Error! Listing the check failed, and the output is:')
    console.log(tre)
  }

  if (one.success) {
    console.log('deleting a single Check...')
    const fou = await client.check.delete(one.check!.id)
    if (fou.success) {
      console.log('Success!')
    } else {
      console.log('Error! Deleting the check failed, and the output is:')
      console.log(fou)
    }
  }

})()
