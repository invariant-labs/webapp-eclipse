import React, { useEffect, useMemo, useRef, useState } from 'react'
import useStyles from './styles'
import { Box, Grid, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import LiquidityStaking, { StakeChartSwitcher } from '@components/Stake/Stake'
import { Link } from 'react-router-dom'
import LaunchIcon from '@mui/icons-material/Launch'
import { useDispatch, useSelector } from 'react-redux'
import { status, swapTokens, swapTokensDict } from '@store/selectors/solanaWallet'
import { StakeLiquidityPayload } from '@store/reducers/sBitz'
import { actions } from '@store/reducers/sBitz'
import { Status, actions as walletActions } from '@store/reducers/solanaWallet'
import {
  inProgress,
  stakedData,
  stakeStatsLoading,
  success as successState
} from '@store/selectors/stake'
import { network } from '@store/selectors/solanaConnection'
import { FAQSection } from '@components/Stake/FAQSection/FAQSection'
import { OverallStats } from '@components/Stake/OverallStats/OverallStats'
import { StakeChart } from '@components/Stake/StakeChart/StakeChart'
import { StakedStats } from '@components/Stake/StakedStats/StakedStats'
import { YourStakeProgress } from '@components/Stake/YourStakeStats/YourProgress'
import { BN } from '@coral-xyz/anchor'
import { calculateTokensForWithdraw, computeBitzSbitzRewards } from '@invariant-labs/sbitz'
import { sBITZ_MAIN, BITZ_MAIN } from '@store/consts/static'
import { getTokenPrice, printBN } from '@utils/utils'
import { HowItWorks } from '@components/Stake/HowItWorks/HowItWorks'

export const WrappedStake: React.FC = () => {
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const networkType = useSelector(network)

  const walletStatus = useSelector(status)
  const tokens = useSelector(swapTokensDict)

  const progress = useSelector(inProgress)
  const success = useSelector(successState)

  const handleStake = (props: StakeLiquidityPayload) => {
    dispatch(actions.stake(props))
  }

  const handleUnstake = (props: StakeLiquidityPayload) => {
    dispatch(actions.unstake(props))
  }

  const tokensList = useSelector(swapTokens)
  const stakedBitzData = useSelector(stakedData)
  const [isLoadingDebounced, setIsLoadingDebounced] = useState(true)
  const filteredTokens = useMemo(() => {
    return tokensList.filter(item => item.decimals > 0 && item.symbol === sBITZ_MAIN.symbol)
  }, [tokensList])

  const isConnected = useMemo(() => walletStatus === Status.Initialized, [walletStatus])
  const [backedByBITZData, setBackedByBITZData] = useState<{ amount: BN; price: number } | null>(
    null
  )
  const currentNetwork = useSelector(network)
  const statsLoading = useSelector(stakeStatsLoading)
  const initialLoadCompleted = useRef(false)
  const [chartData, setChartData] = useState<{
    bitzData: { x: string; y: number }[]
    sBitzData: { x: string; y: number }[]
    earnedAmount: number
  }>({
    bitzData: [],
    sBitzData: [],
    earnedAmount: 0
  })
  const [stakeChartTab, setStakeChartTab] = useState(StakeChartSwitcher.Stats)
  const [stakedAmount, setStakedAmount] = useState(100)

  const isFirstMount = useRef(true)
  const prevInProgressRef = useRef<boolean>(false)

  const processedTokens = useMemo(() => {
    return {
      sBITZ: new BN(filteredTokens.find(token => token.symbol === sBITZ_MAIN.symbol)?.balance || 0),
      backedByBITZ: backedByBITZData ?? { amount: new BN(0), price: 0 }
    }
  }, [filteredTokens, backedByBITZData])
  useEffect(() => {
    setIsLoadingDebounced(true)
    dispatch(actions.getStakedAmountAndBalance())
  }, [dispatch])

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }

    const operationJustCompleted = prevInProgressRef.current === true && !progress
    prevInProgressRef.current = progress

    if (!progress && (operationJustCompleted || isConnected)) {
      setIsLoadingDebounced(true)

      const timerId = setTimeout(() => {
        dispatch(actions.getStakedAmountAndBalance())
      }, 300)

      return () => clearTimeout(timerId)
    }
  }, [isConnected, progress, dispatch])
  useEffect(() => {
    if (statsLoading) {
      setIsLoadingDebounced(true)
      return
    }

    if (stakedBitzData.stakedAmount !== null && stakedBitzData.stakedTokenSupply !== null) {
      const timer = setTimeout(() => {
        initialLoadCompleted.current = true
        setIsLoadingDebounced(false)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [statsLoading, stakedBitzData])

  useEffect(() => {
    if (stakedBitzData.stakedTokenSupply === null || stakedBitzData.stakedAmount === null) {
      return
    }
    if (!initialLoadCompleted.current) {
      setIsLoadingDebounced(true)
    }

    const bitzToken = filteredTokens.find(token => token.symbol === sBITZ_MAIN.symbol)
    const backedByBITZ = calculateTokensForWithdraw(
      stakedBitzData.stakedTokenSupply,
      stakedBitzData.stakedAmount,
      bitzToken?.balance || new BN(0)
    )
    const fetchPriceData = async () => {
      const tokenPrice = await getTokenPrice(BITZ_MAIN.address.toString(), currentNetwork)
      setBackedByBITZData({
        amount: backedByBITZ,
        price: tokenPrice || 0
      })
    }

    fetchPriceData()
  }, [currentNetwork, stakedBitzData, filteredTokens, dispatch, isConnected])

  const handleToggleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: StakeChartSwitcher
  ) => {
    if (newValue === null) return
    setStakeChartTab(newValue)
  }

  useEffect(() => {
    const {
      bitzPredictedYield,
      sbitzPredictedYield
    }: { sbitzPredictedYield: number[]; bitzPredictedYield: number[] } = computeBitzSbitzRewards(
      stakedAmount,
      +printBN(stakedBitzData.sBitzTotalBalance, sBITZ_MAIN.decimals)
    )

    const bitzData = bitzPredictedYield.map((value, index) => ({
      x: `Day ${index + 1}`,
      y: value
    }))
    const sBitzData = sbitzPredictedYield.map((value, index) => ({
      x: `Day ${index + 1}`,
      y: value
    }))
    setChartData({
      bitzData,
      sBitzData,
      earnedAmount: sBitzData[sBitzData.length - 1]?.y - bitzData[sBitzData.length - 1]?.y
    })
  }, [stakedBitzData, stakedAmount])

  const estimated24Yield = useMemo(() => {
    const { sbitzPredictedYield } = computeBitzSbitzRewards(
      +printBN(processedTokens.sBITZ, sBITZ_MAIN.decimals),
      +printBN(stakedBitzData.sBitzTotalBalance, sBITZ_MAIN.decimals),
      1
    )
    return sbitzPredictedYield[0] || 0
  }, [processedTokens])

  return (
    <Grid container className={classes.wrapper}>
      <Box display='flex' flexDirection='column' alignItems='center' gap={'12px'}>
        <Typography className={classes.header}>Liquidity staking</Typography>
        <Box className={classes.subheaderDescription}>
          Earn more with sBITZ.
          <Link to='' target='_blank' className={classes.learnMoreLink}>
            <span> Learn more</span> <LaunchIcon classes={{ root: classes.clipboardIcon }} />
          </Link>
        </Box>
      </Box>
      <LiquidityStaking
        walletStatus={walletStatus}
        tokens={tokens}
        handleStake={handleStake}
        handleUnstake={handleUnstake}
        inProgress={progress}
        success={success}
        onConnectWallet={() => {
          dispatch(walletActions.connect(false))
        }}
        onDisconnectWallet={() => {
          dispatch(walletActions.disconnect())
        }}
        networkType={networkType}
      />

      <Grid className={classes.filtersContainerOverview}>
        <Box className={classes.switchPoolsContainerOverview}>
          <Box
            className={`${classes.switchPoolsMarker} ${
              stakeChartTab === StakeChartSwitcher.Stake
                ? classes.switchPoolsMarkerStake
                : classes.switchPoolsMarkerStats
            }`}
          />

          <ToggleButtonGroup
            value={stakeChartTab}
            exclusive
            onChange={handleToggleChange}
            className={classes.switchPoolsButtonsGroupOverview}>
            <ToggleButton
              value={StakeChartSwitcher.Stake}
              disableRipple
              className={`${classes.switchPoolsButtonOverview} ${
                stakeChartTab === StakeChartSwitcher.Stake
                  ? classes.selectedToggleButton
                  : classes.unselectedToggleButton
              }`}>
              Stake
            </ToggleButton>
            <ToggleButton
              value={StakeChartSwitcher.Stats}
              disableRipple
              className={`${classes.switchPoolsButtonOverview} ${
                stakeChartTab === StakeChartSwitcher.Stats
                  ? classes.selectedToggleButton
                  : classes.unselectedToggleButton
              }`}
              classes={{ disabled: classes.disabledSwitchButton }}>
              Stats
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Grid>

      {stakeChartTab === StakeChartSwitcher.Stats && (
        <Box className={classes.statsContainer}>
          <Typography className={classes.statsTitle}>Your stats</Typography>
          <YourStakeProgress
            processedTokens={processedTokens}
            isLoading={isLoadingDebounced}
            isConnected={isConnected}
            yield24={estimated24Yield}
          />
          <HowItWorks />
          <OverallStats />
          <StakedStats />
        </Box>
      )}
      {stakeChartTab === StakeChartSwitcher.Stake && (
        <Box className={classes.statsContainer}>
          <Typography className={classes.statsTitle}>Your stake</Typography>
          <StakeChart
            onStakedAmountChange={setStakedAmount}
            stakedAmount={stakedAmount}
            earnedAmount={chartData.earnedAmount}
            bitzData={chartData.bitzData}
            sBitzData={chartData.sBitzData}
          />
        </Box>
      )}
      <FAQSection />
    </Grid>
  )
}

export default WrappedStake
