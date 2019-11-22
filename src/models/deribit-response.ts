export class DeribitResponse {
  jsonrpc: string
  id?: number
  usIn?: number
  usOut?: number
  usDiff?: number
  testnet?: boolean
  result?: any
  error?: any

  params?: any
  method?: string
}