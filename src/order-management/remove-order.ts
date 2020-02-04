import { instrument, InstrumentOrder } from '../state'

export const removeOrderIfExists = (order: any) => {
  instrument.orders = instrument.orders.filter((o: InstrumentOrder) => o.id !== order.order_id)
}