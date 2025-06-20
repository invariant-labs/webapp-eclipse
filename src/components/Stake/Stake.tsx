import { Box, Grid, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import useStyles from './style'
import LiquidityStaking from './LiquidityStaking/LiquidityStaking'
import { Status } from '@store/reducers/solanaWallet'
import { balanceLoading, SwapToken, swapTokens } from '@store/selectors/solanaWallet'
import { StakeLiquidityPayload } from '@store/reducers/sBitz'
import { FAQSection } from './FAQSection/FAQSection'
import { YourStakeProgress } from './LiquidityStaking/YourStakeStats/YourProgress'
import { colors, typography } from '@static/theme'
import { useSelector } from 'react-redux'
import { network } from '@store/selectors/solanaConnection'

import { useProcessedTokens } from '@store/hooks/userOverview/useProcessedToken'
import { useMemo, useState } from 'react'
import { BITZ_MAIN, sBITZ_MAIN } from '@store/consts/static'
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
  const isBalanceLoading = useSelector(balanceLoading)
  const currentNetwork = useSelector(network)


  const { processedTokens, isProcesing } = useProcessedTokens(
    tokensList,
    isBalanceLoading,
    currentNetwork
  )

  const filteredTokens = useMemo(() => {
    return processedTokens.filter(item => item.decimal > 0 && (item.symbol === sBITZ_MAIN.symbol || item.symbol === BITZ_MAIN.symbol))
  }, [processedTokens])
  const hasRelevantTokens = filteredTokens.length > 0

  const isConnected = useMemo(() => walletStatus === Status.Initialized, [walletStatus])
  const [stakeChartTab, setStakeChartTab] = useState(StakeChartSwitcher.Stats)
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

        <Box sx={{ width: '100%', marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography style={{ ...typography.heading4, color: colors.invariant.text, textAlign: 'left', marginBottom: '20px' }}>
            Your stats
          </Typography>
          <YourStakeProgress processedTokens={filteredTokens} isProcesing={isBalanceLoading || isProcesing || !hasRelevantTokens}
            isConnected={isConnected} />
        </Box>
      )}
      <FAQSection />
    </Grid>
  )
}

export default Stake
