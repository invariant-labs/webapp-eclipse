import { Box, Grid, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import useStyles from './style'
import LiquidityStaking from './LiquidityStaking/LiquidityStaking'
import { Status } from '@store/reducers/solanaWallet'
import { SwapToken, swapTokens } from '@store/selectors/solanaWallet'
import { actions, StakeLiquidityPayload } from '@store/reducers/sBitz'
import {
  backedByBITZ,
  stakeStatsLoading,
  backedByBITZLoading
} from '@store/selectors/stake'; import { FAQSection } from './FAQSection/FAQSection'
import { colors, typography } from '@static/theme'
import { useDispatch, useSelector } from 'react-redux'

import { useEffect, useMemo, useState } from 'react'
import { sBITZ_MAIN } from '@store/consts/static'
import { BN } from '@coral-xyz/anchor'
import { YourStakeProgress } from './LiquidityStaking/YourStakeStats/YourProgress'
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
  const dispatch = useDispatch()

  const filteredTokens = useMemo(() => {
    return tokensList.filter(item => item.decimals > 0 && (item.symbol === sBITZ_MAIN.symbol))
  }, [tokensList])

  const isConnected = useMemo(() => walletStatus === Status.Initialized, [walletStatus])

  const backedBitzData = useSelector(backedByBITZ)
  const statsLoading = useSelector(stakeStatsLoading)
  const backedByBITZDataLoading = useSelector(backedByBITZLoading)

  const isDataLoading = statsLoading || backedByBITZDataLoading
  const [stakeChartTab, setStakeChartTab] = useState(StakeChartSwitcher.Stats)


  useEffect(() => {
    dispatch(actions.getStakedAmountAndBalance())
    const sBitzToken = filteredTokens.find(token => token.symbol === sBITZ_MAIN.symbol)
    dispatch(actions.getBackedByBITZ({
      tokenAddress: sBitzToken?.assetAddress.toString(),
      amount: new BN(sBitzToken?.balance || 0)
    }))

  }, [filteredTokens, dispatch, isConnected])

  const handleToggleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: StakeChartSwitcher
  ) => {
    if (newValue === null) return
    setStakeChartTab(newValue)
  }
  const { classes } = useStyles()
  useEffect(() => {
    console.log(stakeStatsLoading, 'loading stake')
  }, [stakeStatsLoading])
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

        <Box sx={{ width: '100%', marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography style={{ ...typography.heading4, color: colors.invariant.text, textAlign: 'left', marginBottom: '20px' }}>
            Your stats
          </Typography>
          <YourStakeProgress
            processedTokens={{
              sBITZ: new BN(filteredTokens.find(token => token.symbol === sBITZ_MAIN.symbol)?.balance || 0),
              backedByBITZ: backedBitzData || { tokenAddress: undefined, amount: new BN(0), tokenPrice: 0 },
            }}
            isLoading={isDataLoading}
            isConnected={isConnected}
          />
        </Box>
      )}
      <FAQSection />
    </Grid>
  )
}

export default Stake
