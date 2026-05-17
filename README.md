# USPS v3 API JavaScript Library

Library for interfacing with the USPS v3 API. The USPS v3 API replaces the legacy Web Tools API.

### Installation

```bash
npm i @nextform/usps-v3
```

### Usage

Import and configure the library

```javascript
import { USPS } from '@nextform/usps-v3'

const usps = new USPS({
  clientId: USPS_CLIENT_ID,
  clientSecret: USPS_CLIENT_SECRET,
})
```

Validate an address

```javascript
const data = await usps.getAddress({
  streetAddress: '302 Riverside Drive',
  city: 'Melbourne Beach',
  state: 'FL',
})

// Response:
//
// {
//   firm: '',
//   address: {
//     streetAddress: '302 RIVERSIDE DR',
//     streetAddressAbbreviation: '302 RIVERSIDE DR',
//     secondaryAddress: '',
//     cityAbbreviation: 'MELBOURNE BCH',
//     city: 'MELBOURNE BCH',
//     state: 'FL',
//     ZIPCode: '32951',
//     ZIPPlus4: '2142',
//     urbanization: ''
//   },
//   additionalInfo: {
//     deliveryPoint: '02',
//     carrierRoute: 'C001',
//     DPVConfirmation: 'Y',
//     DPVCMRA: 'N',
//     business: 'N',
//     centralDeliveryPoint: 'N',
//     vacant: 'N'
//   },
//   corrections: [ { code: '', text: '' } ],
//   matches: [ { code: '31', text: 'Single Response - exact match' } ]
// }
```

Look up a city/state by ZIP code

```javascript
const data = await usps.getCityState({
  ZIPCode: '90210',
})

// Response:
//
// {
//    city: 'BEVERLY HILLS',
//    state: 'CA',
//    ZIPCode: '90210'
// }
```

### Environment Configuration

By default, the library uses the production USPS API endpoint (`https://apis.usps.com`). For development and testing purposes, you can configure the library to use the USPS Testing Environment endpoint by setting the `environment` option to `'testing'`.

```javascript
const usps = new USPS({
  clientId: USPS_TEST_CLIENT_ID,
  clientSecret: USPS_TEST_CLIENT_SECRET,
  environment: 'testing', // Uses https://apis-tem.usps.com
})
```

**Note:** You'll need separate credentials for the testing environment. Contact USPS to obtain testing environment credentials.

### Title Case Conversion

The USPS v3 API returns all caps for address fields by default. This library can automatically convert the fields to a more human-readable title case if desired. To enable this feature, set the `useTitleCase` option to `true` when creating the USPS instance.

```javascript
const usps = new USPS({
  clientId: USPS_CLIENT_ID,
  clientSecret: USPS_CLIENT_SECRET,
  useTitleCase: true,
})

const data = await usps.getAddress({
  streetAddress: '302 Riverside Drive',
  city: 'Melbourne Beach',
  state: 'FL',
})

// Response:
//
// {
//   firm: '',
//   address: {
//     streetAddress: '302 Riverside Dr',
//     ...

const data = await usps.getCityState({
  ZIPCode: '90210',
})

// Response:
//
// {
//    city: 'Beverly Hills',
//    ...
```
