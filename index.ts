import { DeribitResponse } from './src/models/deribit-response'
import { instrument, conn, strategy } from './src/state'
import { getOpenOrders } from './src/order-management/get-open-orders'
import { removeOrderIfExists } from './src/order-management/remove-order'
import { updateTicker } from './src/candle-management/update-ticker'
import { updateOrders } from './src/order-management/update-order-state'

const processMessage = (data: DeribitResponse) => {
  // console.log('received message', data)
  switch  (data.method) {
    case 'subscription':
      if (data.params.channel === `ticker.${instrument.name}.100ms`) {
        updateTicker(data.params.data)
      }
      if (data.params.channel === `user.orders.${instrument.name}.100ms`) {
        updateOrders(data.params.data)
      }
      break
  }
}

const cancelAllOrders = () => {
  for (const order of instrument.orders) {
    conn.sendData('private/cancel', { order_id: order }, removeOrderIfExists)
  }
  conn.sendData('private/cancel_all')
}

const subscribe = () => {
  // cancelAllOrders()
  conn.sendData('private/subscribe', {
    channels: [
      `ticker.${instrument.name}.100ms`,
      `user.orders.${instrument.name}.100ms`
    ]
  }, getOpenOrders.bind(null))
  conn.sendData('private/enable_cancel_on_disconnect')
}

conn.on('message', processMessage)
conn.on('authed', subscribe)
conn.on('closed', strategy.stopRequesting)
conn.open()