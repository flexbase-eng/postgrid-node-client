# postgrid-node-client

`postgrid-node-client` is a Node/JS and TypeScript Client for
[PostGrid](https://postgrid.com) that allows you to use normal Node
syntax to send PDFs, and other documents, through Postal Delivery to
recipients. The second service [PostGrid](https://postgrid.com) offers
is the Address Verification and Autocomplete. That, too, is covered in
this client, but [PostGrid](https://postgrid.com) requires two API Keys -
one for each service, so it will be important to keep them straight in
the set-up of the Client, below. [PostGrid](https://postgrid.com) has
a set of REST [endpoints](https://docs.postgrid.com/#test-mode) for
the Print-Mail service, and another set of REST
[endpoints](https://avdocs.postgrid.com/) for the Address
Verification service. This Node client just
affords some nice convenience features for the Node developer.

## Install

```bash
# with npm
$ npm install postgrid-node-client
```

## Usage

This README isn't going to cover all the specifics of what PostGrid is,
and how to use it - it's targeted as a _companion_ to the PostGrid developer
Print-Mail [docs](https://docs.postgrid.com/#test-mode), and the Address
Verification [docs](https://avdocs.postgrid.com/) that explain each
of the endpoints and how the general PostGrid workflow works.

However, we'll put in plenty of examples so that it's clear how to use this
library to interact with both PostGrid services.

### Getting your API Keys

As documented on the PostGrid sites - one for the Print-Mail, and one for the
Address Verification, the first step is getting an API Key for each service.
This is available on the Print-Mail Dashboard
[page](https://dashboard.postgrid.com/dashboard), and on the Address
Verification Dashboard
[page](https://app.postgrid.com/dashboard), once you login to each
of the PostGrid services. For the rest of this document, the API Keys will
be seen as: `[Your Mail API Key]` and the Print-Mail service, and
`[Your Addr API Key]` and the Address Verification service, and will
need to be replaced with the API Keys you obtain from the site.

If you only subscribe to one service - just get that key. The Client is
smart enough to return an error on the calls if you do not have the
appropriate API Key for that call.

### Creating the Client

All PostGrid functions are available from the client, and the basic
construction of the client is:

```typescript
import { PostGrid } from 'postgrid-node-client'
const client = new PostGrid({
  mail: '[Your Mail API Key]',
  addr: '[Your Addr API Key]',
})
```

and it's not necessary that you supply _both_ API Keys if you only have
a subscription to one of the services. Just fill in the one you have.

There is a legacy mode where the Print-Mail functions are available
by just supplying the API Key for that service. That constructor looks
like:

```typescript
import { PostGrid } from 'postgrid-node-client'
const client = new PostGrid('[Your Mail API Key]')
```

If you'd like to provide the webhook URL in the constructor, you can do that
with:

```typescript
const client = new PostGrid({
    mail: '[Your Mail API Key]',
    addr: '[Your Addr API Key]',
  },
  {
    webhookUrl: 'https://my.service.com/postgrid/callback',
    webhookSecret: 'abc123456the-tall-brown-bear',
    webhookEvents: ['letter.created', 'letter.updated'],
  }
)
```

where the options can include:

* `webhookUrl` - the URL for all PostGrid updates to be sent
* `webhookSecret` - the JWT encryption secret for the payload on the
  webhook so that it's safe in transmission back to the service.
* `webhookEvents` - the array of strings that are the [events](https://docs.postgrid.com/#webhook-event-types) that this
  webhook is expected to receive from PostGrid.

### Contact Calls

In general, the Contacts are the contact information for a Sender or
Recipient in the PostGrid system. These can be created, updated, and deleted,
as individual entities, or they can be created as a part of a more complex
operation - such as Create a Letter.

#### [Create Contact](https://docs.postgrid.com/#f3b14da5-9b38-4594-9bcb-a438d181469a)

```typescript
const contact = await client.contact.create({
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
})
```

This will create the contact with the provided address and contact information,
and in the event that the details are the same as an existing Contact, this
will **_not_** create a _new_ Contact, but simply return the existing one with
the same data. The response will be something like:

```javascript
{
  "success": true,
  "contact": {
    "id": "contact_igdxsBys7TPJYf47PevBJj",
    "object": "contact",
    "live": false,
    "addressLine1": "2929 EAGLEDALE DR",
    "addressLine2": null,
    "addressStatus": "verified",
    "city": null,
    "companyName": "Jimmys Bar",
    "country": "UNITED STATES",
    "countryCode": "US",
    "email": "jim@jimmys.com",
    "firstName": "Jim",
    "jobTitle": "Barkeep",
    "lastName": "Harrison",
    "phoneNumber": "317-555-1212",
    "postalOrZip": "46224",
    "provinceOrState": "IN",
    "createdAt": "2021-07-15T18:36:45.348Z",
    "updatedAt": "2021-07-15T18:36:45.348Z"
  }
}
```

If there had been an error, the response would be:

```javascript
{
  "success": false,
  "error": {
    "type": "PostGrid_type",
    "message": "(Error message from PostGrid...)"
  }
}
```

So looking at the `success` value of the response will quickly let you know the outcome of the call.

#### [Get a Contact](https://docs.postgrid.com/#0791b439-3bc6-4555-b58f-c9164feaac73)

```typescript
const doc = await client.contact.get(id)
```

where `id` is the Contact ID, like `contact_igdxsBys7TPJYf47PevBJj`, in the
above example, and the response will be something like the response to the
`client.contact.create()` function.

#### [List Contacts](https://docs.postgrid.com/#358154ea-fe92-4a32-b0a5-8031dddf09c4)

```typescript
const doc = await client.contacts.list()
```

This will list all the Contacts assoiated with this API Key, and will do so
in the PostGrid List paging scheme of `limit` and `skip`. These parameters
are optional, and if they are omitted, the defaults are:

* `skip` is `0`
* `limit` is `40`

The response will be something like:

```javascript
{
  "success": true,
  "contacts": {
    "object": "list",
    "limit": 40,
    "skip": 0,
    "totalCount": 12,
    "data": [
      {
        "id": "contact_2rWLmfNFPKQLtZEy72qT8e",
        "object": "contact",
        "live": false,
        "addressLine1": "2929 EAGLEDALE DR",
        "addressLine2": null,
        "addressStatus": "verified",
        "city": null,
        "companyName": "Jimmys Bar",
        "country": "UNITED STATES",
        "countryCode": "US",
        "email": "jim@jimmys.com",
        "firstName": "Jim",
        "jobTitle": "Barkeep",
        "lastName": "Harrison",
        "phoneNumber": "317-555-1212",
        "postalOrZip": "46224",
        "provinceOrState": "IN",
        "createdAt": "2021-07-15T18:54:44.521Z",
        "updatedAt": "2021-07-15T18:54:44.521Z"
      },
      ...
    ]
  }
}
```

#### [Delete a Contact](https://docs.postgrid.com/#65f88fa5-b62f-48c7-b688-8f67173884d1)

```typescript
const doc = await client.contact.delete(id)
```

where `id` is the Contact ID, like `contact_igdxsBys7TPJYf47PevBJj`, in the
above example, and the response will be something like:

```javascript
{
  "success": true,
  "contact": {
    "id": "contact_2gA88Z5Mb3jtB1nnpQCCAn",
    "object": "contact",
    "deleted": true
  }
}
```

### Letter Calls

The PostGrid Letter is a basic _Page Document_ that can be sourced from an
HTML template, with replacable parameters, or a PDF, and can be sent from
a Sender to a Recipient through the Postal System.

#### [Create Letter](https://docs.postgrid.com/#99649412-9faa-4e1b-af7a-3e1a16dce549)

The basic Create Letter call looks something like this:

```typescript
const letter = await client.letter.create({
  description: 'Cool new letter',
  pdf: 'https://www.icnaam.org/documents/8x11singlesample.pdf',
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
})
```

This will create the letter with the provided addresses, and in it will then
start it's journey to the recipient. The response will be something like:

```javascript
{
  "success": true,
  "letter": {
    "id": "letter_hBy6M5DMKEqp7z1paW1TDM",
    "object": "letter",
    "live": false,
    "addressPlacement": "insert_blank_page",
    "color": false,
    "description": "Cool new letter",
    "doubleSided": false,
    "from": {
      "id": "contact_fo3HwdeFZ3wwNuHFAgszHt",
      "object": "contact",
      "addressLine1": "123 MAIN STREET",
      "addressLine2": null,
      "addressStatus": "verified",
      "city": "ATLANTA",
      "companyName": "US Steel",
      "country": "UNITED STATES",
      "countryCode": "US",
      "firstName": "John",
      "lastName": "Quincy",
      "postalOrZip": "12345",
      "provinceOrState": "GA"
    },
    "sendDate": "2021-07-15T19:51:50.356Z",
    "status": "ready",
    "to": {
      "id": "contact_f8NLBJXjV82HnM8emVow3r",
      "object": "contact",
      "addressLine1": "5454 WEST 34TH STREET",
      "addressLine2": null,
      "addressStatus": "verified",
      "city": "INDIANAPOLIS",
      "companyName": "Acme Rentals",
      "country": "UNITED STATES",
      "countryCode": "US",
      "firstName": "Steve",
      "lastName": "Smith",
      "postalOrZip": "46224",
      "provinceOrState": "IN"
    },
    "uploadedPdf": "https://pg-prod-bucket-1.s3.amazonaws.com/test/...",
    "createdAt": "2021-07-15T19:51:50.360Z",
    "updatedAt": "2021-07-15T19:51:50.360Z"
  }
}
```

If there had been an error, the response would be:

```javascript
{
  "success": false,
  "error": {
    "type": "PostGrid_type",
    "message": "(Error message from PostGrid...)"
  }
}
```

It's important to remember that if the same Contact information is supplied
as an existing Contact, PostGrid will not create a new Contact - simply
reuse the one it already has.

But there are other ways to create a letter. You can use the Contact IDs,
like:

```typescript
const letter = await client.letter.create({
  description: 'Cool new letter',
  pdf: 'https://www.icnaam.org/documents/8x11singlesample.pdf',
  to: 'contact_f8NLBJXjV82HnM8emVow3r',
  from: 'contact_fo3HwdeFZ3wwNuHFAgszHt',
})
```

so that if you know the created Contact data, you can just pass in the IDs.
Of course, you can mix-and-match as well.

You can also use a standard Node `Buffer` to load up the Letter source:

```typescript
import fs from 'fs'

const doc = fs.readFileSync('/my/local/file.pdf')

const letter = await client.letter.create({
  description: 'Cool new letter',
  pdf: doc,
  to: 'contact_f8NLBJXjV82HnM8emVow3r',
  from: 'contact_fo3HwdeFZ3wwNuHFAgszHt',
})
```

all of these are covered in the different forms of the PostGrid _Create Letter_
endpoints, but the Client detects the inputs and acts accordingly. You just
have to provide the data.

As a final note, you can also pass in the optional _Idempotency Key_ to the
`create()` function, and this will have the added benefit that PostGrid will
not create a duplicate Letter - within 24 hrs, of the initial `create()` call
with the same `idempotencyKey`. The key is provided in the call as an optional
second parameter:

```typescript
const letter = await client.letter.create({
  description: 'Cool new letter',
  pdf: 'https://www.icnaam.org/documents/8x11singlesample.pdf',
  to: 'contact_f8NLBJXjV82HnM8emVow3r',
  from: 'contact_fo3HwdeFZ3wwNuHFAgszHt',
}, {
  idempotencyKey: '9d972254-34eb-492e-90c2-739087a8487d'
})
```

where this example is just using a UUID.

#### [Get a Letter](https://docs.postgrid.com/#8bc03c09-8a5d-4353-9e76-689a47af5e82)

```typescript
const doc = await client.letter.get(id)
```

where `id` is the Letter ID, like `letter_hBy6M5DMKEqp7z1paW1TDM`, in the
above example, and the response will be something like the response to the
`client.letter.create()` function.

#### [List Letters](https://docs.postgrid.com/#7dd3404d-e008-4873-a2fc-79ab856dc268)

```typescript
const doc = await client.letter.list()
```

This will list all the Letters assoiated with this API Key, and will do so
in the PostGrid List paging scheme of `limit` and `skip`. These parameters
are optional, and if they are omitted, the defaults are:

* `skip` is `0`
* `limit` is `40`

The response will be something like:

```javascript
{
  "success": true,
  "letters": {
    "object": "list",
    "limit": 40,
    "skip": 0,
    "totalCount": 27,
    "data": [
      {
        "id": "letter_3j3st1ZzZmFPv9bn1BnMeE",
        "object": "letter",
        "live": false,
        "addressPlacement": "insert_blank_page",
        "color": false,
        "description": "Cool new letter",
        "doubleSided": false,
        "from": {
          "id": "contact_fo3HwdeFZ3wwNuHFAgszHt",
          "object": "contact",
          "addressLine1": "123 MAIN STREET",
          "addressLine2": null,
          "addressStatus": "verified",
          "city": "ATLANTA",
          "companyName": "US Steel",
          "country": "UNITED STATES",
          "countryCode": "US",
          "firstName": "John",
          "lastName": "Quincy",
          "postalOrZip": "12345",
          "provinceOrState": "GA"
        },
        "sendDate": "2021-07-15T20:02:55.417Z",
        "status": "ready",
        "to": {
          "id": "contact_f8NLBJXjV82HnM8emVow3r",
          "object": "contact",
          "addressLine1": "5454 WEST 34TH STREET",
          "addressLine2": null,
          "addressStatus": "verified",
          "city": "INDIANAPOLIS",
          "companyName": "Acme Rentals",
          "country": "UNITED STATES",
          "countryCode": "US",
          "firstName": "Steve",
          "lastName": "Smith",
          "postalOrZip": "46224",
          "provinceOrState": "IN"
        },
        "uploadedPdf": "https://pg-prod-bucket-1.s3.amazonaws.com/test/...",
        "createdAt": "2021-07-15T20:02:55.421Z",
        "updatedAt": "2021-07-15T20:02:55.421Z"
      },
      ...
    ]
  }
}
```

#### [Progress a Test Letter](https://docs.postgrid.com/#946491db-95f5-45a7-a12d-1040b36e93c2)

This function will move a Test Letter through the server-side processing
steps, one at a time to allow the caller to verify the webhook calls. This
is **_only_** available for Test Letters.

```typescript
const move = await client.letter.progress(id)
```

where `id` is the Letter ID, like `letter_hBy6M5DMKEqp7z1paW1TDM`, in the
above example, and the response will be similar to the response from
`client.letter.get(id)`.

#### [Delete a Letter](https://docs.postgrid.com/#d15d3f9d-4485-4403-a519-be9c90e0e33e)

This function will delete - or _Cancel_ a Letter that's not yet been sent.

```typescript
const doc = await client.letter.delete(id)
```

where `id` is the Letter ID, like `letter_hBy6M5DMKEqp7z1paW1TDM`, in the
above example, and the response will be something like:

```javascript
{
  "success": true,
  "letter": {
    "id": "letter_hBy6M5DMKEqp7z1paW1TDM",
    "object": "letter",
    "deleted": true
  }
}
```

### Postcard Calls

The PostGrid Postcard is a basic postcard that can be sourced from an
HTML template, with replacable parameters, or a PDF, and can be sent from
a Sender to a Recipient through the Postal System. The available sizes are:

* `6x4`
* `9x6`
* `11x6`

which is specified in the `size` parameter of the `postcard.create()`
function call.

#### [Create Postcard](https://docs.postgrid.com/#9573c2da-ff96-4d65-b40b-99dc7df556c3)

The basic Create Postcard call looks something like this:

```typescript
const postcard = await client.postcard.create({
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
})
```

This will create the postcard with the provided addresses, and in it will then
start it's journey to the recipient. The response will be something like:

```javascript
{
  "success": true,
  "postcard": {
    "id": "postcard_48Fm3w14DGjRKKpsD2GrXJ",
    "object": "postcard",
    "live": false,
    "backHtml": "Hello again, {{to.firstName}}",
    "description": "Cool new postcard",
    "from": {
      "id": "contact_fo3HwdeFZ3wwNuHFAgszHt",
      "object": "contact",
      "addressLine1": "123 MAIN STREET",
      "addressLine2": null,
      "addressStatus": "verified",
      "city": "ATLANTA",
      "companyName": "US Steel",
      "country": "UNITED STATES",
      "countryCode": "US",
      "firstName": "John",
      "lastName": "Quincy",
      "postalOrZip": "12345",
      "provinceOrState": "GA"
    },
    "frontHtml": "Hello, {{to.firstName}}",
    "sendDate": "2021-07-16T14:09:38.286Z",
    "size": "6x4",
    "status": "ready",
    "to": {
      "id": "contact_f8NLBJXjV82HnM8emVow3r",
      "object": "contact",
      "addressLine1": "5454 WEST 34TH STREET",
      "addressLine2": null,
      "addressStatus": "verified",
      "city": "INDIANAPOLIS",
      "companyName": "Acme Rentals",
      "country": "UNITED STATES",
      "countryCode": "US",
      "firstName": "Steve",
      "lastName": "Smith",
      "postalOrZip": "46224",
      "provinceOrState": "IN"
    },
    "createdAt": "2021-07-16T14:09:38.290Z",
    "updatedAt": "2021-07-16T14:09:38.290Z"
  }
}
```

If there had been an error, the response would be:

```javascript
{
  "success": false,
  "error": {
    "type": "PostGrid_type",
    "message": "(Error message from PostGrid...)"
  }
}
```

It's important to remember that if the same Contact information is supplied
as an existing Contact, PostGrid will not create a new Contact - simply
reuse the one it already has.

But there are other ways to create a postcard. You can use the Contact IDs,
like:

```typescript
const postcard = await client.postcard.create({
  description: 'Cool new postcard',
  pdf: 'https://my.artwork.com/postcards/6x4sample.pdf',
  to: 'contact_f8NLBJXjV82HnM8emVow3r',
  from: 'contact_fo3HwdeFZ3wwNuHFAgszHt',
})
```

so that if you know the created Contact data, you can just pass in the IDs.
Of course, you can mix-and-match as well.

You can also use a standard Node `Buffer` to load up the Letter source:

```typescript
import fs from 'fs'

const doc = fs.readFileSync('/my/local/file.pdf')

const postcard = await client.postcard.create({
  description: 'Cool new postcard',
  pdf: doc,
  to: 'contact_f8NLBJXjV82HnM8emVow3r',
  from: 'contact_fo3HwdeFZ3wwNuHFAgszHt',
})
```

all of these are covered in the different forms of the PostGrid _Create Postcard_
endpoints, but the Client detects the inputs and acts accordingly. You just
have to provide the data.

As a final note, you can also pass in the optional _Idempotency Key_ to the
`create()` function, and this will have the added benefit that PostGrid will
not create a duplicate Postcard - within 24 hrs, of the initial `create()` call
with the same `idempotencyKey`. The key is provided in the call as an optional
second parameter:

```typescript
const postcard = await client.postcard.create({
  description: 'Cool new postcard',
  pdf: 'https://my.artwork.com/postcards/6x4sample.pdf',
  to: 'contact_f8NLBJXjV82HnM8emVow3r',
  from: 'contact_fo3HwdeFZ3wwNuHFAgszHt',
}, {
  idempotencyKey: '9d972254-34eb-492e-90c2-739087a8487d'
})
```

where this example is just using a UUID.

#### [Get a Postcard](https://docs.postgrid.com/#51ca8b0c-dc40-44cb-bf7c-b784976d8d35)

```typescript
const doc = await client.postcard.get(id)
```

where `id` is the Postcard ID, like `postcard_48Fm3w14DGjRKKpsD2GrXJ`, in the
above example, and the response will be something like the response to the
`client.postcard.create()` function.

#### [List Postcards](https://docs.postgrid.com/#08cc954c-ecd2-4e95-bf79-402f4a199d06)

```typescript
const doc = await client.postcard.list()
```

This will list all the Postcards assoiated with this API Key, and will do so
in the PostGrid List paging scheme of `limit` and `skip`. These parameters
are optional, and if they are omitted, the defaults are:

* `skip` is `0`
* `limit` is `40`

The response will be something like:

```javascript
{
  "success": true,
  "postcards": {
    "object": "list",
    "limit": 40,
    "skip": 0,
    "totalCount": 3,
    "data": [
      {
        "id": "postcard_agV7LbeDfRbdNUdnfePAyD",
        "object": "postcard",
        "live": false,
        "backHtml": "Hello again, {{to.firstName}}",
        "description": "Cool new postcard",
        "from": {
          "id": "contact_fo3HwdeFZ3wwNuHFAgszHt",
          "object": "contact",
          "addressLine1": "123 MAIN STREET",
          "addressLine2": null,
          "addressStatus": "verified",
          "city": "ATLANTA",
          "companyName": "US Steel",
          "country": "UNITED STATES",
          "countryCode": "US",
          "firstName": "John",
          "lastName": "Quincy",
          "postalOrZip": "12345",
          "provinceOrState": "GA"
        },
        "frontHtml": "Hello, {{to.firstName}}",
        "sendDate": "2021-07-16T14:14:37.023Z",
        "size": "6x4",
        "status": "ready",
        "to": {
          "id": "contact_f8NLBJXjV82HnM8emVow3r",
          "object": "contact",
          "addressLine1": "5454 WEST 34TH STREET",
          "addressLine2": null,
          "addressStatus": "verified",
          "city": "INDIANAPOLIS",
          "companyName": "Acme Rentals",
          "country": "UNITED STATES",
          "countryCode": "US",
          "firstName": "Steve",
          "lastName": "Smith",
          "postalOrZip": "46224",
          "provinceOrState": "IN"
        },
        "createdAt": "2021-07-16T14:14:37.027Z",
        "updatedAt": "2021-07-16T14:14:37.027Z"
      },
      {
        "id": "postcard_48Fm3w14DGjRKKpsD2GrXJ",
        "object": "postcard",
        "live": false,
        "backHtml": "Hello again, {{to.firstName}}",
        "description": "Cool new postcard",
        "from": {
          "id": "contact_fo3HwdeFZ3wwNuHFAgszHt",
          "object": "contact",
          "addressLine1": "123 MAIN STREET",
          "addressLine2": null,
          "addressStatus": "verified",
          "city": "ATLANTA",
          "companyName": "US Steel",
          "country": "UNITED STATES",
          "countryCode": "US",
          "firstName": "John",
          "lastName": "Quincy",
          "postalOrZip": "12345",
          "provinceOrState": "GA"
        },
        "frontHtml": "Hello, {{to.firstName}}",
        "pageCount": 2,
        "sendDate": "2021-07-16T14:09:38.286Z",
        "size": "6x4",
        "status": "cancelled",
        "to": {
          "id": "contact_f8NLBJXjV82HnM8emVow3r",
          "object": "contact",
          "addressLine1": "5454 WEST 34TH STREET",
          "addressLine2": null,
          "addressStatus": "verified",
          "city": "INDIANAPOLIS",
          "companyName": "Acme Rentals",
          "country": "UNITED STATES",
          "countryCode": "US",
          "firstName": "Steve",
          "lastName": "Smith",
          "postalOrZip": "46224",
          "provinceOrState": "IN"
        },
        "url": "https://pg-prod-bucket-1.s3.amazonaws.com/test/...",
        "createdAt": "2021-07-16T14:09:38.290Z",
        "updatedAt": "2021-07-16T14:09:42.691Z"
      },
      ...
    ]
  }
}
```

#### [Progress a Test Postcard](https://docs.postgrid.com/#00b3d380-bdc6-4c84-b3a8-27bce0d5e0d3)

This function will move a Test Postcard through the server-side processing
steps, one at a time to allow the caller to verify the webhook calls. This
is **_only_** available for Test Postcards.

```typescript
const move = await client.postcard.progress(id)
```

where `id` is the Postcard ID, like `postcard_agV7LbeDfRbdNUdnfePAyD`, in the
above example, and the response will be similar to the response from
`client.postcard.get(id)`.

#### [Delete a Postcard](https://docs.postgrid.com/#cf6d99a3-1e5f-42e4-99dd-21242f9ab65e)

This function will delete - or _Cancel_ a Postcard that's not yet been sent.

```typescript
const doc = await client.postcard.delete(id)
```

where `id` is the Postcard ID, like `postcard_agV7LbeDfRbdNUdnfePAyD`, in the
above example, and the response will be something like:

```javascript
{
  "success": true,
  "postcard": {
    "id": "postcard_agV7LbeDfRbdNUdnfePAyD",
    "object": "postcard",
    "deleted": true
  }
}
```

### Bank Account Calls

In general, the Bank Accounts are the account information for creating a
check/cheque in the PostGrid system. These accounts can be created, updated,
and deleted, as individual entities.

#### [Create Bank Account](https://docs.postgrid.com/#632d1cf4-a44d-4593-ac15-4c35a0585b61)

```typescript
const account = await client.bankAccount.create({
  description: 'This is where to put your marshmallows',
  bankName: 'Bank of Marshmallows',
  bankPrimaryLine: '3288 Tara Lane',
  bankSecondaryLine: 'Indianapolis, IN',
  bankCountryCode: 'US',
  routingNumber: '123456789',
  accountNumber: '100010001001',
  signatureText: 'Stay Puff'
})
```

This will create the account with the provided address and account information. The response will be something like:

```javascript
{
  "success": true,
  "account": {
    "id": "bank_gMpKxPyiGzt1ZwACTmLHHn",
    "object": "bank_account",
    "live": false,
    "accountNumberLast4": "1001",
    "bankCountryCode": "US",
    "bankName": "Bank of Marshmallows",
    "bankPrimaryLine": "3288 Tara Lane",
    "bankSecondaryLine": "Indianapolis, IN",
    "description": "This is where to put your marshmallows",
    "routingNumber": "123456789",
    "signatureText": "Stay Puff",
    "createdAt": "2021-07-18T16:19:35.626Z",
    "updatedAt": "2021-07-18T16:19:35.626Z"
  }
}
```

If there had been an error, the response would be:

```javascript
{
  "success": false,
  "error": {
    "type": "PostGrid_type",
    "message": "(Error message from PostGrid...)"
  }
}
```

So looking at the `success` value of the response will quickly let you know the outcome of the call.

#### [Get a Bank Account](https://docs.postgrid.com/#8e4e3bec-a4e9-4710-a401-2a4fa409083c)

```typescript
const account = await client.bankAccount.get(id)
```

where `id` is the Bank Account ID, like `bank_gMpKxPyiGzt1ZwACTmLHHn`, in the
above example, and the response will be something like the response to the
`client.bankAccount.create()` function.

#### [List Bank Accounts](https://docs.postgrid.com/#0f6bb690-0ba8-4b32-9aab-371652fe66cb)

```typescript
const accts = await client.bankAccount.list()
```

This will list all the Bank Accounts assoiated with this API Key, and will
do so in the PostGrid List paging scheme of `limit` and `skip`. These
parameters are optional, and if they are omitted, the defaults are:

* `skip` is `0`
* `limit` is `40`

The response will be something like:

```javascript
{
  "success": true,
  "accounts": {
    "object": "list",
    "limit": 40,
    "skip": 0,
    "totalCount": 1,
    "data": [
      {
        "id": "bank_a2M4zstWGeYeJ8gbtVKKr5",
        "object": "bank_account",
        "live": false,
        "accountNumberLast4": "1001",
        "bankCountryCode": "US",
        "bankName": "Bank of Marshmallows",
        "bankPrimaryLine": "3288 Tara Lane",
        "bankSecondaryLine": "Indianapolis, IN",
        "description": "This is where to put your marshmallows",
        "routingNumber": "123456789",
        "signatureText": "Stay Puff",
        "createdAt": "2021-07-18T16:22:44.579Z",
        "updatedAt": "2021-07-18T16:22:44.579Z"
      }
    ]
  }
}
```

#### [Delete a Bank Account](https://docs.postgrid.com/#8b589827-34ab-4c10-9500-5f06c500d3fa)

```typescript
const drop = await client.bankAccount.delete(id)
```

where `id` is the Bank Account ID, like `bank_a2M4zstWGeYeJ8gbtVKKr5`, in the
above example, and the response will be something like:

```javascript
{
  "success": true,
  "account": {
    "id": "bank_a2M4zstWGeYeJ8gbtVKKr5",
    "object": "bank_account",
    "deleted": true
  }
}
```

### Cheque/Check Calls

The PostGrid Cheque (Check) is a check written against a Bank Account that
can be sent to the `to` recipient with an optional letter sourced from an
in-line HTML blob, a Template, or a PDF, and will be sent from
a Sender to a Recipient through the Postal System.

#### [Create Check](https://docs.postgrid.com/#b06be2fe-072d-43fc-aca0-2feeb7e029ef)

The basic Create Check call looks something like this:

```typescript
const check = await client.check.create({
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
})
```

This will create the check with the provided addresses, against the Bank
Account referenced by `bank_gMpKxPyiGzt1ZwACTmLHHn`, and will include a
letter in the same envelope, with the contents of the `letterHTML`. The
response will be something like:

```javascript
{
  "success": true,
  "check": {
    "id": "cheque_7GrdUQPmbkAXJg8vLkJK9B",
    "object": "cheque",
    "live": false,
    "amount": 10000,
    "bankAccount": "bank_gMpKxPyiGzt1ZwACTmLHHn",
    "currencyCode": "USD",
    "description": "Cool new check",
    "from": {
      "id": "contact_fo3HwdeFZ3wwNuHFAgszHt",
      "object": "contact",
      "addressLine1": "123 MAIN STREET",
      "addressLine2": null,
      "addressStatus": "verified",
      "city": "ATLANTA",
      "companyName": "US Steel",
      "country": "UNITED STATES",
      "countryCode": "US",
      "firstName": "John",
      "lastName": "Quincy",
      "postalOrZip": "12345",
      "provinceOrState": "GA"
    },
    "letterHtml": "Hello {{to.firstName}}",
    "memo": "Invoice 1233",
    "number": 9667,
    "sendDate": "2021-07-19T09:57:28.214Z",
    "status": "ready",
    "to": {
      "id": "contact_f8NLBJXjV82HnM8emVow3r",
      "object": "contact",
      "addressLine1": "5454 WEST 34TH STREET",
      "addressLine2": null,
      "addressStatus": "verified",
      "city": "INDIANAPOLIS",
      "companyName": "Acme Rentals",
      "country": "UNITED STATES",
      "countryCode": "US",
      "firstName": "Steve",
      "lastName": "Smith",
      "postalOrZip": "46224",
      "provinceOrState": "IN"
    },
    "createdAt": "2021-07-19T09:57:28.220Z",
    "updatedAt": "2021-07-19T09:57:28.220Z"
  }
}
```

If there had been an error, the response would be:

```javascript
{
  "success": false,
  "error": {
    "type": "PostGrid_type",
    "message": "(Error message from PostGrid...)"
  }
}
```

It's important to remember that if the same Contact information is supplied
as an existing Contact, PostGrid will not create a new Contact - simply
reuse the one it already has.

But there are other ways to create a check. You can use the Contact IDs,
like:

```typescript
const postcard = await client.postcard.create({
  description: 'Cool new check',
  letterHTML: 'Hello {{to.firstName}}',
  to: 'contact_f8NLBJXjV82HnM8emVow3r',
  from: 'contact_fo3HwdeFZ3wwNuHFAgszHt',
  bankAccount: 'bank_gMpKxPyiGzt1ZwACTmLHHn',
  amount: 10000,
  memo: 'Invoice 1233',
  number: 9667,
})
```

so that if you know the created Contact data, you can just pass in the IDs.
Of course, you can mix-and-match as well.

You can also use a standard Node `Buffer` to load up the letter source:

```typescript
import fs from 'fs'

const doc = fs.readFileSync('/my/local/file.pdf')

const postcard = await client.postcard.create({
  description: 'Cool new check',
  letterPDF: doc,
  to: 'contact_f8NLBJXjV82HnM8emVow3r',
  from: 'contact_fo3HwdeFZ3wwNuHFAgszHt',
  bankAccount: 'bank_gMpKxPyiGzt1ZwACTmLHHn',
  amount: 10000,
  memo: 'Invoice 1233',
  number: 9667,
})
```

all of these are covered in the different forms of the PostGrid _Create Cheque_
endpoints, but the Client detects the inputs and acts accordingly. You just
have to provide the data.

As a final note, you can also pass in the optional _Idempotency Key_ to the
`create()` function, and this will have the added benefit that PostGrid will
not create a duplicate Check - within 24 hrs, of the initial `create()` call
with the same `idempotencyKey`. The key is provided in the call as an optional
second parameter:

```typescript
const postcard = await client.postcard.create({
  description: 'Cool new check',
  letterHTML: 'Hello {{to.firstName}}',
  to: 'contact_f8NLBJXjV82HnM8emVow3r',
  from: 'contact_fo3HwdeFZ3wwNuHFAgszHt',
  bankAccount: 'bank_gMpKxPyiGzt1ZwACTmLHHn',
  amount: 10000,
  memo: 'Invoice 1233',
  number: 9667,
}, {
  idempotencyKey: '9d972254-34eb-492e-90c2-739087a8487d'
})
```

where this example is just using a UUID.

#### [Get a Check](https://docs.postgrid.com/#a289e66f-c4b0-42cb-903a-d479cbb27f59)

```typescript
const check = await client.check.get(id)
```

where `id` is the Postcard ID, like `cheque_7GrdUQPmbkAXJg8vLkJK9B`, in the
above example, and the response will be something like the response to the
`client.check.create()` function.

#### [List Checks](https://docs.postgrid.com/#0faa9a01-bb54-4047-bd91-e24aa538c98b)

```typescript
const checks = await client.check.list()
```

This will list all the Cheques/Checks assoiated with this API Key, and will
do so in the PostGrid List paging scheme of `limit` and `skip`. These
parameters are optional, and if they are omitted, the defaults are:

* `skip` is `0`
* `limit` is `40`

The response will be something like:

```javascript
{
  "success": true,
  "checks": {
    "object": "list",
    "limit": 40,
    "skip": 0,
    "totalCount": 3,
    "data": [
      {
        "id": "cheque_1rLks7fM6nSC1jNpidv1fg",
        "object": "cheque",
        "live": false,
        "amount": 10000,
        "bankAccount": "bank_gMpKxPyiGzt1ZwACTmLHHn",
        "currencyCode": "USD",
        "description": "Cool new check",
        "from": {
          "id": "contact_fo3HwdeFZ3wwNuHFAgszHt",
          "object": "contact",
          "addressLine1": "123 MAIN STREET",
          "addressLine2": null,
          "addressStatus": "verified",
          "city": "ATLANTA",
          "companyName": "US Steel",
          "country": "UNITED STATES",
          "countryCode": "US",
          "firstName": "John",
          "lastName": "Quincy",
          "postalOrZip": "12345",
          "provinceOrState": "GA"
        },
        "letterHtml": "Hello {{to.firstName}}",
        "memo": "Invoice 1233",
        "number": 9667,
        "sendDate": "2021-07-19T10:02:28.324Z",
        "status": "ready",
        "to": {
          "id": "contact_f8NLBJXjV82HnM8emVow3r",
          "object": "contact",
          "addressLine1": "5454 WEST 34TH STREET",
          "addressLine2": null,
          "addressStatus": "verified",
          "city": "INDIANAPOLIS",
          "companyName": "Acme Rentals",
          "country": "UNITED STATES",
          "countryCode": "US",
          "firstName": "Steve",
          "lastName": "Smith",
          "postalOrZip": "46224",
          "provinceOrState": "IN"
        },
        "createdAt": "2021-07-19T10:02:28.327Z",
        "updatedAt": "2021-07-19T10:02:28.327Z"
      },
      ...
    ]
  }
}
```

#### [Progress a Test Cheque/Check](https://docs.postgrid.com/#1b2ec7da-980f-43f5-b72a-765100364b31)

This function will move a Test Cheque/Check through the server-side processing
steps, one at a time to allow the caller to verify the webhook calls. This
is **_only_** available for Test Cheques/Checks.

```typescript
const move = await client.check.progress(id)
```

where `id` is the Cheque ID, like `cheque_7GrdUQPmbkAXJg8vLkJK9B`, in the
above example, and the response will be similar to the response from
`client.check.get(id)`.

#### [Delete a Check](https://docs.postgrid.com/#f64aa571-58af-4504-a32f-8f0ced4806c2)

This function will delete - or _Cancel_ a Cheque/Check that's not yet been sent.

```typescript
const drop = await client.check.delete(id)
```

where `id` is the Postcard ID, like `cheque_7GrdUQPmbkAXJg8vLkJK9B`, in the
above example, and the response will be something like:

```javascript
{
  "success": true,
  "check": {
    "id": "cheque_7GrdUQPmbkAXJg8vLkJK9B",
    "object": "cheque",
    "deleted": true
  }
}
```

### Webhook Calls

The PostGrid Webhook is documented on this
[page](https://docs.postgrid.com/#8ab384a4-2ff1-41ce-92fd-8c34fc6c3809) and
is the traditional way for an scynchronous service to alert the client that
something has changed.

#### [Create Webhook](https://docs.postgrid.com/#0c52beac-2f29-4958-b9a8-bef7d3422d5c)

The basic Create Webhook call looks something like this:

```typescript
const letter = await client.webhook.create({
  description: 'Cool new webhook',
  url: 'https://my.service.com/postgrid/callback',
  enabledEvents: ['letter.created'],
})
```

This will create the webhook back to the provided `url`, and will then
be the notification system for any updates for the enabled events. The
response will be something like:

```javascript
{
  "success": true,
  "webhook": {
    "id": "webhook_wb6AAoBMcm1CNwWH3mkbr1",
    "object": "webhook",
    "live": false,
    "description": "Cool new webhook",
    "enabled": true,
    "enabledEvents": [
      "letter.created"
    ],
    "secret": "webhook_secret_uAMxoCjLyHoCFWoA6XvhdC",
    "url": "https://my.service.com/postgrid/callback",
    "createdAt": "2021-07-15T20:11:51.032Z",
    "updatedAt": "2021-07-15T20:11:51.032Z"
  }
}
```

If there had been an error, the response would be:

```javascript
{
  "success": false,
  "error": {
    "type": "PostGrid_type",
    "message": "(Error message from PostGrid...)"
  }
}
```

#### [Get a Webhook](https://docs.postgrid.com/#28dac278-d8c9-4edf-8578-f80697b35aef)

```typescript
const doc = await client.webhook.get(id)
```

where `id` is the Letter ID, like `webhook_wb6AAoBMcm1CNwWH3mkbr1`, in the
above example, and the response will be something like the response to the
`client.webhook.create()` function.

#### [List Webhooks](https://docs.postgrid.com/#c1beb2cf-5930-48ae-9dd2-79dcb5dc9f96)

```typescript
const doc = await client.webhook.list()
```

This will list all the Webhooks assoiated with this API Key, and will do so
in the PostGrid List paging scheme of `limit` and `skip`. These parameters
are optional, and if they are omitted, the defaults are:

* `skip` is `0`
* `limit` is `40`

The response will be something like:

```javascript
{
  "success": true,
  "webhooks": {
    "object": "list",
    "limit": 40,
    "skip": 0,
    "totalCount": 1,
    "data": [
      {
        "id": "webhook_rqjK6m3T71butzwSd7zU4N",
        "object": "webhook",
        "live": false,
        "description": "Cool new webhook",
        "enabled": true,
        "enabledEvents": [
          "letter.created"
        ],
        "secret": "webhook_secret_ve1xLLrBWRfDhjhNZZMRn3",
        "url": "https://my.service.com/postgrid/callback",
        "createdAt": "2021-07-15T20:14:11.060Z",
        "updatedAt": "2021-07-15T20:14:11.060Z"
      }
    ]
  }
}
```

#### [List Webhook Invocations](https://docs.postgrid.com/#2e090c8b-d438-4d6c-989d-864138b7b2ea)

```typescript
const doc = await client.webhook.invocations(id)
```

where `id` is the Webhook ID, like `webhook_rqjK6m3T71butzwSd7zU4N`, in the
above example. This will list all the Webhooks assoiated with this API Key,
and will do so in the PostGrid List paging scheme of `limit` and `skip`.
These parameters are optional, and if they are omitted, the defaults are:

* `skip` is `0`
* `limit` is `40`

The response will be something like:

```javascript
{
  "success": true,
  "invocations": {
    "object": "list",
    "limit": 40,
    "skip": 0,
    "totalCount": 0,
    "data": []
  }
}
```

where, in this case, there have been _no_ invocations on that webhook.

#### [Delete a Webhook](https://docs.postgrid.com/#5436bd24-14c8-4cbb-a0ce-4b816f1b583d)

This function will delete a Webhook that's currently being used for callbacks.

```typescript
const doc = await client.webhook.delete(id)
```

where `id` is the Letter ID, like `webhook_rqjK6m3T71butzwSd7zU4N`, in the
above example, and the response will be something like:

```javascript
{
  "success": true,
  "webhook": {
    "id": "webhook_rqjK6m3T71butzwSd7zU4N",
    "object": "webhook",
    "deleted": true
  }
}
```

### Address Verification Calls

The PostGrid Address Verification is documented on this
[page](https://avdocs.postgrid.com/#intro) and
has both single, and batch address verification, City, State lookup from
a Postal Code, and Address Suggestion endpoints.

#### [Get Lookup Info](https://avdocs.postgrid.com/#3941f8c1-072e-47f4-8906-56295502cf6e)

PostGrid allows some free address lookups, and this call is an easy call
to make to get the status of those free lookups. The call looks something
like this:

```typescript
const info = await client.address.lookupInfo()
```

The response will be something like:

```javascript
{
  "success": true,
  "info": {
    "status": 'success',
    "message": 'Successfully retrieved addver info.',
    "data": { freeLimit: 500, used: 5 }
  }
}
```

If there had been an error, the response would be:

```javascript
{
  "success": false,
  "verified": false,
  "error": {
    "type": "PostGrid_type",
    "message": "(Error message from PostGrid...)"
  }
}
```

#### [Verify an Address](https://avdocs.postgrid.com/#1061f2ea-00ee-4977-99da-a54872de28c2)

The PostGrid freeform address call allows the user to enter addresses like:

```typescript
'2929 Eagledale Dr, Indianapolis, IN'
'3288 Tara Ln, Indianapolis, IN'
```

and so on. These will then be parsed, and verified, if possible by PostGrid.
This function allows for both _freeform_ addresses and _structured_ addresses,
of the form:

```typescript
{
  line1: '3288 Tara Ln',
  city: 'Indianapolis',
  postalOrZip: '46224',
  provinceOrState: 'IN',
}
```

The basic call looks something like this:

```typescript
const address = await client.address.verify('3288 Tara Ln, Indianapolis, IN')
```

or:

```typescript
const address = await client.address.verify({
  line1: '3288 Tara Ln',
  city: 'Indianapolis',
  postalOrZip: '46224',
  provinceOrState: 'IN',
})
```

The response will be something like:

```javascript
{
  "success": true,
  "verified": true,
  "address": {
    "status": 'success',
    "message": 'Address verification processed.',
    "data": {
      "line1": '3288 Tara Ln',
      "city": 'Indianapolis',
      "provinceOrState": 'IN',
      "postalOrZip": '46224',
      "zipPlus4": '2231',
      "country": 'us',
      "countryName": 'UNITED STATES',
      "errors": {},
      "status": 'verified'
    }
  }
}
```

If there had been an error, the response would be:

```javascript
{
  "success": false,
  "verified": false,
  "error": {
    "type": "PostGrid_type",
    "message": "(Error message from PostGrid...)"
  }
}
```

#### [Get Autocomplete Previews](https://avdocs.postgrid.com/#a7c9e3d6-6fb1-4e5f-85da-ab233a264297)

Given just a street address, and an optional `country`, the autocomplete
previews function will return a list of _partial_ addresses of the form:

```typescript
{
  line1: string;
  city?: string;
  provinceOrState?: string;
}
```

This isn't strictly what is returned from PostGrid, but this client is
trying to simplify the different data models on the return sets, so we
have attempted to model it after the structured address as well.

The basic call looks something like this:

```typescript
const list = await client.address.autocompletePreviews('77 main st')
```

The response will be something like:

```javascript
{
  "success": true,
  "previews": {
    "status": 'success',
    "message": 'Retrieved verified address completions successfully.',
    "data": [
      { "line1": '77 N MAIN ST', "city": undefined, "provinceOrState": 'UT' },
      { "line1": '77 S MAIN ST', "city": undefined, "provinceOrState": 'UT' },
      { "line1": '77 N MAIN ST', "city": undefined, "provinceOrState": 'UT' },
      { "line1": '77 S MAIN ST', "city": undefined, "provinceOrState": 'UT' },
      { "line1": '77 E MAIN ST', "city": undefined, "provinceOrState": 'UT' },
      { "line1": '77 W MAIN ST', "city": undefined, "provinceOrState": 'UT' },
      { "line1": '77 N MAIN ST', "city": 'ABERDEEN', "provinceOrState": 'ID' },
      { "line1": '77 S MAIN ST', "city": 'ABERDEEN', "provinceOrState": 'ID' },
      { "line1": '77 N MAIN ST', "city": 'ABERDEEN', "provinceOrState": 'SD' },
      { "line1": '77 S MAIN ST', "city": 'ABERDEEN', "provinceOrState": 'SD' }
    ]
  }
}
```

If there had been an error, the response would be:

```javascript
{
  "success": false,
  "verified": false,
  "error": {
    "type": "PostGrid_type",
    "message": "(Error message from PostGrid...)"
  }
}
```

#### [Autocomplete an Address](https://avdocs.postgrid.com/#ef1764c6-d9e3-4caa-85d0-7694ec334bdb)

Given an address, city and state - such as you'd get from a _Preview_, above,
you can get the complete address with a call that looks something like this:

```typescript
const info = await client.address.autocompleteAddress({
  line1: '77 S MAIN ST',
  city: 'ABERDEEN',
  provinceOrState: 'SD',
})
```

The response will be something like:

```javascript
{
  "success": true,
  "previews": {
    "status": 'success',
    "message": 'Retrieved verified address completions successfully.',
    "data": [
      {
        line1: '77 S MAIN ST',
        city: 'ABERDEEN',
        provinceOrState: 'SD',
        postalOrZip: '57401',
        country: 'US'
      }
    ]
  }
}
```

If there had been an error, the response would be:

```javascript
{
  "success": false,
  "verified": false,
  "error": {
    "type": "PostGrid_type",
    "message": "(Error message from PostGrid...)"
  }
}
```

#### [Batch Verify Addresses](https://avdocs.postgrid.com/#94520412-5072-4f5a-a2e2-49981b66a347)

Starting with either a freeform or structured address, this function can
return each of the addresses, parsed - if necessary, and then individually
verified, and tagged. The call can look something like this:

```typescript
const info = await client.address.batchVerify([
  '3288 Tara Ln, Indianapolis, IN 46224',
  '3000 Tara Ln, Indianapolis, IN 46224',
  {
    line1: '77 S MAIN ST',
    city: 'ABERDEEN',
    provinceOrState: 'SD',
    postalOrZip: '57401',
  },
])
```

In this example, the middle address is **_not_** valid, and the response
will be something like:

```javascript
{
  "success": true,
  "addresses": {
    "status": 'success',
    "message": 'Verified address batch successfully.',
    "data": [
      {
        "line1": '3288 Tara Ln',
        "city": 'Indianapolis',
        "postalOrZip": '46224',
        "provinceOrState": 'IN',
        "country": 'us',
        "countryName": 'UNITED STATES',
        "zipPlus4": '2231',
        "status": 'verified',
        "errors": {}
      },
      {
        "line1": '3000 Tara Ln  ',
        "city": 'Indianapolis',
        "postalOrZip": '46224',
        "provinceOrState": 'in',
        "status": 'failed',
        "errors": {}
      },
      {
        "line1": '77 S Main St',
        "city": 'Aberdeen',
        "postalOrZip": '57401',
        "provinceOrState": 'SD',
        "country": 'us',
        "countryName": 'UNITED STATES',
        "zipPlus4": '4218',
        "status": 'verified',
        "errors": {}
      }
    ]
  }
}
```

Where it's important to note that the `status` of the middle Address in the
returned Array is `'failed'` - meaning taht the address provided could not
by verified.

If there had been an error, the response would be:

```javascript
{
  "success": false,
  "verified": false,
  "error": {
    "type": "PostGrid_type",
    "message": "(Error message from PostGrid...)"
  }
}
```


#### [Suggest Addresses](https://avdocs.postgrid.com/#90361258-5526-4dd9-b6e6-faa83758b3c1)

At times, you may have an address, either freeform, or structured, that
might not be exactly right, and you need to see if there are addresses
that are _close_ to that address - to see if you can find a match.
This is the purpose of this function - to take an _estimated address_ and
return the nearest hits.

The call looks something like this:

```typescript
const info = await client.address.suggestAddresses({
  line1: '77 MAIN ST',
  city: 'ABERDEEN',
  provinceOrState: 'SD',
})
```

And the response will be something like:

```javascript
{
  "success": true,
  "addresses": {
    "status": 'success',
    "message": 'Address suggestions retrieved successfully.',
    "data": [
      {
        "city": 'Aberdeen',
        "country": 'us',
        "countryName": 'UNITED STATES',
        "errors": {},
        "line1": '77 N Main St',
        "postalOrZip": '57401',
        "provinceOrState": 'SD',
        "status": 'verified',
        "zipPlus4": '3428'
      },
      {
        "city": 'Aberdeen',
        "country": 'us',
        "countryName": 'UNITED STATES',
        "errors": {},
        "line1": '77 S Main St',
        "postalOrZip": '57401',
        "provinceOrState": 'SD',
        "status": 'verified',
        "zipPlus4": '4218'
      },
      ...
    },
  ]
  }
}
```

If there had been an error, the response would be:

```javascript
{
  "success": false,
  "verified": false,
  "error": {
    "type": "PostGrid_type",
    "message": "(Error message from PostGrid...)"
  }
}
```

#### [Parse an Address](https://avdocs.postgrid.com/#cd929454-227c-4a31-9a0b-7896099e52d1)

PostGrid can take a freeform address and simply parse it into it's
components without verification, and the call looks something like this:

```typescript
const info = await client.address.parseAddress('3288 Tara Ln, Indianapolis, IN 46224')
```

And the response will be something like:

```javascript
{
  "success": true,
  "address": {
    "status": 'success',
    "message": 'Success.',
    "data": {
      "city": 'indianapolis',
      "houseNumber": '3288',
      "postcode": '46224',
      "road": 'tara ln',
      "state": 'in'
    }
  }
}
```

If there had been an error, the response would be:

```javascript
{
  "success": false,
  "verified": false,
  "error": {
    "type": "PostGrid_type",
    "message": "(Error message from PostGrid...)"
  }
}
```

#### [Look up City/State from Postal Code](https://avdocs.postgrid.com/#10bac08c-301f-4441-af95-0042c25b4298)

At times, you have the postal code, and need to know the city and state
of that code. This function is designed for that, with a call that looks
something like this:

```typescript
const info = await client.address.lookupCityState('60540')
```

And the response will be something like:

```javascript
{
  "success": true,
  "address": {
    "status": 'success',
    "message": 'Success.',
    "data": {
      "city": 'NAPERVILLE',
      "provinceOrState": 'IL'
    }
  }
}
```

Where it's important to note that the `status` of the middle Address in the
returned Array is `'failed'` - meaning taht the address provided could not
by verified.

If there had been an error, the response would be:

```javascript
{
  "success": false,
  "verified": false,
  "error": {
    "type": "PostGrid_type",
    "message": "(Error message from PostGrid...)"
  }
}
```

## Development

For those interested in working on the library, there are a few things that
will make that job a little simpler. The organization of the code is all in
`src/`, with one module per _section_ of the Client: `contact`, `letter`,
`template`, etc. This makes location of the function very easy.

Additionally, the main communication with the PostGrid service is in the
`src/index.ts` module in the `fire()` function. In the constructor for the
Client, each of the _sections_ are created, and then they link back to the
main class for their communication work.

### Setup

In order to work with the code, the development dependencies include `dotenv`
so that each user can create a `.env` file with a single value for working
with PostGrid:

* `POSTGRID_API_KEY` - this is the API Key referred to, above, and can be
   created on the PostGrid Dashboard
   [page](https://dashboard.postgrid.com/dashboard)

### Testing

There are several test scripts that create, test, and tear-down, state on the
PostGrid service exercising different parts of the API. Each is
self-contained, and can be run with:

```bash
$ npm run ts tests/contacts.ts
creating a single Contact...
Success!
fetching a single Contact...
Success!
listing the first page of 40 Contacts...
Success!
deleting a single Contact...
Success!
```

Each of the tests will run a series of calls through the Client, and check the
results to see that the operation succeeded. As shown, if the steps all
report back with `Success!` then things are working.

If there is an issue with one of the calls, then an `Error!` will be printed
out, and the data returned from the client will be dumped to the console.
