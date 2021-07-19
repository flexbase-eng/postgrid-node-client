import { PostGrid } from '../src/index'

(async () => {
  const client = new PostGrid(process.env.POSTGRID_API_KEY!)

  console.log('creating a single Bank Account...')
  const who = {
    description: 'This is where to put your marshmallows',
    bankName: 'Bank of Marshmallows',
    bankPrimaryLine: '3288 Tara Lane',
    bankSecondaryLine: 'Indianapolis, IN',
    bankCountryCode: 'US',
    routingNumber: '123456789',
    accountNumber: '100010001001',
    signatureText: 'Stay Puff'
  }
  const one = await client.bankAccount.create(who)
  if (one.success) {
    console.log('Success!')
  } else {
    console.log('Error! Creating the bank account failed, and the output is:')
    console.log(one)
  }

  if (one.success) {
    console.log('fetching a single Bank Account...')
    const two = await client.bankAccount.get(one.account!.id)
    if (two.success) {
      console.log('Success!')
    } else {
      console.log('Error! Fetching the account failed, and the output is:')
      console.log(two)
    }
  }

  console.log('listing the first page of 40 Bank Accounts...')
  const tre = await client.bankAccount.list()
  if (tre.success) {
    console.log('Success!')
  } else {
    console.log('Error! Listing the accounts failed, and the output is:')
    console.log(tre)
  }

  if (one.success) {
    console.log('deleting a single Bank Account...')
    const fou = await client.bankAccount.delete(one.account!.id)
    if (fou.success) {
      console.log('Success!')
    } else {
      console.log('Error! Deleting the bank account failed, and the output is:')
      console.log(fou)
    }
  }

})()
