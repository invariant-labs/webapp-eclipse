import { Grid, Box } from '@mui/material'
import { useStyles } from './styles'
import { BuyComponent } from '@components/PreSale/BuyComponent/BuyComponent'
import { SaleStepper } from '@components/PreSale/SaleStepper/SaleStepper'
import { RoundComponent } from '@components/PreSale/RoundComponent/RoundComponent'
import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { actions } from '@store/reducers/sale'
import { saleSelectors } from '@store/selectors/sale'
import { BN } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { printBN } from '@utils/utils'
import {
  getAmountTillNextPriceIncrease,
  getRound,
  getTierPrices,
  MINT_DECIMALS
} from '@invariant-labs/sale-sdk'

import { getPrice } from '@invariant-labs/sale-sdk/lib/utils'

export const PreSaleWrapper = () => {
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const isLoadingSaleStats = useSelector(saleSelectors.isLoadingSaleStats)
  const isLoadingUserStats = useSelector(saleSelectors.isLoadingUserStats)
  const saleStats = useSelector(saleSelectors.saleStats)
  const userStats = useSelector(saleSelectors.userStats)

  const { targetAmount, currentAmount, whitelistWalletLimit } = useMemo(
    () =>
      saleStats
        ? saleStats
        : {
            targetAmount: new BN(0),
            currentAmount: new BN(0),
            whitelistWalletLimit: new BN(0),
            mint: new PublicKey(0)
          },
    [saleStats]
  )

  const { deposited } = useMemo(
    () =>
      userStats
        ? userStats
        : {
            deposited: { amount: new BN(0), decimals: 0 },
            received: { amount: new BN(0), decimals: 0 }
          },
    [userStats, isLoadingUserStats]
  )

  const round = useMemo(
    () => (!targetAmount.isZero() ? getRound(currentAmount, targetAmount) ?? 0 : 0),
    [saleStats, isLoadingSaleStats, isLoadingUserStats]
  )

  const { remainingAmount, remainingAmountDecimals } = useMemo(
    () =>
      !whitelistWalletLimit.isZero()
        ? {
            remainingAmount: whitelistWalletLimit.sub(deposited.amount),
            remainingAmountDecimals: deposited.decimals
          }
        : { remainingAmount: new BN(0), remainingAmountDecimals: 0 },
    [deposited, whitelistWalletLimit, isLoadingSaleStats, isLoadingUserStats]
  )

  const filledPercentage = useMemo(
    () =>
      !whitelistWalletLimit.isZero()
        ? new BN(deposited.amount).muln(100).div(whitelistWalletLimit).toNumber()
        : 0,
    [deposited, whitelistWalletLimit, isLoadingSaleStats, isLoadingUserStats]
  )

  const amountTillPriceIncrease = useMemo(
    () =>
      !targetAmount.isZero()
        ? getAmountTillNextPriceIncrease(currentAmount, targetAmount)
        : new BN(0),
    [currentAmount, targetAmount, isLoadingSaleStats]
  )

  const { prices: tierPrices, decimals: tierDecimals } = useMemo(() => getTierPrices(), [])

  const currentPrice = useMemo(
    () => getPrice(currentAmount, targetAmount) ?? new BN(0),
    [currentAmount, targetAmount, isLoadingSaleStats]
  )

  useEffect(() => {
    dispatch(actions.getSaleStats())
    dispatch(actions.getUserStats())
  }, [dispatch])

  return (
    <Grid className={classes.pageWrapper}>
      <Box className={classes.infoContainer}>
        <Box className={classes.contentWrapper}>
          <Grid className={classes.stepperContainer}>
            <SaleStepper
              steps={tierPrices.map((price, idx) => {
                return { id: idx + 1, label: `$${printBN(price, tierDecimals)}` }
              })}
            />
            <Box className={classes.roundComponentContainer}>
              <RoundComponent
                isActive
                tokensLeft=''
                amountBought={printBN(currentAmount, MINT_DECIMALS)}
                amountLeft={printBN(
                  amountTillPriceIncrease.amountTillNextPriceIncrease,
                  amountTillPriceIncrease.decimals
                )}
                currentPrice={printBN(currentPrice.price, currentPrice.decimals)}
                nextPrice={printBN(currentPrice.nextPrice, currentPrice.decimals)}
                percentageFilled={filledPercentage}
                purchasedTokens={printBN(deposited.amount, deposited.decimals)}
                remainingAllocation={printBN(remainingAmount.amount, remainingAmountDecimals)}
                roundNumber={round}
                currency='USDC'
              />
            </Box>
          </Grid>
          <BuyComponent
            isActive
            raisedAmount={printBN(currentAmount, MINT_DECIMALS)}
            totalAmount={printBN(targetAmount, MINT_DECIMALS)}
            alertBoxText='Test message'
          />
        </Box>
      </Box>
    </Grid>
  )
}
