# postgrid-node-client

`postgrid-node-client` is a Node/JS and TypeScript Client for
[PostGrid](https://postgrid.com) that allows you to use normal Node
syntax to send PDFs, and other documents, through Postal Delivery to
recipients. [PostGrid](https://postgrid.com) has a set of REST
[endpoints](https://docs.postgrid.com/#test-mode)
but this affords some nice convenience features for the Node developer.

## Install

```bash
# with npm
$ npm install postgrid-node-client
```

## Usage

This README isn't going to cover all the specifics of what PostGrid is,
and how to use it - it's targeted as a _companion_ to the PostGrid developer
[docs](https://docs.postgrid.com/#test-mode) that explain each of the endpoints
and how the general PostGrid workflow works.

However, we'll put in plenty of examples so that it's clear how to use this
library to interact with PostGrid.

### Getting your API Key

As documented on the PostGrid site, the first step is getting an API Key
for the calls to PostGrid. This is available on their Dashboard
[page](https://dashboard.postgrid.com/dashboard), once you login. For the
rest of this document, the API Key will be seen as: `[Your API Key]`, and will
need to be replaced with the API Key you obtain from the site.

### Creating the Client

All PostGrid functions are available from the client, and the basic
construction of the client is:

```typescript
import { PostGrid } from 'postgrid-node-client'
const client = new PostGrid('[Your API Key]')
```

If you'd like to provide the webhook URL in the constructor, you can do that
with:

```typescript
const client = new PostGrid(
  '[Your API Key]',
  {
    webhookUrl: 'https://my.service.com/postgrid/callback',
    webhookSecret: 'abc123456the-tall-brown-bear',
    webhookEvents: ['letter.created', 'letter.updated'],
  }
)
```

where the options can include:

* `webhookUrl` - the URL for all Notarize updates to be sent
* `webhookSecret` - the JWT encryption secret for the payload on the
  webhook so that it's safe in transmission back to the service.
* `webhookEvents` - the array of strings that are the events that this
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
  "errors": [ "(Error message from Notarize.com...)" ]
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
  "errors": [ "(Error message from Notarize.com...)" ]
}
```

It's important to remember that if the same Contact information is supplied,
PostGrid will not create a new Contact - simply reuse the one it already has.

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
  "errors": [ "(Error message from Notarize.com...)" ]
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
