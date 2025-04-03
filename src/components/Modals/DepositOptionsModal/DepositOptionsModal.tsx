import React, { useCallback, useMemo, useState } from 'react'
import useStyles from './style'
import {
  Box,
  Button,
  Divider,
  Grid,
  Popover,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery
} from '@mui/material'
import DepositOption from './DepositOption'
import { theme } from '@static/theme'
import classNames from 'classnames'

enum SettingsOptions {
  Basic = 'Basic',
  Advanced = 'Advanced'
}

const priceImpactTiers = [
  {
    value: '0.1',
    label: 'Low price impact',
    message:
      'Minimizes price impact but may reduce execution probability when there is not enough liquidity.'
  },
  {
    value: '0.3',
    label: 'Default',
    message: 'Balanced setting ensuring stable execution and fair pricing.'
  },
  {
    value: '0.5',
    label: 'High Tolerance',
    message: 'Increases execution likelihood but allows for greater price movement.'
  }
]
const priceImpactSetting = {
  description:
    'The higher the value, the greater the potential impact of your transaction on the price. A high price impact can result in a worse exchange rate, so it is recommended to choose default settings.',
  label: 'Maximum Price Impact',
  upperValueTreshHold: '50',
  lowerValueTreshHold: '0'
}

const utilizationTiers = [
  {
    value: '90',
    label: 'Volatile Market',
    message: 'Allows swaps even if the pool retains only 90% of its initial liquidity.'
  },
  {
    value: '95',
    label: 'Default',
    message:
      'Ensures the pool retains 95% liquidity after the swap, balancing execution probability and price stability.'
  },
  {
    value: '99',
    label: 'Maximize Capital',
    message:
      'Prioritizes minimal price impact but may lead to failed swaps if liquidity is insufficient.'
  }
]
const utilizationSetting = {
  description:
    'The higher the value, the more liquidity must remain in the pool after auto swap. A high minimum utilization helps prevent excessive price impact and ensures stability for liquidity providers. The default setting balances execution and pool stability.',
  label: 'Minimum Utilization',
  upperValueTreshHold: '100',
  lowerValueTreshHold: '0'
}

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
const slippageToleranceSwapSetting = {
  description:
    'Slippage tolerance is a pricing difference between the price at the confirmation time and the actual price of the transaction users are willing to accept when exchanging tokens.',
  label: 'Slippage Tolerance Swap',
  upperValueTreshHold: '50',
  lowerValueTreshHold: '0'
}

