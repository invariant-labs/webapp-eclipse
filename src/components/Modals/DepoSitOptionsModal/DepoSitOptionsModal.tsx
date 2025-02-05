import React, { useEffect, useRef, useState } from 'react'
import useStyles from './style'
import { Box, Button, Divider, Grid, Input, Popover, Typography } from '@mui/material'
import classNames from 'classnames'
import icons from '@static/icons'

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
  setMaxPriceImpact,
  initialMinUtilization,
  setMinUtilization,
  handleClose,
  open,
  anchorEl
}) => {
  const { classes } = useStyles()
  const inputRefUtilization = useRef<HTMLInputElement>(null)
  const inputRefPriceImpact = useRef<HTMLInputElement>(null)

  const [priceImpact, setPriceImpact] = useState<string>(initialMaxPriceImpact)
  const [utilization, setUtilization] = useState<string>(initialMinUtilization)

  const allowOnlyDigitsAndTrimUnnecessaryZeros: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = e => {
    const value = e.target.value

    const regex = /^\d*\.?\d*$/
    if (value === '' || regex.test(value)) {
      const startValue = value
      const caretPosition = e.target.selectionStart

      let parsed = value
      const zerosRegex = /^0+\d+\.?\d*$/
      if (zerosRegex.test(parsed)) {
        parsed = parsed.replace(/^0+/, '')
      }
      const dotRegex = /^\.\d*$/
      if (dotRegex.test(parsed)) {
        parsed = `0${parsed}`
      }

      const diff = startValue.length - parsed.length

      if (e.target === inputRefPriceImpact.current) {
        setPriceImpact(parsed)
      } else if (e.target === inputRefUtilization.current) {
        setUtilization(parsed)
      }

      if (caretPosition !== null && parsed !== startValue) {
        setTimeout(() => {
          if (e.target === inputRefPriceImpact.current) {
            inputRefPriceImpact.current.selectionStart = Math.max(caretPosition - diff, 0)
            inputRefPriceImpact.current.selectionEnd = Math.max(caretPosition - diff, 0)
          } else if (e.target === inputRefUtilization.current) {
            inputRefUtilization.current.selectionStart = Math.max(caretPosition - diff, 0)
            inputRefUtilization.current.selectionEnd = Math.max(caretPosition - diff, 0)
          }
        }, 0)
      }
    } else if (!regex.test(value)) {
      if (e.target === inputRefPriceImpact.current) {
        setPriceImpact('')
      } else if (e.target === inputRefUtilization.current) {
        setUtilization('')
      }
    }
  }

  const chekPriceImpact: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = e => {
    const value = e.target.value

    if (Number(value) > 50) {
      setPriceImpact('50.00')
    } else if (Number(value) < 0 || isNaN(Number(value))) {
      setPriceImpact('00.00')
    } else {
      const onlyTwoDigits = '^\\d*\\.?\\d{0,2}$'
      const regex = new RegExp(onlyTwoDigits, 'g')
      if (regex.test(value)) {
        setPriceImpact(value)
      } else {
        setPriceImpact(Number(value).toFixed(2))
      }
    }
  }

  const checkUtilization: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = e => {
    const value = e.target.value

    if (Number(value) > 100) {
      setUtilization('100')
    } else if (Number(value) < 0 || isNaN(Number(value))) {
      setUtilization('00.00')
    } else {
      const onlyTwoDigits = '^\\d*\\.?\\d{0,2}$'
      const regex = new RegExp(onlyTwoDigits, 'g')
      if (regex.test(value)) {
        setUtilization(value)
      } else {
        setUtilization(Number(value).toFixed(2))
      }
    }
  }

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
  const initialPriceImpactTierIndex = priceImpactTiers.findIndex(tier => tier.value === priceImpact)

  const [priceImpactTierIndex, setPriceImpactTierIndex] = useState(initialPriceImpactTierIndex)

  const setTieredPriceImpact = (tierIndex: number) => {
    setPriceImpactTierIndex(tierIndex)
    setMaxPriceImpact(String(Number(priceImpactTiers[tierIndex]).toFixed(2)))
    setPriceImpact('')
  }

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
  const initialUtilizationIndex = utilizationTiers.findIndex(tier => tier.value === utilization)

  const [utilizationTierIndex, setUtilizationTierIndex] = useState(initialUtilizationIndex)

  const setTieredUtilization = (tierIndex: number) => {
    setUtilizationTierIndex(tierIndex)
    setMinUtilization(String(Number(utilizationTiers[tierIndex]).toFixed(2)))
    setUtilization('')
  }

  useEffect(() => {
    const initialUtilizationTier = utilizationTiers.findIndex(
      tier => String(Number(tier).toFixed(2)) === utilization
    )
    setUtilizationTierIndex(initialUtilizationTier)

    if (initialUtilizationTier !== -1) {
      setUtilization('')
    }

    const initialPriceImpactTier = priceImpactTiers.findIndex(
      tier => String(Number(tier).toFixed(2)) === priceImpact
    )
    setPriceImpactTierIndex(initialPriceImpactTier)

    if (initialPriceImpactTier !== -1) {
      setPriceImpact('')
    }
  }, [])

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
          <Divider className={classes.divider} />
          <Typography className={classes.label}>Maximum Price Impact</Typography>
          <Grid container gap='9px'>
            {priceImpactTiers.map((tier, index) => (
              <Button
                className={classNames(classes.slippagePercentageButton, {
                  [classes.slippagePercentageButtonActive]: index === priceImpactTierIndex
                })}
                key={tier.value}
                onClick={e => {
                  e.preventDefault()
                  setTieredPriceImpact(index)
                }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    height: '100%',
                    gap: '2px'
                  }}>
                  <Box
                    sx={{
                      fontWeight: 700,
                      fontSize: 14,
                      marginTop: '-8px'
                    }}>
                    {tier.value}%
                  </Box>
                  <Typography
                    style={{
                      fontWeight: 400,
                      fontSize: 10,
                      letterSpacing: '-0.03%',
                      textTransform: 'none',
                      marginLeft: '-4px'
                    }}>
                    {tier.label}
                    {tier.message !== '' ? (
                      <img
                        src={icons.infoCircle}
                        alt=''
                        width='8px'
                        style={{ marginTop: '0px', marginLeft: '2px' }}
                        className={classes.grayscaleIcon}
                      />
                    ) : null}
                  </Typography>
                </Box>
              </Button>
            ))}
          </Grid>
          <Box marginTop='6px'>
            <Input
              disableUnderline
              // placeholder='0.00'
              className={classNames(
                classes.detailsInfoForm,
                priceImpactTierIndex === -1 && classes.customSlippageActive
              )}
              type={'text'}
              value={priceImpact}
              onChange={e => {
                allowOnlyDigitsAndTrimUnnecessaryZeros(e)
                chekPriceImpact(e)
              }}
              ref={inputRefPriceImpact}
              startAdornment='Custom'
              endAdornment={
                <>
                  {/* % */}
                  <button
                    className={classes.detailsInfoBtn}
                    onClick={() => {
                      setPriceImpact(Number(priceImpact).toFixed(2))
                      setMaxPriceImpact(String(Number(priceImpact).toFixed(2)))
                      setPriceImpactTierIndex(-1)
                    }}>
                    Save
                  </button>
                </>
              }
              classes={{
                input: classes.innerInput,
                inputAdornedEnd: classes.inputAdornedEnd
              }}
            />
          </Box>
          <Typography className={classes.info}>
            The higher the value, the greater the potential impact of your transaction on the price.
            A high price impact can result in a worse exchange rate, so it is recommended to choose
            default settings.
          </Typography>
          <Divider className={classes.divider} />
          <Typography className={classes.label}>Minimum Utilization</Typography>
          <Grid container gap='9px'>
            {utilizationTiers.map((tier, index) => (
              <Button
                className={classNames(classes.slippagePercentageButton, {
                  [classes.slippagePercentageButtonActive]: index === utilizationTierIndex
                })}
                key={tier.value}
                onClick={e => {
                  e.preventDefault()
                  setTieredUtilization(index)
                }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    height: '100%',
                    gap: '2px'
                  }}>
                  <Box
                    sx={{
                      fontWeight: 700,
                      fontSize: 14,
                      marginTop: '-8px'
                    }}>
                    {tier.value}%
                  </Box>
                  <Typography
                    style={{
                      fontWeight: 400,
                      fontSize: 10,
                      letterSpacing: '-0.03%',
                      textTransform: 'none',
                      marginLeft: '-4px'
                    }}>
                    {tier.label}
                    {tier.message !== '' ? (
                      <img
                        src={icons.infoCircle}
                        alt=''
                        width='8px'
                        style={{ marginTop: '0px', marginLeft: '2px' }}
                        className={classes.grayscaleIcon}
                      />
                    ) : null}
                  </Typography>
                </Box>
              </Button>
            ))}
          </Grid>
          <Box marginTop='6px'>
            <Input
              disableUnderline
              // placeholder='0.00'
              className={classNames(
                classes.detailsInfoForm,
                utilizationTierIndex === -1 && classes.customSlippageActive
              )}
              type={'text'}
              value={utilization}
              onChange={e => {
                allowOnlyDigitsAndTrimUnnecessaryZeros(e)
                checkUtilization(e)
              }}
              ref={inputRefUtilization}
              startAdornment='Custom'
              endAdornment={
                <>
                  <button
                    className={classes.detailsInfoBtn}
                    onClick={() => {
                      setUtilization(Number(utilization).toFixed(2))
                      setMinUtilization(String(Number(utilization).toFixed(2)))
                      setUtilizationTierIndex(-1)
                    }}>
                    Save
                  </button>
                </>
              }
              classes={{
                input: classes.innerInput,
                inputAdornedEnd: classes.inputAdornedEnd
              }}
            />
          </Box>
          <Typography className={classes.info}>
            The higher the value, the more liquidity must remain in the pool after auto swap. A high
            minimum utilization helps prevent excessive price impact and ensures stability for
            liquidity providers. The default setting balances execution and pool stability.
          </Typography>
        </Grid>
      </Popover>
    </>
  )
}
export default DepoSitOptionsModal
