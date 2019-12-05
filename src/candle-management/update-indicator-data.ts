import { Client } from '../client'
import { instruments } from '../state'
import { adjustOrders } from '../order-management/adjust-orders'
import chalk = require('chalk');
const tulind = require('tulind');

const calculateBB = async (data: any, params: any) => {
  const bb = await tulind.indicators.bbands.indicator([data.close], [20, 2])

  instruments[params.instrument_name].indicators.bb.lower = bb[0][bb[0].length - 1]
  instruments[params.instrument_name].indicators.bb.middle = bb[1][bb[1].length - 1]
  instruments[params.instrument_name].indicators.bb.upper = bb[2][bb[2].length - 1]
}

const calculateADX = async (data: any, params: any) => {
  const adx = await tulind.indicators.adx.indicator([data.high, data.low, data.close], [14])
  instruments[params.instrument_name].indicators.adx = adx[0][adx[0].length - 1]
  // console.log(instruments[params.instrument_name].indicators.adx)
}

export const updateIndicators = async (conn: Client, resolution: number, data: any, method: string, params: any) => {
  // console.log('received response', params)
  if (data.status === 'ok') {
    console.log('Received new candles, recalculating indicators and orders...')
    console.log('Current price - ' + chalk.blue('$' + data.close[data.close.length - 1]))
    await calculateBB(data, params)
    await calculateADX(data, params)
    adjustOrders(conn, params.instrument_name)
  }
}