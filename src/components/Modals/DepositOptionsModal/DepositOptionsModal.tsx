import React, { useMemo, useState } from 'react'
import useStyles from './style'
import { Box, Button, Divider, Grid, Popover, Typography } from '@mui/material'
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

const slippageToleranceSwapTiers = [
  {
    value: '0.3',
    label: 'Low Slippage',
    message: 'Minimizes slippage but may reduce execution probability.'
  },
  {
    value: '0.5',
    label: 'Default',
    message: 'Balanced setting ensuring stable execution and fair pricing.'
  },
  {
    value: '1',
    label: 'High Tolerance',
    message: 'Increases execution likelihood but allows for greater price movement.'
  }
]

const slippageToleranceCreatePositionTiers = [
  {
    value: '0.3',
    label: 'Low Slippage',
    message: 'Minimizes slippage but may reduce execution probability.'
  },
  {
    value: '0.5',
    label: 'Default',
    message: 'Balanced setting ensuring stable execution and fair pricing.'
  },
  {
    value: '1',
    label: 'High Tolerance',
    message: 'Increases execution likelihood but allows for greater price movement.'
  }
]

interface Props {
  initialMaxPriceImpact: string
  setMaxPriceImpact: (priceImpact: string) => void
  initialMinUtilization: string
  setMinUtilization: (utilization: string) => void
  handleClose: () => void
  initialMaxSlippageToleranceSwap: string
  setMaxSlippageToleranceSwap: (slippageToleranceSwap: string) => void
  initialMaxSlippageToleranceCreatePosition: string
  setMaxSlippageToleranceCreatePosition: (slippageToleranceCreatePosition: string) => void
  open: boolean
  anchorEl: HTMLButtonElement | null
}

