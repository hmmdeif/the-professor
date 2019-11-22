import { Client } from '../client'
import { instruments } from '../state'
import { adjustOrders } from '../order-management/adjust-orders'

export const updateIndicators = (conn: Client, resolution: number, data: any, method: string, params: any) => {
  // console.log('received response', params)
  if (data.status === 'ok') {
    const len = data.close.length
    let totalClose = 0
    for (const close of data.close) {
      totalClose += close
    }
    const ma = totalClose / len

    let deviationTotal = 0
    for (const close of data.close) {
      const diff = close - ma
      deviationTotal += diff * diff
    }

    const deviation = Math.sqrt(deviationTotal / len)
    instruments[params.instrument_name].indicators.bb.upper = ma + (2 * deviation)
    instruments[params.instrument_name].indicators.bb.middle = ma
    instruments[params.instrument_name].indicators.bb.lower = ma - (2 * deviation)
    adjustOrders(conn, params.instrument_name)
  }
}