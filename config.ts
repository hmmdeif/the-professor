import { config } from 'dotenv'
config()

const getServerUrl = (mode: string): string => {
  let url = 'wss://testapp.deribit.com/ws/api/v2'
  if (mode && mode.toLowerCase() !== 'test') {
    url = url.replace('test', '')
  }
  return url
}

export const env = {
  server: getServerUrl(process.env.MODE),
  client_id: process.env.CLIENTID,
  client_secret: process.env.CLIENTSECRET,
  resolution: parseInt(process.env.TIMEFRAME, 10) || 3,
  instrument: process.env.INSTRUMENTNAME || 'BTC-PERPETUAL',
  size: parseInt(process.env.CONTRACT_SIZE, 10) || 10,
  aggression: parseInt(process.env.AGGRESSION, 10) || 1
}