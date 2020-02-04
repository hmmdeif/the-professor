import { instrument } from '../state'

export const updateTicker = (data: any) => {
  const update = (info: any) => {
    instrument.bid = info.best_bid_price
    instrument.ask = info.best_ask_price
  }

  if (Array.isArray(data)) {
    for (const d of data) {
      update(d)
    }
  } else {
    update(data)
  }
}