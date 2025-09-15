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

enum SettingsOptions {
  Basic = 'Basic',
  Advanced = 'Advanced'
}

const priceImpactTiers = [
  {
    value: '0.3',
    label: 'Low price impact',
    message: 'Best protection against unfavorable prices, but may fail with large positions'
  },
  {
    value: '0.5',
    label: 'Default',
    message: 'Most balanced between price protection and execution success'
  },
  {
    value: '1',
    label: 'High Tolerance',
    message: 'Higher risk of unfavorable prices; used for fast or guaranteed execution'
  }
]
const priceImpactSetting = {
  description:
    'Maximum price impact sets the highest acceptable change in price caused by a swap that rebalances the token ratio before opening a position. A high price impact can result in less favorable exchange rates.',
  label: 'Maximum Price Impact',
  upperValueTreshHold: '50',
  lowerValueTreshHold: '0'
}

const utilizationTiers = [
  {
    value: '90',
    label: 'Volatile Market',
    message: 'Supports volatile markets, allowing up to 10% capital unused'
  },
  {
    value: '95',
    label: 'Default',
    message: 'Aims to use 95% of capital post-swap, suitable for most pools and conditions.'
  },
  {
    value: '99',
    label: 'Maximize Capital',
    message: 'Tries to use full capital but may retry if price fluctuates'
  }
]
const utilizationSetting = {
  description:
    'Minimal utilization sets the minimum amount of declared capital that must be used in a created position. It ensures that unused capital stays within acceptable limits. If market volatility causes low usage, the transaction automatically reverts.',
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
  label: 'Swap Slippage Tolerance',
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
  label: 'Position Slippage Tolerance',
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
  const { classes, cx } = useStyles()

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
  const isSm = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Popover
      open={open}
      onClose={handleClose}
      classes={{ paper: classes.paper, root: classes.root }}
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
                className={cx(
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
                className={cx(
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
        {isSm && (
          <>
            <Button
              className={classes.setAsDefaultBtn}
              disableRipple
              disableElevation
              disableFocusRipple
              onClick={resetSettings}>
              Restore Default
            </Button>
            <Divider className={classes.divider} />
          </>
        )}
        {availableSettings.map((item, index) => (
          <React.Fragment key={index}>{item}</React.Fragment>
        ))}
        {!isSm && (
          <>
            <Divider className={classes.divider} />
            <Button
              className={classes.setAsDefaultBtn}
              disableRipple
              disableElevation
              disableFocusRipple
              onClick={resetSettings}>
              Restore Default
            </Button>
          </>
        )}
      </Grid>
    </Popover>
  )
}
export default DepoSitOptionsModal
