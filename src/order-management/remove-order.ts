import { instruments } from '../state'

export const removeOrderIfExists = (order: any) => {
  let found = false
  let i = 0
  for (const openOrder of instruments[order.instrument_name].orders) {
    if (openOrder.id === order.order_id) {
      found = true
      break
    }
    ++i
  }

  if (found) {
    instruments[order.instrument_name].orders.splice(i, 1)
  }
}