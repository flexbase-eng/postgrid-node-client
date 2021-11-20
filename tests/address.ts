import { PostGrid } from '../src/index'

(async () => {
  const client = new PostGrid({
    mail: process.env.POSTGRID_MAIL_API_KEY,
    addr: process.env.POSTGRID_ADDR_API_KEY,
  })

  console.log('getting the lookup info...')
  const one = await client.address.lookupInfo()
  if (one.success) {
    console.log('Success!')
  } else {
    console.log('Error! Getting the lookup info failed, and the output is:')
    console.log(one)
  }

  console.log('checking valid freeform address...')
  const twoA = await client.address.verify('3288 Tara Ln, Indianapolis, IN 46224')
  if (twoA.success && twoA.verified) {
    console.log('Success!')
  } else {
    console.log('Error! Validating the freeform address failed, and the output is:')
    console.log(twoA)
  }

  console.log('checking valid structured address...')
  const twoB = await client.address.verify({
    line1: '3288 Tara Ln',
    city: 'Indianapolis',
    postalOrZip: '46224',
    provinceOrState: 'IN',
  })
  if (twoB.success && twoB.verified) {
    console.log('Success!')
  } else {
    console.log('Error! Validating the structured address failed, and the output is:')
    console.log(twoB)
  }

  console.log('checking invalid freeform address...')
  const tre = await client.address.verify('3000 Tara Ln, Indianapolis, IN 46224')
  if (tre.success && !tre.verified) {
    console.log('Success!')
  } else {
    console.log('Error! Validating the freeform address failed, and the output is:')
    console.log(tre)
  }

  console.log('checking autocomplete previews...')
  const fou = await client.address.autocompletePreviews('77 main st')
  if (fou.success) {
    console.log('Success!')
  } else {
    console.log('Error! Getting autocomplete previews failed, and the output is:')
    console.log(fou)
  }

  console.log('checking autocomplete an address...')
  const fiv = await client.address.autocompleteAddress({
    line1: '77 S MAIN ST',
    city: 'ABERDEEN',
    provinceOrState: 'SD',
  })
  if (fiv.success) {
    console.log('Success!')
  } else {
    console.log('Error! Getting autocomplete addresses failed, and the output is:')
    console.log(fiv)
  }

  console.log('checking autocomplete an address...')
  const six = await client.address.batchVerify([
    '3288 Tara Ln, Indianapolis, IN 46224',
    '3000 Tara Ln, Indianapolis, IN 46224',
    {
      line1: '77 S MAIN ST',
      city: 'ABERDEEN',
      provinceOrState: 'SD',
      postalOrZip: '57401',
    },
  ])
  if (six.success) {
    console.log('Success!')
  } else {
    console.log('Error! Getting batch verifications failed, and the output is:')
    console.log(six)
  }

  console.log('checking structured suggest addresses...')
  const sevA = await client.address.suggestAddresses({
    line1: '77 MAIN ST',
    city: 'ABERDEEN',
    provinceOrState: 'SD',
  })
  if (sevA.success) {
    console.log('Success!')
  } else {
    console.log('Error! Getting suggested addresses failed, and the output is:')
    console.log(sevA)
  }

  console.log('checking freeform suggest addresses...')
  const sevB = await client.address.suggestAddresses('77 MAIN ST, ABERDEEN, SD')
  if (sevB.success) {
    console.log('Success!')
  } else {
    console.log('Error! Getting suggested addresses failed, and the output is:')
    console.log(sevB)
  }

  console.log('checking parsing address...')
  const eig = await client.address.parseAddress('3288 Tara Ln, Indianapolis, IN 46224')
  if (eig.success) {
    console.log('Success!')
  } else {
    console.log('Error! Parsing an address failed, and the output is:')
    console.log(eig)
  }

  console.log('checking city/state lookup from postap code...')
  const nin = await client.address.lookupCityState('60540')
  if (nin.success) {
    console.log('Success!')
  } else {
    console.log('Error! Lookup of City/State failed, and the output is:')
    console.log(nin)
  }

})()
