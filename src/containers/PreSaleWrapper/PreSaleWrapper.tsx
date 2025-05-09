import { Grid, Box } from '@mui/material'
import { useStyles } from './styles'
import { BuyComponent } from '@components/PreSale/BuyComponent/BuyComponent'
import { SaleStepper } from '@components/PreSale/SaleStepper/SaleStepper'
import { RoundComponent } from '@components/PreSale/RoundComponent/RoundComponent'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { actions } from '@store/reducers/sale'
import { actions as walletActions } from '@store/reducers/solanaWallet'
import { saleSelectors } from '@store/selectors/sale'
import { BN } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { printBN } from '@utils/utils'
import { getRound, getTierPrices } from '@invariant-labs/sale-sdk'
import { balanceLoading, status, poolTokens } from '@store/selectors/solanaWallet'
import {
  getAmountTillNextPriceIncrease,
  getPrice,
  getTimestampSeconds
} from '@invariant-labs/sale-sdk/lib/utils'
import { ProgressState } from '@common/AnimatedButton/AnimatedButton'

export const PreSaleWrapper = () => {
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const isLoadingSaleStats = useSelector(saleSelectors.isLoadingSaleStats)
  const isLoadingUserStats = useSelector(saleSelectors.isLoadingUserStats)
  const saleStats = useSelector(saleSelectors.saleStats)
  const userStats = useSelector(saleSelectors.userStats)
  const { success, inProgress } = useSelector(saleSelectors.deposit)
  const tokens = useSelector(poolTokens)
  const walletStatus = useSelector(status)
  const isBalanceLoading = useSelector(balanceLoading)
  const [progress, setProgress] = useState<ProgressState>('none')
  const [tokenIndex, setTokenIndex] = useState<number | null>(null)

  useEffect(() => {
    let timeoutId1: NodeJS.Timeout
    let timeoutId2: NodeJS.Timeout

    if (!inProgress && progress === 'progress') {
      setProgress(success ? 'approvedWithSuccess' : 'approvedWithFail')

      timeoutId1 = setTimeout(() => {
        setProgress(success ? 'success' : 'failed')
      }, 500)

      timeoutId2 = setTimeout(() => {
        setProgress('none')
        dispatch(actions.setDepositSuccess(false))
      }, 1800)
    }

    return () => {
      clearTimeout(timeoutId1)
      clearTimeout(timeoutId2)
    }
  }, [success, inProgress])

  const { targetAmount, currentAmount, whitelistWalletLimit, startTimestamp, duration, mint } =
    useMemo(
      () =>
        saleStats
          ? saleStats
          : {
              targetAmount: new BN(0),
              currentAmount: new BN(0),
              whitelistWalletLimit: new BN(0),
              startTimestamp: new BN(0),
              duration: new BN(0),
              mint: new PublicKey(0)
            },
      [saleStats]
    )

  useEffect(() => {
    const index = tokens.findIndex(token => token.assetAddress.equals(mint))
    if (index !== -1) setTokenIndex(index)
  }, [tokens, mint])

  const { deposited } = useMemo(
    () =>
      userStats
        ? userStats
        : {
            deposited: new BN(0),
            received: new BN(0)
          },
    [userStats]
  )

  const round = useMemo(() => getRound(currentAmount, targetAmount), [saleStats])

  const remainingAmount = useMemo(
    () => (!whitelistWalletLimit.isZero() ? whitelistWalletLimit.sub(deposited) : new BN(0)),
    [deposited, whitelistWalletLimit]
  )

  const filledPercentage = useMemo(
    () =>
      !whitelistWalletLimit.isZero()
        ? new BN(currentAmount).muln(100).div(whitelistWalletLimit).toNumber()
        : 0,
    [currentAmount, whitelistWalletLimit]
  )

  const amountTillPriceIncrease = useMemo(
    () =>
      !targetAmount.isZero()
        ? getAmountTillNextPriceIncrease(currentAmount, targetAmount)
        : new BN(0),
    [currentAmount, targetAmount]
  )

  const mintDecimals = useMemo(
    () => (tokenIndex !== null ? tokens[tokenIndex].decimals : 0),
    [tokenIndex, tokens]
  )

  const tierPrices = useMemo(() => getTierPrices(mintDecimals), [mintDecimals])

  const currentPrice = useMemo(
    () => getPrice(currentAmount, targetAmount, mintDecimals),
    [currentAmount, targetAmount, mintDecimals]
  )
  const endtimestamp = useMemo(() => startTimestamp.add(duration), [startTimestamp, duration])

  const isActive = useMemo(() => {
    const currentTimestamp = getTimestampSeconds()
    return currentTimestamp.lt(endtimestamp) && currentTimestamp.gt(startTimestamp)
  }, [endtimestamp])

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
                return { id: idx + 1, label: `$${printBN(price, mintDecimals)}` }
              })}
            />
            <Box className={classes.roundComponentContainer}>
              <RoundComponent
                isActive={isActive}
                tokensLeft=''
                amountBought={printBN(currentAmount, mintDecimals)}
                amountLeft={printBN(amountTillPriceIncrease, mintDecimals)}
                currentPrice={printBN(currentPrice.price, mintDecimals)}
                nextPrice={printBN(currentPrice.nextPrice, mintDecimals)}
                percentageFilled={filledPercentage}
                purchasedTokens={printBN(deposited, mintDecimals)}
                remainingAllocation={printBN(remainingAmount, mintDecimals)}
                roundNumber={round}
                currency={tokenIndex !== null ? tokens[tokenIndex].symbol : null}
                endtimestamp={endtimestamp}
              />
            </Box>
          </Grid>
          <BuyComponent
            isActive={isActive}
            progress={progress}
            isLoading={isLoadingSaleStats || isLoadingUserStats || isBalanceLoading}
            targetAmount={targetAmount}
            currentAmount={currentAmount}
            mintDecimals={mintDecimals}
            startTimestamp={startTimestamp}
            tokens={tokens}
            walletStatus={walletStatus}
            isBalanceLoading={isBalanceLoading}
            tokenIndex={tokenIndex}
            onConnectWallet={() => {
              dispatch(walletActions.connect(false))
            }}
            onDisconnectWallet={() => {
              dispatch(walletActions.disconnect())
            }}
            onBuyClick={amount => {
              if (tokenIndex === null) {
                return
              }
              if (progress === 'none') {
                setProgress('progress')
              }

              dispatch(
                actions.depositSale({
                  amount,
                  mint
                })
              )
            }}
            alertBoxText='Test message'
          />
        </Box>
      </Box>
    </Grid>
  )
}
