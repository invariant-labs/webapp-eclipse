import React, { useEffect, useMemo, useState, useRef } from 'react'
import useStyles from './styles'
import { Box, Button, Grid, Typography, useMediaQuery } from '@mui/material'
import { Link } from 'react-router-dom'
import LaunchIcon from '@mui/icons-material/Launch'
import { useDispatch, useSelector } from 'react-redux'
import {
  balance,
  balanceLoading,
  status,
  SwapToken,
  swapTokens,
  swapTokensDict
} from '@store/selectors/solanaWallet'
import { StakeLiquidityPayload } from '@store/reducers/sBitz'
import { actions } from '@store/reducers/sBitz'
import { actions as sbitzStatsActions } from '@store/reducers/sbitz-stats'
import { Status, actions as walletActions } from '@store/reducers/solanaWallet'
import EyeShow from '@static/svg/eye-show.svg'
import EyeHide from '@static/svg/eye-off.svg'

import {
  inProgress,
  stakedData,
  success as successState,
  stakeDataLoading,
  stakeTab,
  stakeInputVal,
  unstakeInputVal
} from '@store/selectors/sBitz'
import {
  //   // bitzStaked,
  //   // bitzStakedPlot,
  //   // bitzSupply,
  isLoading
  //   // sbitzSupply,
  //   // sbitzSupplyPlot,
  //   // sBitzTVL,
  //   // sbitzTVLPlot,
  //   // totalBitzStaked
} from '@store/selectors/sbitz-stats'

import { network } from '@store/selectors/solanaConnection'
import { FAQSection } from '@components/Stake/FAQSection/FAQSection'
// import { OverallStats } from '@components/Stake/OverallStats/OverallStats'
import { StakeChart } from '@components/Stake/StakeChart/StakeChart'
// import { StakedStats } from '@components/Stake/StakedStats/StakedStats'
import { BN } from '@coral-xyz/anchor'
import { calculateTokensForWithdraw, computeBitzSbitzRewards } from '@invariant-labs/sbitz'
import {
  calculateTokensForWithdraw,
  computeBitzAprApy,
  computeBitzSbitzRewards
} from '@invariant-labs/sbitz'
import {
  sBITZ_MAIN,
  BITZ_MAIN,
  PORTFOLIO_STAKE_EXPAND_DELAY,
  PORTFOLIO_STAKE_STORAGE_KEY,
  PORTFOLIO_STAKE_COLLAPSE_DELAY
} from '@store/consts/static'
import { getTokenPrice, printBN } from '@utils/utils'
import LiquidityStaking from '@components/Stake/LiquidityStaking/LiquidityStaking'
import { StakeSwitch } from '@store/consts/types'
// // import { HowItWorks } from '@components/Stake/HowItWorks/HowItWorks'
// import { StakedStats } from '@components/Stake/StakedStats/StakedStats'
// import { OverallStats } from '@components/Stake/OverallStats/OverallStats'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { refreshIcon } from '@static/icons'
import { ProgressState } from '@common/AnimatedButton/AnimatedButton'
import { theme } from '@static/theme'
import { SBitzBanner } from '@components/Stake/SBitzBanner/SBitzBanner'
import { YourStakeProgress } from '@components/Stake/YourStakeStats/YourProgress'

