import { titleCase } from './title-case'

// USPSToken type with exp property as a number and any other arbirary properties
type USPSAuthResponse = {
  access_token: string
  token_type: string
  issued_at: number // USPS provides in milliseconds
  expires_in: number // USPS provides in seconds
  status: string
  scope: string
  issuer: string
  client_id: string
  application_name: string
  api_products: string[]
  public_key: string
}

type GetAddressParams = {
  firm?: string
  streetAddress: string
  secondaryAddress?: string
  city?: string
  state: string
  urbanization?: string
  ZIPCode?: string
  ZIPPlus4?: string
}

type GetCityStateParams = {
  ZIPCode: string
}

type AddressResponseError = {
  message: string
  [key: string]: string // Allows for other string properties on the error object
}

type AddressResponse = {
  firm: string
  address: Record<string, string>
  additionalInfo: Record<string, string>
  error?: AddressResponseError
  [key: string]: string | Record<string, string> | undefined
}

type CityStateResponse = {
  city: string
  state: string
  ZIPCode: string
  error?: AddressResponseError
  [key: string]: string | Record<string, string> | undefined
}

export class USPS {
  readonly baseUrl: string
  readonly clientId: string
  readonly clientSecret: string
  readonly useTitleCase: boolean
  private accessToken = ''
  private expiresAt = 0

  constructor({
    clientId = '',
    clientSecret = '',
    useTitleCase = false,
    environment = 'production',
  }: {
    clientId?: string
    clientSecret?: string
    useTitleCase?: boolean
    environment?: 'production' | 'testing'
  }) {
    const productionUrl = 'https://apis.usps.com'
    const testingUrl = 'https://apis-tem.usps.com'

    if (!clientId || !clientSecret) {
      throw new Error('USPS clientId and clientSecret are required')
    }

    this.baseUrl = environment === 'production'
        ? productionUrl
        : testingUrl

    this.clientId = clientId
    this.clientSecret = clientSecret
    this.useTitleCase = useTitleCase
  }

  private async getAccessToken() {
    const body = {
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      response_type: 'code',
      scope: 'addresses',
    }

    const response = await fetch(`${this.baseUrl}/oauth2/v3/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = (await response.json()) as USPSAuthResponse
    if (!data.access_token || !data.expires_in) {
      throw new Error('Failed to get access token from USPS')
    }

    this.accessToken = data.access_token
    this.expiresAt = data.issued_at + data.expires_in * 1000
  }

  private async authorize(): Promise<void> {
    if (this.accessToken && this.expiresAt - Date.now() > 60000) return // 1 minute before expiration
    await this.getAccessToken()
  }

  async getAddress(params: GetAddressParams): Promise<AddressResponse> {
    await this.authorize()

    const query = new URLSearchParams(params)

    const response = await fetch(`${this.baseUrl}/addresses/v3/address?${query}`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    })

    const data = (await response.json()) as AddressResponse
    if (data.error) return data

    if (this.useTitleCase) {
      data.address.streetAddress = titleCase(data.address.streetAddress)
      data.address.streetAddressAbbreviation = titleCase(data.address.streetAddressAbbreviation)
      data.address.secondaryAddress = titleCase(data.address.secondaryAddress)
      data.address.cityAbbreviation = titleCase(data.address.cityAbbreviation)
      data.address.city = titleCase(data.address.city)
    }

    return data
  }

  async getCityState(params: GetCityStateParams): Promise<CityStateResponse> {
    await this.authorize()

    const query = new URLSearchParams(params)

    const response = await fetch(`${this.baseUrl}/addresses/v3/city-state?${query}`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    })

    const data = (await response.json()) as CityStateResponse
    if (data.error) return data

    if (this.useTitleCase) {
      data.city = titleCase(data.city)
    }

    return data
  }
}
