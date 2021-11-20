import { PostGrid } from '../src/index'

(async () => {
  const client = new PostGrid({
    mail: process.env.POSTGRID_MAIL_API_KEY,
    addr: process.env.POSTGRID_ADDR_API_KEY,
  })

  console.log('creating a single Contact...')
  const who = {
    addressLine1: '2929 Eagledale Dr',
    provinceOrState: 'IN',
    postalOrZip: '46224',
    countryCode: 'US',
    firstName: 'Jim',
    lastName: 'Harrison',
    email: 'jim@jimmys.com',
    phoneNumber: '317-555-1212',
    companyName: 'Jimmys Bar',
    jobTitle: 'Barkeep',
  }
  const one = await client.contact.create(who)
  if (one.success) {
    console.log('Success!')
  } else {
    console.log('Error! Creating the contact failed, and the output is:')
    console.log(one)
  }

  if (one.success) {
    console.log('fetching a single Contact...')
    const two = await client.contact.get(one.contact!.id)
    if (two.success) {
      console.log('Success!')
    } else {
      console.log('Error! Fetching the contact failed, and the output is:')
      console.log(two)
    }
  }

  console.log('listing the first page of 40 Contacts...')
  const tre = await client.contact.list()
  if (tre.success) {
    console.log(`Success! The list contained ${tre.contacts!.data!.length} contacts...`)
  } else {
    console.log('Error! Listing the contact failed, and the output is:')
    console.log(tre)
  }

  if (one.success) {
    console.log('deleting a single Contact...')
    const fou = await client.contact.delete(one.contact!.id)
    if (fou.success) {
      console.log('Success!')
    } else {
      console.log('Error! Deleting the contact failed, and the output is:')
      console.log(fou)
    }
  }

})()