export const WrappedStake: React.FC = () => {
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const networkType = useSelector(network)
  const walletStatus = useSelector(status)
  const tokens = useSelector(swapTokensDict)
  const ethBalance = useSelector(balance)
  const isBalanceLoading = useSelector(balanceLoading)
  const stakeInput = useSelector(stakeInputVal)
  const unstakeInput = useSelector(unstakeInputVal)
  const tokensList = useSelector(swapTokens)
  const isInProgress = useSelector(inProgress)
  const success = useSelector(successState)
  const isLoadingStats = useSelector(isLoading)
  //   // const sbitzPlot = useSelector(sbitzSupplyPlot)
  //   // const bitzPlot = useSelector(bitzStakedPlot)
  //   // const stakedBitzSupply = useSelector(sbitzSupply)
  //   // const backedByBitz = useSelector(bitzStaked)
  //   // const totalBitz = useSelector(totalBitzStaked)
  //   // const supplyBitz = useSelector(bitzSupply)
  //   // const sbitzTvlPlot = useSelector(sbitzTVLPlot)
  //   // const sbitzTvl = useSelector(sBitzTVL)
  const stakedBitzData = useSelector(stakedData)
  const stakeLoading = useSelector(stakeDataLoading)
  const currentStakeTab = useSelector(stakeTab)

  const [chartData, setChartData] = useState<{
    bitzData: { x: string; y: number }[]
    sBitzData: { x: string; y: number }[]
    earnedAmount: number
    earnedUsd: number
  }>({
    bitzData: [],
    sBitzData: [],
    earnedAmount: 0,
    earnedUsd: 0
  })

  const [isExpanded, setIsExpanded] = useState(false)
  const prevConnectionStatus = useRef<Status | null>(null)

  const [stakedAmount, setStakedAmount] = useState(100)
  const [bitzPrice, setBitzPrice] = useState(0)
  const [sBitzPrice, setSBitzPrice] = useState(0)
  const [progress, setProgress] = useState<ProgressState>('none')
  const [priceLoading, setPriceLoading] = useState(false)
  const [shouldRenderStats, setShouldRenderStats] = useState(false)

  const isConnected = useMemo(() => walletStatus === Status.Initialized, [walletStatus])
  const isSm = useMediaQuery(theme.breakpoints.down('sm'))
  const truncateText = useMediaQuery(theme.breakpoints.down(348))
  const sBitzBalance = useMemo(() => {
    return new BN(tokensList.find(token => token.address.equals(sBITZ_MAIN.address))?.balance || 0)
  }, [tokensList])

  const bitzToWithdraw = useMemo(() => {
    if (!stakedBitzData.stakedAmount || !stakedBitzData.stakedTokenSupply) {
      return new BN(0)
    }
    return calculateTokensForWithdraw(
      stakedBitzData.stakedTokenSupply,
      stakedBitzData.stakedAmount,
      sBitzBalance || new BN(0)
    )
  }, [stakedBitzData, sBitzBalance])

  const estimated24Yield = useMemo(() => {
    const { sbitzPredictedYield } = computeBitzSbitzRewards(
      +printBN(sBitzBalance, sBITZ_MAIN.decimals),
      +printBN(stakedBitzData.bitzTotalBalance, BITZ_MAIN.decimals),
      1
    )
    return sbitzPredictedYield[0] || 0
  }, [sBitzBalance, stakedBitzData])

  const computeBitzAndSbitzYield = (
    bitzStakedInSbitz: number,
    bitzStakedInPowPow: number
  ): {
    sbitzMonthly: number
    sbitzAnnual: number
    bitzMonthly: number
    bitzAnnual: number
  } => {
    const TOTAL_STAKING_REWARD_PER_DAY = 720
    const COMPOUND_INTERVAL_SECONDS = 10
    const COMPOUNDS_PER_DAY = 86_400 / COMPOUND_INTERVAL_SECONDS
    const INVERSE_COMPOUNDS_PER_DAY = 1 / COMPOUNDS_PER_DAY
    const DAYS_IN_YEAR = 365
    const DAYS_IN_MONTH = 30

    let myStakeS = 1
    let sbitzStake = bitzStakedInSbitz
    let totalStakeS = 1 + bitzStakedInPowPow
    let myStakeSMonth = 1

    let myStakeB = 1
    let sbitzStakeB = bitzStakedInSbitz
    let totalStakeB = 1 + bitzStakedInPowPow
    let myStakeBMonth = 1

    for (let day = 0; day < DAYS_IN_YEAR; day++) {
      const dailyRateS = TOTAL_STAKING_REWARD_PER_DAY / totalStakeS
      const factorS = Math.pow(1 + dailyRateS * INVERSE_COMPOUNDS_PER_DAY, COMPOUNDS_PER_DAY)

      const prevMyS = myStakeS
      const prevSbitz = sbitzStake

      myStakeS *= factorS
      sbitzStake *= factorS
      totalStakeS += myStakeS - prevMyS + (sbitzStake - prevSbitz)

      const dailyRateB = TOTAL_STAKING_REWARD_PER_DAY / totalStakeB
      const factorB = Math.pow(1 + dailyRateB * INVERSE_COMPOUNDS_PER_DAY, COMPOUNDS_PER_DAY)

      const prevSbitzB = sbitzStakeB

      sbitzStakeB *= factorB
      myStakeB += dailyRateB
      totalStakeB += sbitzStakeB - prevSbitzB

      if (day === DAYS_IN_MONTH - 1) {
        myStakeSMonth = myStakeS
        myStakeBMonth = myStakeB
      }
    }

    return {
      sbitzMonthly: Math.round((myStakeSMonth - 1) * 10_000) / 100,
      sbitzAnnual: Math.round((myStakeS - 1) * 10_000) / 100,
      bitzMonthly: Math.round((myStakeBMonth - 1) * 10_000) / 100,
      bitzAnnual: Math.round((myStakeB - 1) * 10_000) / 100
    }
  }

  const sBitzBitzMonthlyAnnual = useMemo(() => {
    if (!stakedBitzData.bitzTotalBalance || !stakedBitzData.stakedAmount)
      return {
        sbitzMonthly: 0,
        sbitzAnnual: 0,
        bitzMonthly: 0,
        bitzAnnual: 0
      }
    return computeBitzAndSbitzYield(
      +printBN(stakedBitzData.stakedAmount, BITZ_MAIN.decimals),
      +printBN(stakedBitzData.bitzTotalBalance, BITZ_MAIN.decimals)
    )
  }, [stakedBitzData])

  const tokenFrom: SwapToken = useMemo(
    () =>
      currentStakeTab === StakeSwitch.Stake
        ? tokens[BITZ_MAIN.address.toString()]
        : tokens[sBITZ_MAIN.address.toString()],
    [currentStakeTab, tokens]
  )
  const tokenTo: SwapToken = useMemo(
    () =>
      currentStakeTab === StakeSwitch.Unstake
        ? tokens[BITZ_MAIN.address.toString()]
        : tokens[sBITZ_MAIN.address.toString()],
    [currentStakeTab, tokens]
  )

  const fetchPrices = () => {
    setPriceLoading(true)

    const bitzAddr = BITZ_MAIN.address.toString()
    const sBitzAddr = sBITZ_MAIN.address.toString()

    Promise.allSettled([
      getTokenPrice(bitzAddr, networkType),
      getTokenPrice(sBitzAddr, networkType)
    ])
      .then(([bitzRes, sBitzRes]) => {
        const bitzPrice =
          bitzRes.status === 'fulfilled' && bitzRes.value != null ? bitzRes.value : 0
        const sBitzPrice =
          sBitzRes.status === 'fulfilled' && sBitzRes.value != null ? sBitzRes.value : 0
        setBitzPrice(bitzPrice ?? 0)
        setSBitzPrice(sBitzPrice ?? 0)
      })
      .finally(() => {
        setPriceLoading(false)
      })
  }

  useEffect(() => {
    dispatch(walletActions.getBalance())
    dispatch(sbitzStatsActions.getCurrentStats())
    dispatch(actions.getStakedAmountAndBalance())
    fetchPrices()
  }, [dispatch])

  const onRefresh = () => {
    dispatch(walletActions.getBalance())
    dispatch(actions.getStakedAmountAndBalance())
    fetchPrices()
  }

  useEffect(() => {
    if (!stakedBitzData.stakedAmount || !stakedBitzData.bitzTotalBalance) {
      return
    }

    const {
      bitzPredictedYield,
      sbitzPredictedYield
    }: { sbitzPredictedYield: number[]; bitzPredictedYield: number[] } = computeBitzSbitzRewards(
      stakedAmount,
      +printBN(stakedBitzData.bitzTotalBalance, sBITZ_MAIN.decimals)
    )
    const bitzData = bitzPredictedYield.map((value, index) => ({
      x: `Day ${index + 1}`,
      y: value
    }))
    const sBitzData = sbitzPredictedYield.map((value, index) => ({
      x: `Day ${index + 1}`,
      y: value
    }))
    const earnedAmount = sBitzData[sBitzData.length - 1]?.y - bitzData[sBitzData.length - 1]?.y
    const earnedUsd = earnedAmount * bitzPrice
    setChartData({
      bitzData,
      sBitzData,
      earnedAmount,
      earnedUsd
    })
  }, [stakedBitzData, stakedAmount, bitzPrice])

  useEffect(() => {
    let timeoutId1: NodeJS.Timeout
    let timeoutId2: NodeJS.Timeout

    if (!isInProgress && progress === 'progress') {
      setProgress(success ? 'approvedWithSuccess' : 'approvedWithFail')

      timeoutId1 = setTimeout(() => {
        setProgress(success ? 'success' : 'failed')
      }, 1000)

      timeoutId2 = setTimeout(() => {
        setProgress('none')
      }, 3000)
    }

    return () => {
      clearTimeout(timeoutId1)
      clearTimeout(timeoutId2)
    }
  }, [success, isInProgress])

  const toggleExpand = () => {
    const isWalletInitialized = walletStatus === Status.Initialized
    const newExpandedState = isWalletInitialized && !isExpanded

    localStorage.setItem(PORTFOLIO_STAKE_STORAGE_KEY, JSON.stringify(newExpandedState))

    if (newExpandedState) {
      setShouldRenderStats(true)
      setTimeout(() => setIsExpanded(true), PORTFOLIO_STAKE_EXPAND_DELAY)
    } else {
      setIsExpanded(false)
      if (shouldRenderStats) {
        setTimeout(() => setShouldRenderStats(false), PORTFOLIO_STAKE_COLLAPSE_DELAY)
      }
    }
  }

  useEffect(() => {
    const isWalletInitialized = walletStatus === Status.Initialized

    if (isWalletInitialized) {
      const savedExpandedState = localStorage.getItem(PORTFOLIO_STAKE_STORAGE_KEY)
      const shouldExpand = savedExpandedState !== null && JSON.parse(savedExpandedState)

      if (shouldExpand) {
        setShouldRenderStats(true)
        setTimeout(() => setIsExpanded(true), PORTFOLIO_STAKE_EXPAND_DELAY)
      }
    } else {
      setIsExpanded(false)
      setShouldRenderStats(false)
    }

    prevConnectionStatus.current = walletStatus
  }, [walletStatus])
  return (
    <Grid container className={classes.wrapper}>
      <SBitzBanner />
      <Box className={classes.animatedContainer}>
        <Box
          className={`${classes.liquidityStakingWrapper} ${isExpanded ? classes.liquidityStakingExpanded : ''}`}>
          <Box className={classes.titleWrapper}>
            <Box className={classes.titleTextWrapper}>
              <Typography component='h1'>Liquidity staking</Typography>
              <Box className={classes.subheaderDescription}>
                <Link
                  to='https://docs.invariant.app/docs/sbitz'
                  target='_blank'
                  className={classes.learnMoreLink}>
                  {!truncateText && <span> {isSm ? 'More' : 'Learn More'}</span>}
                  <LaunchIcon classes={{ root: classes.clipboardIcon }} />
                </Link>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                className={classes.statsExpanderButton}
                onClick={() => toggleExpand()}
                disabled={!isConnected}>
              <Button
                className={classes.statsExpanderButton}
                onClick={() => toggleExpand()}
                disabled={!isConnected}>
                <p>
                  <img
                    src={isExpanded ? EyeHide : EyeShow}
                    width={20}
                    height={20}
                    style={{ opacity: isConnected ? 1 : 0.3 }}
                  />
                  <img
                    src={isExpanded ? EyeHide : EyeShow}
                    width={20}
                    height={20}
                    style={{ opacity: isConnected ? 1 : 0.3 }}
                  />
                  Portfolio
                </p>
              </Button>
              <TooltipHover title='Refresh'>
                <Grid className={classes.refreshIconContainer}>
                  <Button
                    onClick={onRefresh}
                    className={classes.refreshIconBtn}
                    disabled={isBalanceLoading || stakeLoading || isLoadingStats}>
                    <img src={refreshIcon} className={classes.refreshIcon} alt='Refresh' />
                  </Button>
                </Grid>
              </TooltipHover>
            </Box>
          </Box>
          <Box className={classes.stakingContentWrapper}>
            <LiquidityStaking
              walletStatus={walletStatus}
              tokens={tokens}
              handleStake={(props: StakeLiquidityPayload) => {
                dispatch(actions.stake(props))
              }}
              handleUnstake={(props: StakeLiquidityPayload) => {
                dispatch(actions.unstake(props))
              }}
              onConnectWallet={() => {
                dispatch(walletActions.connect(false))
              }}
              onDisconnectWallet={() => {
                dispatch(walletActions.disconnect())
              }}
              stakedTokenSupply={stakedBitzData.stakedTokenSupply}
              stakedAmount={stakedBitzData.stakedAmount}
              stakeDataLoading={stakeLoading}
              changeStakeTab={(tab: StakeSwitch) => {
                dispatch(actions.setStakeTab({ tab }))
              }}
              currentStakeTab={currentStakeTab}
              ethBalance={ethBalance}
              isBalanceLoading={isBalanceLoading}
              stakeInput={stakeInput}
              unstakeInput={unstakeInput}
              setStakeInput={(val: string) => {
                dispatch(actions.setStakeInputVal({ val }))
              }}
              setUnstakeInput={(val: string) => {
                dispatch(actions.setUnstakeInputVal({ val }))
              }}
              progress={progress}
              setProgress={setProgress}
              tokenFrom={tokenFrom}
              tokenTo={tokenTo}
              priceLoading={priceLoading}
              sBitzPrice={sBitzPrice}
              bitzPrice={bitzPrice}
              sBitzBitzMonthlyAnnual={sBitzBitzMonthlyAnnual}
            />
            <Box
              className={`${classes.yourStatsWrapper} ${isExpanded && isConnected ? classes.yourStatsVisible : ''}`}>
              {shouldRenderStats && isConnected && (
                <YourStakeProgress
                  sBitzBalance={sBitzBalance}
                  bitzToWithdraw={bitzToWithdraw}
                  bitzPrice={bitzPrice}
                  isLoading={stakeLoading || isBalanceLoading || isLoadingStats}
                  isConnected={isConnected}
                  yield24={estimated24Yield}
                />
              )}
            </Box>
          </Box>
        </Box>
      </Box>
      <Box className={classes.statsContainer}>
        {/* <Box className={classes.statsContainer}> */}
        <Typography className={classes.statsTitle}>Earnings forecast</Typography>
        <StakeChart
          onStakedAmountChange={setStakedAmount}
          stakedAmount={stakedAmount}
          earnedAmount={chartData.earnedAmount}
          bitzData={chartData.bitzData}
          sBitzData={chartData.sBitzData}
          earnedUsd={chartData.earnedUsd}
          stakeLoading={stakeLoading}
        />
        {/* </Box> */}
        {/* {/* <HowItWorks /> */}
        {/* <OverallStats
          isLoadingStats={isLoadingStats}
          bitzPlot={bitzPlot}
          sbitzPlot={sbitzPlot}
          sbitzSupply={stakedBitzSupply}
          bitzStaked={backedByBitz}
        />
        <StakedStats
          isLoadingStats={isLoadingStats}
          bitzStaked={backedByBitz}
          bitzSupply={supplyBitz}
          totalBitzStaked={totalBitz}
          tvlPlot={sbitzTvlPlot}
          sbitzTvl={sbitzTvl}
        /> */}
      </Box>

      <FAQSection />
    </Grid>
  )
}

export default WrappedStake
