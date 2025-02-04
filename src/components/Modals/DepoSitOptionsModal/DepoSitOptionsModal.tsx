import React, { useEffect, useRef, useState } from 'react'
import useStyles from './style'
import { Box, Button, Divider, Grid, Input, Popover, Typography } from '@mui/material'
import classNames from 'classnames'

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

  const priceImpactTiers = ['0.3', '0.5', '1']
  const initialPriceImpactTierIndex = priceImpactTiers.findIndex(tier => tier === priceImpact)

  const [priceImpactTierIndex, setPriceImpactTierIndex] = useState(initialPriceImpactTierIndex)

  const setTieredPriceImpact = (tierIndex: number) => {
    setPriceImpactTierIndex(tierIndex)
    setMaxPriceImpact(String(Number(priceImpactTiers[tierIndex]).toFixed(2)))
    setPriceImpact('')
  }

  const utilizationTiers = ['90', '95', '100']
  const initialUtilizationIndex = priceImpactTiers.findIndex(tier => tier === priceImpact)

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
          </Grid>
          <Typography className={classes.label}>Maximum Price Impact</Typography>
          <Grid container gap='9px'>
            {priceImpactTiers.map((tier, index) => (
              <Button
                key={tier}
                className={classNames(classes.slippagePercentageButton, {
                  [classes.slippagePercentageButtonActive]: index === priceImpactTierIndex
                })}
                onClick={e => {
                  e.preventDefault()
                  setTieredPriceImpact(index)
                }}>
                {tier}%
              </Button>
            ))}
          </Grid>
          <Box marginTop='6px'>
            <Input
              disableUnderline
              placeholder='0.00'
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
                  %
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
            lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum
            lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum
          </Typography>
          <Divider className={classes.divider} />
          <Typography className={classes.label}>Minimum Utilization</Typography>
          <Grid container gap='9px'>
            {utilizationTiers.map((tier, index) => (
              <Button
                key={tier}
                className={classNames(classes.slippagePercentageButton, {
                  [classes.slippagePercentageButtonActive]: index === utilizationTierIndex
                })}
                onClick={e => {
                  e.preventDefault()
                  setTieredUtilization(index)
                }}>
                {tier}%
              </Button>
            ))}
          </Grid>
          <Box marginTop='6px'>
            <Input
              disableUnderline
              placeholder='0.00'
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
                  %
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
            lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum
            lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum
          </Typography>
        </Grid>
      </Popover>
    </>
  )
}
export default DepoSitOptionsModal
