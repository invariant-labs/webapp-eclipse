import { Box, Grid, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import useStyles from './style'
import LiquidityStaking from './LiquidityStaking/LiquidityStaking'
import { Status } from '@store/reducers/solanaWallet'
import { SwapToken, swapTokens } from '@store/selectors/solanaWallet'
import { actions, StakeLiquidityPayload } from '@store/reducers/sBitz'
import {
  stakeStatsLoading,
  stakedData
} from '@store/selectors/stake'; import { FAQSection } from './FAQSection/FAQSection'
import { useDispatch, useSelector } from 'react-redux'

import { useEffect, useMemo, useRef, useState } from 'react'
import { BITZ_MAIN, sBITZ_MAIN } from '@store/consts/static'
import { BN } from '@coral-xyz/anchor'
import { YourStakeProgress } from './LiquidityStaking/YourStakeStats/YourProgress'
import { network } from '@store/selectors/solanaConnection'
import { getTokenPrice } from '@utils/utils'
import { calculateTokensForWithdraw } from '@invariant-labs/sbitz'
import { StakeChart } from './StakeChart/StakeChart'
export interface IStake {
  walletStatus: Status
  tokens: Record<string, SwapToken>
  handleStake: (props: StakeLiquidityPayload) => void
  handleUnstake: (props: StakeLiquidityPayload) => void
  inProgress: boolean
  success: boolean
}


export enum StakeChartSwitcher {
  Stake = 'Stake',
  Stats = 'Stats'
}


export const Stake: React.FC<IStake> = ({
  walletStatus,
  tokens,
  handleStake,
  handleUnstake,
  inProgress,
  success
}) => {
  const tokensList = useSelector(swapTokens)
  const stakedBitzData = useSelector(stakedData)
  const dispatch = useDispatch()
  const [isLoadingDebounced, setIsLoadingDebounced] = useState(true)
  const filteredTokens = useMemo(() => {
    return tokensList.filter(item => item.decimals > 0 && (item.symbol === sBITZ_MAIN.symbol))
  }, [tokensList])

  const isConnected = useMemo(() => walletStatus === Status.Initialized, [walletStatus])
  const [backedByBITZData, setBackedByBITZData] = useState<{ amount: BN, price: number } | null>(null)
  const currentNetwork = useSelector(network);
  const statsLoading = useSelector(stakeStatsLoading)
  const initialLoadCompleted = useRef(false)

  const [stakeChartTab, setStakeChartTab] = useState(StakeChartSwitcher.Stats)


  const processedTokens = useMemo(() => {
    return {
      sBITZ: new BN(filteredTokens.find(token => token.symbol === sBITZ_MAIN.symbol)?.balance || 0),
      backedByBITZ: backedByBITZData ?? { amount: new BN(0), price: 0 },
    };
  }, [filteredTokens, backedByBITZData]);
  useEffect(() => {
    const shouldFetchData = isConnected && !inProgress

    if (shouldFetchData) {
      setIsLoadingDebounced(true)

      const timerId = setTimeout(() => {
        dispatch(actions.getStakedAmountAndBalance())
      }, 300)

      return () => clearTimeout(timerId)
    }
  }, [isConnected, inProgress, dispatch])


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
      bitzToken?.balance || new BN(0),
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

  const { classes } = useStyles()


  const generateMockChartData = () => {
    const days = Array.from({ length: 31 }, (_, i) => i + 1)

    const bitzStartValue = 100
    const sBitzStartValue = 100

    const bitzGrowthRate = 0.02  // 2% daily growth
    const sBitzGrowthRate = 0.04 // 4% daily growth

    const bitzData = days.map(day => ({
      x: `Day ${day}`,
      y: Number((bitzStartValue * Math.pow(1 + bitzGrowthRate, day - 1)).toFixed(2))
    }))

    const sBitzData = days.map(day => ({
      x: `Day ${day}`,
      y: Number((sBitzStartValue * Math.pow(1 + sBitzGrowthRate, day - 1)).toFixed(2))
    }))

    return {
      bitzData,
      sBitzData,
      stakedAmount: 100,
      earnedAmount: Number((sBitzData[sBitzData.length - 1].y - bitzData[bitzData.length - 1].y).toFixed(2)),
      earnedAmountUsd: Number(((sBitzData[sBitzData.length - 1].y - bitzData[bitzData.length - 1].y) * 25).toFixed(2)) // Assuming $25 per SOL
    }
  }

  const mockData = generateMockChartData()


  return (
    <Grid container className={classes.wrapper} alignItems='center'>
      <LiquidityStaking
        walletStatus={walletStatus}
        tokens={tokens}
        handleStake={handleStake}
        handleUnstake={handleUnstake}
        inProgress={inProgress}
        success={success}
      />

      <Grid className={classes.filtersContainerOverview}>
        <Box className={classes.switchPoolsContainerOverview}>
          <Box
            className={`${classes.switchPoolsMarker} ${stakeChartTab === StakeChartSwitcher.Stake
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
              className={`${classes.switchPoolsButtonOverview} ${stakeChartTab === StakeChartSwitcher.Stake
                ? classes.selectedToggleButton
                : classes.unselectedToggleButton
                }`}>
              Stake
            </ToggleButton>
            <ToggleButton
              value={StakeChartSwitcher.Stats}
              disableRipple
              className={`${classes.switchPoolsButtonOverview} ${stakeChartTab === StakeChartSwitcher.Stats
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
          <Typography className={classes.statsTitle}>
            Your stats
          </Typography>
          <YourStakeProgress
            processedTokens={processedTokens}
            isLoading={isLoadingDebounced}
            isConnected={isConnected}
          />
        </Box>
      )}
      {stakeChartTab === StakeChartSwitcher.Stake && (
        <Box className={classes.statsContainer}>
          <Typography className={classes.statsTitle}>
            Your stake
          </Typography>
          <StakeChart
            stakedAmount={mockData.stakedAmount}
            earnedAmount={mockData.earnedAmount}
            earnedAmountUsd={mockData.earnedAmountUsd}
            bitzData={mockData.bitzData}
            sBitzData={mockData.sBitzData}
          />
        </Box>
      )}
      <FAQSection />
    </Grid>
  )
}

export default Stake