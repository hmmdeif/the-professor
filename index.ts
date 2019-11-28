import { Client } from './src/client'
import { DeribitResponse } from './src/models/deribit-response'
import { instruments, InstrumentOrder } from './src/state'
import { getOpenOrders } from './src/order-management/get-open-orders'
import { stopRequesting } from './src/candle-management/trading-view-data'
import { removeOrderIfExists } from './src/order-management/remove-order'
import { updateTicker } from './src/candle-management/update-ticker'
import { updateOrders } from './src/order-management/update-order-state'
import { env } from './config'

const processMessage = (data: DeribitResponse) => {
  // console.log('received message', data)
  switch  (data.method) {
    case 'subscription':
      if (data.params.channel === `ticker.${env.instrument}.100ms`) {
        updateTicker(data.params.data)
      }
      if (data.params.channel === `user.orders.${env.instrument}.100ms`) {
        updateOrders(conn, data.params.data)
      }
      break
  }
}

const cancelAllOrders = () => {
  for (let instrument in instruments) {
    for (const order of instruments[instrument].orders) {
      conn.sendData('private/cancel', { order_id: order }, removeOrderIfExists)
    }
  }
  conn.sendData('private/cancel_all')
}

const subscribe = () => {
  // cancelAllOrders()
  conn.sendData('private/subscribe', {
    channels: [
      `ticker.${env.instrument}.100ms`,
      `user.orders.${env.instrument}.100ms`
    ]
  }, getOpenOrders.bind(null, conn, env.instrument))
  conn.sendData('private/enable_cancel_on_disconnect')
}

// Set up local state. Might expand later so you can trade multiple instruments on a single account
instruments[env.instrument] = {
  bid: 0,
  ask: 1000000000,
  indicators: {
    bb: {}
  },
  orders: [] as InstrumentOrder[],
  position: {
    amount: 0,
    price: 0,
    direction: 'buy'
  }
}

const conn = new Client()
conn.on('message', processMessage)
conn.on('authed', subscribe)
conn.on('closed', stopRequesting)
conn.open()