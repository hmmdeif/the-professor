# Deribit Trading Bot

## Install

```
npm install
```

## Config

Copy `.env.sample` and name it `.env`. Replace variables inside with your api key details. Preferably create a subaccount and use that. Use `ENV=test` for using the test api and `ENV=anything_else` for live.

Removing `TIMEFRAME` defaults to 3 minute timeframe.
Removing `INSTRUMENTNAME` defaults to `BTC-PERPETUAL`.
Removing `CONTRACT_SIZE` defaults to 10 contracts as the first order (then 20 then 50).
Removing `AGGRESSION` defaults to a value of 1. The higher the number the closer the orders will be placed to the BB edge. N.B. Not implemented yet!

## Run

```
npm start
```

## Liability

Use at your own risk if you're going to use real money. This is not battle hardened and fully tested and I accept no responsibility for any monetary losses incurred from using this software.