const DepoSitOptionsModal: React.FC<Props> = ({
  initialMaxPriceImpact,
  initialMinUtilization,
  initialMaxSlippageToleranceSwap,
  initialMaxSlippageToleranceCreatePosition,
  setMaxPriceImpact,
  setMinUtilization,
  setMaxSlippageToleranceCreatePosition,
  setMaxSlippageToleranceSwap,
  handleClose,
  open,
  anchorEl
}) => {
  const { classes } = useStyles()

  const [priceImpact, setPriceImpact] = useState<string>(initialMaxPriceImpact)
  const priceImpactTierIndex = useMemo(
    () => priceImpactTiers.findIndex(tier => Number(tier.value) === Number(priceImpact)),
    [priceImpact]
  )
  const [utilization, setUtilization] = useState<string>(initialMinUtilization)
  const utilizationTierIndex = useMemo(
    () => utilizationTiers.findIndex(tier => Number(tier.value) === Number(utilization)),
    [utilization]
  )

  const [swapSlippageTolerance, setSwapSlippageTolerance] = useState<string>(
    initialMaxSlippageToleranceSwap
  )
  const swapSlippageToleranceTierIndex = useMemo(
    () =>
      slippageToleranceSwapTiers.findIndex(
        tier => Number(tier.value) === Number(swapSlippageTolerance)
      ),
    [swapSlippageTolerance]
  )

  const [createPositionSlippageTolerance, setCreatePositionSlippageTolerance] = useState<string>(
    initialMaxSlippageToleranceCreatePosition
  )

  const createPositionSlippageToleranceTierIndex = useMemo(
    () =>
      slippageToleranceCreatePositionTiers.findIndex(
        tier => Number(tier.value) === Number(createPositionSlippageTolerance)
      ),
    [createPositionSlippageTolerance]
  )

  return (
    <>
      <Popover
        open={open}
        onClose={handleClose}
        classes={{ paper: classes.paper }}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}>
        <Grid container className={classes.detailsWrapper}>
          <Grid container>
            <Box
              width={'100%'}
              display={'flex'}
              flexDirection={'row'}
              justifyContent={'center'}
              alignItems={'center'}
              gap={'12px'}>
              <Box
                width={'100%'}
                display={'flex'}
                flexDirection={'column'}
                justifyContent={'flex-start'}
                alignItems={'flex-start'}
                maxWidth={'502px'}>
                <Typography className={classes.headerText}>Deposit Settings</Typography>
                <Typography className={classes.info}>
                  These settings enable liquidity addition with any token ratio while ensuring safe
                  swaps. Adjusting these parameters is recommended for advanced users familiar with
                  their purpose
                </Typography>
              </Box>
              <Button
                className={classes.setAsDefaultBtn}
                disableRipple
                disableElevation
                disableFocusRipple
                onClick={() => {
                  setMaxPriceImpact(
                    Number(priceImpactTiers.find(item => item.label === 'Default')!.value).toFixed(
                      2
                    )
                  )
                  setMinUtilization(
                    Number(utilizationTiers.find(item => item.label === 'Default')!.value).toFixed(
                      2
                    )
                  )
                  setMaxSlippageToleranceCreatePosition(
                    Number(
                      slippageToleranceCreatePositionTiers.find(item => item.label === 'Default')!
                        .value
                    ).toFixed(2)
                  )
                  setMaxSlippageToleranceSwap(
                    Number(
                      slippageToleranceSwapTiers.find(item => item.label === 'Default')!.value
                    ).toFixed(2)
                  )
                  setCreatePositionSlippageTolerance(
                    Number(
                      slippageToleranceCreatePositionTiers.find(item => item.label === 'Default')!
                        .value
                    ).toFixed(2)
                  )
                  setSwapSlippageTolerance(
                    Number(
                      slippageToleranceSwapTiers.find(item => item.label === 'Default')!.value
                    ).toFixed(2)
                  )
                  setUtilization(
                    Number(utilizationTiers.find(item => item.label === 'Default')!.value).toFixed(
                      2
                    )
                  )
                  setPriceImpact(
                    Number(priceImpactTiers.find(item => item.label === 'Default')!.value).toFixed(
                      2
                    )
                  )
                }}>
                Set as Default
              </Button>
            </Box>
          </Grid>
          <Divider className={classes.divider} />
          <Box
            display={'flex'}
            justifyContent={'space-between'}
            alignItems={'center'}
            flexDirection={'row'}>
            <Box
              display={'flex'}
              justifyContent={'flex-start'}
              alignItems={'flex-start'}
              flexDirection={'column'}>
              <DepositOption
                description={
                  'The higher the value, the greater the potential impact of your transaction on the price. A high price impact can result in a worse exchange rate, so it is recommended to choose default settings.'
                }
                label='Maximum Price Impact'
                options={priceImpactTiers}
                setValue={setPriceImpact}
                saveValue={setMaxPriceImpact}
                value={priceImpact}
                valueIndex={priceImpactTierIndex}
                upperValueTreshHold={'50'}
                lowerValueTreshHold={'0'}
              />
              <DepositOption
                description={
                  'The higher the value, the more liquidity must remain in the pool after auto swap. A high minimum utilization helps prevent excessive price impact and ensures stability for liquidity providers. The default setting balances execution and pool stability.'
                }
                label='Minimum Utilization'
                options={utilizationTiers}
                setValue={setUtilization}
                saveValue={setMinUtilization}
                value={utilization}
                valueIndex={utilizationTierIndex}
                upperValueTreshHold={'100'}
                lowerValueTreshHold={'0'}
                divider
              />
            </Box>
            <Divider className={classes.dividerHorizontal} />
            <Box
              display={'flex'}
              justifyContent={'flex-start'}
              alignItems={'flex-start'}
              flexDirection={'column'}>
              <DepositOption
                description={
                  'The higher the value, the greater the potential impact of your transaction on the price. A high price impact can result in a worse exchange rate, so it is recommended to choose default settings.'
                }
                label='Slippage Tolerance Swap'
                options={slippageToleranceSwapTiers}
                setValue={setSwapSlippageTolerance}
                saveValue={setMaxSlippageToleranceSwap}
                value={swapSlippageTolerance}
                valueIndex={swapSlippageToleranceTierIndex}
                upperValueTreshHold={'50'}
                lowerValueTreshHold={'0'}
              />
              <DepositOption
                description={
                  'The higher the value, the more liquidity must remain in the pool after auto swap. A high minimum utilization helps prevent excessive price impact and ensures stability for liquidity providers. The default setting balances execution and pool stability.'
                }
                label='Slippage Tolerance Create Position'
                options={slippageToleranceCreatePositionTiers}
                setValue={setCreatePositionSlippageTolerance}
                saveValue={setMaxSlippageToleranceCreatePosition}
                value={createPositionSlippageTolerance}
                valueIndex={createPositionSlippageToleranceTierIndex}
                upperValueTreshHold={'50'}
                lowerValueTreshHold={'0'}
                divider
              />
            </Box>
          </Box>
        </Grid>
      </Popover>
    </>
  )
}
export default DepoSitOptionsModal