const slippageToleranceCreatePositionTiers = [
  {
    value: '1',
    label: 'Low Slippage',
    message: 'Minimizes slippage but may reduce execution probability.'
  },
  {
    value: '2.5',
    label: 'Default',
    message: 'Balanced setting ensuring stable execution and fair pricing.'
  },
  {
    value: '5',
    label: 'High Tolerance',
    message: 'Increases execution likelihood but allows for greater price movement.'
  }
]
const slippageToleranceCreatePositionSetting = {
  description:
    'Slippage tolerance is a pricing difference between the price at the confirmation time and the actual price of the transaction users are willing to accept when initializing position.',
  label: 'Slippage Tolerance Create Position',
  upperValueTreshHold: '50',
  lowerValueTreshHold: '0'
}

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
  open
}) => {
  const { classes } = useStyles()
  const isSm = useMediaQuery(theme.breakpoints.down('sm'))
  const [alignment, setAlignment] = useState<SettingsOptions>(SettingsOptions.Basic)

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

  const priceImpactOption = useMemo(
    () => (
      <DepositOption
        {...priceImpactSetting}
        options={priceImpactTiers}
        setValue={setPriceImpact}
        saveValue={setMaxPriceImpact}
        value={priceImpact}
        valueIndex={priceImpactTierIndex}
        divider
      />
    ),
    [priceImpactTiers, setPriceImpact, setMaxPriceImpact, priceImpact, priceImpactTierIndex]
  )

  const minUtilizationOption = useMemo(
    () => (
      <DepositOption
        {...utilizationSetting}
        options={utilizationTiers}
        setValue={setUtilization}
        saveValue={setMinUtilization}
        value={utilization}
        valueIndex={utilizationTierIndex}
      />
    ),
    [utilizationTiers, setUtilization, setMinUtilization, utilization, utilizationTierIndex]
  )

  const swapSlippageOption = useMemo(
    () => (
      <DepositOption
        {...slippageToleranceSwapSetting}
        options={slippageToleranceSwapTiers}
        setValue={setSwapSlippageTolerance}
        saveValue={setMaxSlippageToleranceSwap}
        value={swapSlippageTolerance}
        valueIndex={swapSlippageToleranceTierIndex}
      />
    ),
    [
      slippageToleranceSwapTiers,
      setSwapSlippageTolerance,
      setMaxSlippageToleranceSwap,
      swapSlippageTolerance,
      swapSlippageToleranceTierIndex
    ]
  )

  const positionSlippageOption = useMemo(
    () => (
      <DepositOption
        {...slippageToleranceCreatePositionSetting}
        options={slippageToleranceCreatePositionTiers}
        setValue={setCreatePositionSlippageTolerance}
        saveValue={setMaxSlippageToleranceCreatePosition}
        value={createPositionSlippageTolerance}
        valueIndex={createPositionSlippageToleranceTierIndex}
        divider
      />
    ),
    [
      slippageToleranceCreatePositionTiers,
      setCreatePositionSlippageTolerance,
      setMaxSlippageToleranceCreatePosition,
      createPositionSlippageTolerance,
      createPositionSlippageToleranceTierIndex
    ]
  )

  const resetSettings = useCallback(() => {
    if (alignment === SettingsOptions.Basic) {
      setMaxPriceImpact(
        Number(priceImpactTiers.find(item => item.label === 'Default')!.value).toFixed(2)
      )
      setMinUtilization(
        Number(utilizationTiers.find(item => item.label === 'Default')!.value).toFixed(2)
      )
      setUtilization(
        Number(utilizationTiers.find(item => item.label === 'Default')!.value).toFixed(2)
      )
      setPriceImpact(
        Number(priceImpactTiers.find(item => item.label === 'Default')!.value).toFixed(2)
      )
    } else {
      setMaxSlippageToleranceCreatePosition(
        Number(
          slippageToleranceCreatePositionTiers.find(item => item.label === 'Default')!.value
        ).toFixed(2)
      )
      setMaxSlippageToleranceSwap(
        Number(slippageToleranceSwapTiers.find(item => item.label === 'Default')!.value).toFixed(2)
      )
      setCreatePositionSlippageTolerance(
        Number(
          slippageToleranceCreatePositionTiers.find(item => item.label === 'Default')!.value
        ).toFixed(2)
      )
      setSwapSlippageTolerance(
        Number(slippageToleranceSwapTiers.find(item => item.label === 'Default')!.value).toFixed(2)
      )
    }
  }, [alignment])

  const availableSettings = useMemo(() => {
    if (alignment === SettingsOptions.Basic) {
      return [minUtilizationOption, priceImpactOption]
    } else {
      return [swapSlippageOption, positionSlippageOption]
    }
  }, [
    alignment,
    positionSlippageOption,
    priceImpactOption,
    swapSlippageOption,
    minUtilizationOption
  ])

  const handleSwitchSettingsType = (
    _: React.MouseEvent<HTMLElement>,
    newAlignment: SettingsOptions | null
  ) => {
    if (newAlignment !== null) {
      setAlignment(newAlignment)
    }
  }

  return (
    <>
      <Popover
        open={open}
        onClose={handleClose}
        classes={{ paper: classes.paper }}
        anchorOrigin={{
          vertical: isSm ? 'top' : 'center',
          horizontal: 'center'
        }}
        transformOrigin={{
          vertical: isSm ? 'top' : 'center',
          horizontal: 'center'
        }}>
        <Grid container className={classes.detailsWrapper}>
          <Grid container>
            <Box className={classes.headerContainer}>
              <Typography className={classes.headerText}>Autoswap Settings</Typography>
              <Typography className={classes.info}>
                These settings enable liquidity addition with any token ratio while ensuring safe
                swaps. Adjusting these parameters is recommended for advanced users familiar with
                their purpose
              </Typography>
              <Button className={classes.closeModal} onClick={handleClose} aria-label='Close' />
            </Box>
            <Box className={classes.switchSettingsTypeContainer}>
              <Box
                className={classes.switchSettingsTypeMarker}
                sx={{
                  left: alignment === SettingsOptions.Basic ? 0 : '50%'
                }}
              />
              <ToggleButtonGroup
                value={alignment}
                exclusive
                onChange={handleSwitchSettingsType}
                className={classes.switchSettingsTypeButtonsGroup}>
                <ToggleButton
                  value={SettingsOptions.Basic}
                  disableRipple
                  className={classNames(
                    classes.switchSettingsTypeButton,
                    alignment === SettingsOptions.Basic
                      ? classes.switchSelected
                      : classes.switchNotSelected
                  )}>
                  Basic
                </ToggleButton>
                <ToggleButton
                  value={SettingsOptions.Advanced}
                  disableRipple
                  className={classNames(
                    classes.switchSettingsTypeButton,
                    alignment === SettingsOptions.Advanced
                      ? classes.switchSelected
                      : classes.switchNotSelected
                  )}>
                  Advanced
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Grid>
          <Divider className={classes.divider} />
          <Box className={classes.optionsContainer}>{availableSettings.map(item => item)}</Box>
          <Divider className={classes.divider} />
          <Button
            className={classes.setAsDefaultBtn}
            disableRipple
            disableElevation
            disableFocusRipple
            onClick={resetSettings}>
            Restore Default
          </Button>
        </Grid>
      </Popover>
    </>
  )
}
export default DepoSitOptionsModal
