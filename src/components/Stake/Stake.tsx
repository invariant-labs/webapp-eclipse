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
import { colors, typography } from '@static/theme'
import { useDispatch, useSelector } from 'react-redux'

import { useEffect, useMemo, useState } from 'react'
import { BITZ_MAIN, sBITZ_MAIN } from '@store/consts/static'
import { BN } from '@coral-xyz/anchor'
import { YourStakeProgress } from './LiquidityStaking/YourStakeStats/YourProgress'
import { network } from '@store/selectors/solanaConnection'
import { getTokenPrice } from '@utils/utils'
import { calculateTokensForWithdraw } from '@invariant-labs/sbitz'
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

  const [stakeChartTab, setStakeChartTab] = useState(StakeChartSwitcher.Stats)


  const processedTokens = useMemo(() => {
    return {
      sBITZ: new BN(filteredTokens.find(token => token.symbol === sBITZ_MAIN.symbol)?.balance || 0),
      backedByBITZ: backedByBITZData ?? { amount: new BN(0), price: 0 },
    };
  }, [filteredTokens, backedByBITZData]);

  useEffect(() => {
    dispatch(actions.getStakedAmountAndBalance())
  }, [filteredTokens, dispatch, isConnected])

  useEffect(() => {
    if (stakedBitzData.stakedTokenSupply === null || stakedBitzData.stakedAmount === null) {
      return
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


  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (statsLoading) {
      setIsLoadingDebounced(true)
    } else {
      timeout = setTimeout(() => {
        setIsLoadingDebounced(false)
      }, 400)
    }

    return () => clearTimeout(timeout)
  }, [statsLoading])

  const handleToggleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: StakeChartSwitcher
  ) => {
    if (newValue === null) return
    setStakeChartTab(newValue)
  }

  const { classes } = useStyles()


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
            className={classes.switchPoolsMarker}
            sx={{
              left: stakeChartTab === StakeChartSwitcher.Stake ? 0 : '50%'
            }}
          />

          <ToggleButtonGroup
            value={stakeChartTab}
            exclusive
            onChange={handleToggleChange}
            className={classes.switchPoolsButtonsGroupOverview}>
            <ToggleButton
              value={StakeChartSwitcher.Stake}
              disableRipple
              className={classes.switchPoolsButtonOverview}
              style={{
                fontWeight: stakeChartTab === StakeChartSwitcher.Stake ? 700 : 400
              }}>
              Stake
            </ToggleButton>
            <ToggleButton
              value={StakeChartSwitcher.Stats}
              disableRipple
              className={classes.switchPoolsButtonOverview}
              classes={{ disabled: classes.disabledSwitchButton }}
              style={{
                fontWeight: stakeChartTab === StakeChartSwitcher.Stats ? 700 : 400
              }}>
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
      <FAQSection />
    </Grid>
  )
}

export default Stake
