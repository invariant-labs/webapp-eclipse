import React, { useEffect, useMemo, useState } from 'react'
import useStyles from './styles'
import { Box, Button, Grid, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import LaunchIcon from '@mui/icons-material/Launch'
import { useDispatch, useSelector } from 'react-redux'
import {
  balance,
  balanceLoading,
  status,
  swapTokens,
  swapTokensDict
} from '@store/selectors/solanaWallet'
import { StakeLiquidityPayload } from '@store/reducers/sBitz'
import { actions } from '@store/reducers/sBitz'
import { actions as sbitzStatsActions } from '@store/reducers/sbitz-stats'
import { Status, actions as walletActions } from '@store/reducers/solanaWallet'
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
  bitzStaked,
  bitzStakedPlot,
  bitzSupply,
  isLoading,
  sbitzSupply,
  sbitzSupplyPlot,
  sBitzTVL,
  sbitzTVLPlot,
  totalBitzStaked
} from '@store/selectors/sbitz-stats'

import { network } from '@store/selectors/solanaConnection'
import { FAQSection } from '@components/Stake/FAQSection/FAQSection'
import { OverallStats } from '@components/Stake/OverallStats/OverallStats'
import { StakeChart } from '@components/Stake/StakeChart/StakeChart'
import { StakedStats } from '@components/Stake/StakedStats/StakedStats'
import { YourStakeProgress } from '@components/Stake/YourStakeStats/YourProgress'
import { BN } from '@coral-xyz/anchor'
import {
  calculateTokensForWithdraw,
  computeBitzAprApy,
  computeBitzSbitzRewards
} from '@invariant-labs/sbitz'
import { sBITZ_MAIN, BITZ_MAIN, REFRESHER_INTERVAL } from '@store/consts/static'
import { getTokenPrice, printBN } from '@utils/utils'
import LiquidityStaking from '@components/Stake/LiquidityStaking/LiquidityStaking'
import { StakeSwitch } from '@store/consts/types'
import { HowItWorks } from '@components/Stake/HowItWorks/HowItWorks'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { refreshIcon } from '@static/icons'

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
  const progress = useSelector(inProgress)
  const success = useSelector(successState)
  const isLoadingStats = useSelector(isLoading)
  const sbitzPlot = useSelector(sbitzSupplyPlot)
  const bitzPlot = useSelector(bitzStakedPlot)
  const stakedBitzSupply = useSelector(sbitzSupply)
  const backedByBitz = useSelector(bitzStaked)
  const totalBitz = useSelector(totalBitzStaked)
  const supplyBitz = useSelector(bitzSupply)
  const sbitzTvlPlot = useSelector(sbitzTVLPlot)
  const sbitzTvl = useSelector(sBitzTVL)
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

  const [stakedAmount, setStakedAmount] = useState(100)
  const [refresherTime, setRefresherTime] = useState<number>(REFRESHER_INTERVAL)
  const [bitzPrice, setBitzPrice] = useState(0)

  const isConnected = useMemo(() => walletStatus === Status.Initialized, [walletStatus])

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

  const sBitzApyApr = useMemo(() => {
    if (!stakedBitzData.bitzTotalBalance) return { apr: 0, apy: 0 }
    return computeBitzAprApy(+printBN(stakedBitzData.bitzTotalBalance, BITZ_MAIN.decimals))
  }, [stakedBitzData])

  const fetchPriceData = async () => {
    const tokenPrice = await getTokenPrice(BITZ_MAIN.address.toString(), networkType)
    setBitzPrice(tokenPrice ?? 0)
  }

  useEffect(() => {
    dispatch(sbitzStatsActions.getCurrentStats())
    dispatch(actions.getStakedAmountAndBalance())

    fetchPriceData()
  }, [dispatch])

  const onRefresh = () => {
    dispatch(walletActions.getBalance())
    dispatch(actions.getStakedAmountAndBalance())
  }

  const handleRefresh = () => {
    onRefresh()
    setRefresherTime(REFRESHER_INTERVAL)
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (refresherTime > 0) {
        setRefresherTime(refresherTime - 1)
      } else {
        handleRefresh()
      }
    }, 1000)

    return () => clearTimeout(timeout)
  }, [refresherTime])

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

  return (
    <Grid container className={classes.wrapper}>
      <Box className={classes.titleWrapper}>
        <Box className={classes.titleTextWrapper}>
          <Typography component='h1'>Liquidity staking</Typography>
          <Box className={classes.subheaderDescription}>
            Earn more with sBITZ.
            <Link to='' target='_blank' className={classes.learnMoreLink}>
              <span> Learn more</span> <LaunchIcon classes={{ root: classes.clipboardIcon }} />
            </Link>
          </Box>
        </Box>
        <TooltipHover title='Refresh'>
          <Grid className={classes.refreshIconContainer}>
            <Button
              onClick={handleRefresh}
              className={classes.refreshIconBtn}
              disabled={isBalanceLoading || stakeLoading || isLoadingStats}>
              <img src={refreshIcon} className={classes.refreshIcon} alt='Refresh' />
            </Button>
          </Grid>
        </TooltipHover>
      </Box>
      <LiquidityStaking
        walletStatus={walletStatus}
        tokens={tokens}
        handleStake={(props: StakeLiquidityPayload) => {
          dispatch(actions.stake(props))
        }}
        handleUnstake={(props: StakeLiquidityPayload) => {
          dispatch(actions.unstake(props))
        }}
        inProgress={progress}
        success={success}
        onConnectWallet={() => {
          dispatch(walletActions.connect(false))
        }}
        onDisconnectWallet={() => {
          dispatch(walletActions.disconnect())
        }}
        networkType={networkType}
        sBitzApyApr={sBitzApyApr}
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
      />

      <Box className={classes.statsContainer}>
        <Typography className={classes.statsTitle}>Your stats</Typography>
        <YourStakeProgress
          sBitzBalance={sBitzBalance}
          bitzToWithdraw={bitzToWithdraw}
          bitzPrice={bitzPrice}
          isLoading={stakeLoading}
          isConnected={isConnected}
          yield24={estimated24Yield}
        />
        <Box className={classes.statsContainer}>
          <Typography className={classes.statsTitle}>Your stake</Typography>
          <StakeChart
            onStakedAmountChange={setStakedAmount}
            stakedAmount={stakedAmount}
            earnedAmount={chartData.earnedAmount}
            bitzData={chartData.bitzData}
            sBitzData={chartData.sBitzData}
            earnedUsd={chartData.earnedUsd}
            stakeLoading={stakeLoading}
          />
        </Box>
        <HowItWorks />
        <OverallStats
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
        />
      </Box>

      <FAQSection />
    </Grid>
  )
}

export default WrappedStake
