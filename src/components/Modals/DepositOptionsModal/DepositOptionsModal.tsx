import React, { useState } from 'react'
import useStyles from './style'
import { Button, Grid, Popover, Typography } from '@mui/material'
import DepositOption from './DepositOption'

const priceImpactTiers = [
  {
    value: '0.1',
    label: 'Low Slippage',
    message: 'Minimizes slippage but may reduce execution probability.'
  },
  {
    value: '0.3',
    label: 'Default',
    message: 'Balanced setting ensuring stable execution and fair pricing.'
  },
  {
    value: '1',
    label: 'High Tolerance',
    message: 'Increases execution likelihood but allows for greater price movement.'
  }
]

const utilizationTiers = [
  {
    value: '75',
    label: 'Volatile Market',
    message: 'Allows swaps even if the pool retains only 75% of its initial liquidity.'
  },
  {
    value: '95',
    label: 'Default',
    message:
      'Prioritizes minimal price impact but may lead to failed swaps if liquidity is insufficient.'
  },
  {
    value: '99',
    label: 'Maximize Capital',
    message:
      'Ensures the pool retains at least 95% liquidity after the swap, balancing execution probability and price stability.'
  }
]

interface Props {
  initialMaxPriceImpact: string
  setMaxPriceImpact: (maxPriceImpact: string) => void
  initialMinUtilization: string
  setMinUtilization: (utilization: string) => void
  handleClose: () => void
  open: boolean
  anchorEl: HTMLButtonElement | null
}

const DepoSitOptionsModal: React.FC<Props> = ({
  initialMaxPriceImpact,
  initialMinUtilization,
  handleClose,
  open,
  anchorEl
}) => {
  const { classes } = useStyles()

  const [priceImpact, setPriceImpact] = useState<string>(initialMaxPriceImpact)
  const [priceImpactTierIndex, setPriceImpactTierIndex] = useState(
    priceImpactTiers.findIndex(tier => Number(tier.value) === Number(initialMaxPriceImpact))
  )
  const [utilization, setUtilization] = useState<string>(initialMinUtilization)
  const [utilizationTierIndex, setUtilizationTierIndex] = useState(
    utilizationTiers.findIndex(tier => Number(tier.value) === Number(initialMinUtilization))
  )

  const [swapSlippageTolerance, setSwapSlippageTolerance] = useState<string>('0.5')
  const [swapSlippageToleranceTierIndex, setSwapSlippageToleranceTierIndex] = useState(1)

  const [createPositionSlippageTolerance, setCreatePositionSlippageTolerance] =
    useState<string>('0.5')
  const [createPositionSlippageToleranceTierIndex, setCreatePositionSlippageToleranceTierIndex] =
    useState(1)

  return (
    <>
      <Popover
        open={open}
        onClose={handleClose}
        classes={{ paper: classes.paper }}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}>
        <Grid container className={classes.detailsWrapper}>
          <Grid container justifyContent='space-between' style={{ marginBottom: 6 }}>
            <Typography component='h2'>Deposit Settings</Typography>
            <Button className={classes.selectTokenClose} onClick={handleClose} aria-label='Close' />
            <Typography className={classes.info}>
              These settings enable liquidity addition with any token ratio while ensuring safe
              swaps. Adjusting these parameters is recommended for advanced users familiar with
              their purpose
            </Typography>
          </Grid>

          <Grid container item spacing={3}>
            <Grid item xs={6}>
              <DepositOption
                description={
                  'The higher the value, the greater the potential impact of your transaction on the price. A high price impact can result in a worse exchange rate, so it is recommended to choose default settings.'
                }
                label='Maximum Price Impact'
                options={priceImpactTiers}
                setValue={setPriceImpact}
                setValueIndex={setPriceImpactTierIndex}
                value={priceImpact}
                valueIndex={priceImpactTierIndex}
              />
            </Grid>
            <Grid item xs={6}>
              <DepositOption
                description={
                  'The higher the value, the greater the potential impact of your transaction on the price. A high price impact can result in a worse exchange rate, so it is recommended to choose default settings.'
                }
                label='Slippage Tolerance Swap'
                options={priceImpactTiers}
                setValue={setSwapSlippageTolerance}
                setValueIndex={setSwapSlippageToleranceTierIndex}
                value={swapSlippageTolerance}
                valueIndex={swapSlippageToleranceTierIndex}
              />
            </Grid>
            <Grid item xs={6}>
              <DepositOption
                description={
                  'The higher the value, the more liquidity must remain in the pool after auto swap. A high minimum utilization helps prevent excessive price impact and ensures stability for liquidity providers. The default setting balances execution and pool stability.'
                }
                label='Minimum Utilization'
                options={utilizationTiers}
                setValue={setUtilization}
                setValueIndex={setUtilizationTierIndex}
                value={utilization}
                valueIndex={utilizationTierIndex}
              />
            </Grid>
            <Grid item xs={6}>
              <DepositOption
                description={
                  'The higher the value, the more liquidity must remain in the pool after auto swap. A high minimum utilization helps prevent excessive price impact and ensures stability for liquidity providers. The default setting balances execution and pool stability.'
                }
                label='Slippage Tolerance Create Position'
                options={utilizationTiers}
                setValue={setCreatePositionSlippageTolerance}
                setValueIndex={setCreatePositionSlippageToleranceTierIndex}
                value={createPositionSlippageTolerance}
                valueIndex={createPositionSlippageToleranceTierIndex}
              />
            </Grid>
          </Grid>
        </Grid>
      </Popover>
    </>
  )
}
export default DepoSitOptionsModal
