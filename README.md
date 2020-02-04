# Deribit Trading Bot

## Install

```
npm install
```

## Config

Copy `.env.sample` and name it `.env`. Replace variables inside with your api key details. Preferably create a subaccount and use that. Use `ENV=test` for using the test api and `ENV=anything_else` for live.

Removing `INSTRUMENTNAME` defaults to `BTC-PERPETUAL`.

## Strategy

Included is a sample strategy (`src/strategy/bb.ts`) that is not profitable but gives a good example of how the bot executes. To create your own simply extend the `BaseStrategy` class and implement the methods.

`startCandleGrabLoop` is executed when the bot starts. It allows you to request trading view data at any resolution and for as many candles as you like. The base strategy starts a loop for you at the resolution that it is instantiated at.

`candleDataReceived` is executed once the trading view data has been received. This is where you should do your technical analysis and place your orders.

`placeExits` is executed in two cases. The first is if you have a position already open when the bot starts, in which case you will receive the order history to work out where to place your exits appropriately. The second is when an order is filled and a new position is created or updated so you can place your exits appropriately.

After creating and implementing your strategy, change the line in `src/state.ts` to instantiate your chosen strategy.

## Run

```
npm start
```

## Liability

Use at your own risk if you're going to use real money. This is not battle hardened and fully tested and I accept no responsibility for any monetary losses incurred from using this software.