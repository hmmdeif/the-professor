import { instrument, conn } from '../state'
import { updateIndicators } from './update-indicator-data'

export const getTradingViewData = (startDate: Date, endDate: Date, resolution: number) => {
  conn.sendData('public/get_tradingview_chart_data', {
    instrument_name: instrument.name,
    start_timestamp: startDate.valueOf(),
    end_timestamp: endDate.valueOf(),
    resolution: resolution
  }, updateIndicators.bind(null, resolution))
}
