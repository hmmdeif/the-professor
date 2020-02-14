import { instrument, conn } from '../state'
import { updateIndicators } from './update-indicator-data'

const convertResolutionToString = (resolution: number): [string, number] => {
  switch (resolution) {
  case 60 * 24:
    return ['1D', 1]
  case 240:
    return ['120', 2]
  }
  return [resolution.toString(), 1]
}

export const getTradingViewData = (startDate: Date, endDate: Date, resolution: number) => {
  let [res, multiplier] = convertResolutionToString(resolution)
  conn.sendData('public/get_tradingview_chart_data', {
    instrument_name: instrument.name,
    start_timestamp: startDate.valueOf(),
    end_timestamp: endDate.valueOf(),
    resolution: res
  }, updateIndicators.bind(null, resolution, multiplier))
}
