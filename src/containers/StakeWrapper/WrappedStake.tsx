import React, { useEffect, useMemo, useState } from 'react'
import useStyles from './styles'
import { Box, Grid, Typography, Button } from '@mui/material'
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
import { sBITZ_MAIN, BITZ_MAIN } from '@store/consts/static'
import { getTokenPrice, printBN } from '@utils/utils'
import LiquidityStaking from '@components/Stake/LiquidityStaking/LiquidityStaking'
import { StakeSwitch } from '@store/consts/types'
import { HowItWorks } from '@components/Stake/HowItWorks/HowItWorks'

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

  const [isExpanded, setIsExpanded] = useState(false)


  const [stakedAmount, setStakedAmount] = useState(100)

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

  useEffect(() => {
    dispatch(sbitzStatsActions.getCurrentStats())
    dispatch(actions.getStakedAmountAndBalance())

    const fetchPriceData = async () => {
      const tokenPrice = await getTokenPrice(BITZ_MAIN.address.toString(), networkType)
      setBitzPrice(tokenPrice ?? 0)
    }

    fetchPriceData()
  }, [dispatch])

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


  const toggleExpand = () => {
    setIsExpanded(prev => !prev)
  }


  return (
    <Grid container className={classes.wrapper}>

      <Box className={classes.animatedContainer}>
        <Box
          className={`${classes.liquidityStakingWrapper} ${isExpanded ? classes.liquidityStakingExpanded : ''}`}
        >
          <Box className={classes.liquidityStakingHeaderWrapper}>
            <Box className={classes.titleWrapper}>
              <Typography component='h1'>Liquidity staking</Typography>
              <Box className={classes.subheaderWrapper}>

                <Box className={classes.subheaderDescription}>
                  Earn more with sBITZ.
                </Box>
                <Link to='' target='_blank' className={classes.learnMoreLink}>
                  <span> Learn more</span> <LaunchIcon classes={{ root: classes.clipboardIcon }} />
                </Link>
              </Box>
            </Box>
            <Button className={classes.statsExpanderButton} onClick={() => toggleExpand()}>
              <p>
                <img src={isExpanded ? EyeHide : EyeShow} width={20} height={20} />
                Your Stats
              </p>
            </Button>
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

            <Box
              className={`${classes.yourStatsWrapper} ${isExpanded ? classes.yourStatsVisible : ''}`}
            >
              {isExpanded && (
                <YourStakeProgress
                  sBitzBalance={sBitzBalance}
                  bitzToWithdraw={bitzToWithdraw}
                  bitzPrice={bitzPrice}
                  isLoading={stakeLoading}
                  isConnected={isConnected}
                  yield24={estimated24Yield}
                />
              )}
            </Box>
          </Box>


        </Box>



      </Box>
      <Box className={classes.statsContainer}>


        <Box className={classes.statsContainer}>
          <Typography className={classes.statsTitle}>Your stake</Typography>
          <StakeChart
            onStakedAmountChange={setStakedAmount}
            stakedAmount={stakedAmount}
            earnedAmount={chartData.earnedAmount}
            bitzData={chartData.bitzData}
            sBitzData={chartData.sBitzData}
            earnedUsd={chartData.earnedUsd}
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
