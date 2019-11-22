import { instruments } from '../state'

export const updateTicker = (data: any) => {
  const update = (info: any) => {
    instruments[info.instrument_name].bid = info.best_bid_price
    instruments[info.instrument_name].ask = info.best_ask_price
  }

  if (Array.isArray(data)) {
    for (const d of data) {
      update(d)
    }
  } else {
    update(data)
  }
}