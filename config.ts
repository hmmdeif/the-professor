import { config } from 'dotenv'
config()

const getServerUrl = (mode: string): string => {
  let url = 'wss://test.deribit.com/ws/api/v2'
  if (mode && mode.toLowerCase() !== 'test') {
    url = url.replace('test', 'www')
  }
  return url
}

export const env = {
  server: getServerUrl(process.env.MODE),
  client_id: process.env.CLIENTID,
  client_secret: process.env.CLIENTSECRET,
  instrument: process.env.INSTRUMENTNAME || 'BTC-PERPETUAL'
}