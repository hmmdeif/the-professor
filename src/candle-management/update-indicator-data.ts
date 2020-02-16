import chalk = require('chalk');
import { strategy } from '../state';


export const updateIndicators = async (resolution: number, multiplier: number, orderHistoryCall: boolean, data: any) => {
  // console.log('received response', params)
  if (data.status === 'ok') {
    console.log('Received new candles, recalculating indicators and orders...')
    console.log('Current price - ' + chalk.blue('$' + data.close[data.close.length - 1]))
    await strategy.candleDataReceived(resolution, multiplier, orderHistoryCall, data)
  }
}