import React, { useEffect, useRef } from 'react'
import useStyles from './style'
import { Box, Button, Divider, Grid, Input, Tooltip, Typography } from '@mui/material'
import classNames from 'classnames'
import icons from '@static/icons'

interface Props {
  value: string
  valueIndex: number
  setValue: (value: string) => void
  setValueIndex: (value: number) => void
  options: { value: string; label: string; message: string }[]
  label: string
  description: string
}

const DepositOption: React.FC<Props> = ({
  value,
  setValue,
  valueIndex,
  setValueIndex,
  description,
  label,
  options
}) => {
  const { classes } = useStyles()
  const inputRef = useRef<HTMLInputElement>(null)

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

      setValue(parsed)

      if (caretPosition !== null && parsed !== startValue) {
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.selectionStart = Math.max(caretPosition - diff, 0)
            inputRef.current.selectionEnd = Math.max(caretPosition - diff, 0)
          }
        }, 0)
      }
    } else if (!regex.test(value)) {
      setValue('0.00')
    }
  }

  const checkValue: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = e => {
    const value = e.target.value

    if (Number(value) > 50) {
      setValue('50.00')
    } else if (Number(value) < 0 || isNaN(Number(value))) {
      setValue('00.00')
    } else {
      const onlyTwoDigits = '^\\d*\\.?\\d{0,2}$'
      const regex = new RegExp(onlyTwoDigits, 'g')
      if (regex.test(value)) {
        setValue(value)
      } else {
        setValue(Number(value).toFixed(2))
      }
    }
  }

  useEffect(() => {
    const initialUtilizationTier = options.findIndex(tier => Number(tier.value) === Number(value))
    setValueIndex(initialUtilizationTier)

    if (initialUtilizationTier !== -1) {
      setValue('')
    }
  }, [])

  return (
    <>
      <Divider className={classes.divider} />
      <Typography className={classes.label}>{label}</Typography>
      <Grid container gap='9px'>
        {options.map((tier, index) => (
          <Button
            className={classNames(
              classes.slippagePercentageButton,
              valueIndex === index && classes.slippagePercentageButtonActive
            )}
            key={tier.value}
            onClick={e => {
              e.preventDefault()
              setValueIndex(index)
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
              <Tooltip
                title={
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      flexDirection: 'row',
                      justifyContent: 'center'
                    }}>
                    <Box width={'12px'}>
                      <img src={icons.goldenInfoCircle} alt='' width={'12px'} height={'12px'} />
                    </Box>
                    <span style={{ width: '141px' }}>{tier.message}</span>
                  </Box>
                }
                classes={{ tooltip: classes.tooltip }}>
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
              </Tooltip>
            </Box>
          </Button>
        ))}
      </Grid>
      <Box marginTop='6px'>
        <Input
          disableUnderline
          placeholder='0.00'
          className={classNames(
            classes.detailsInfoForm,
            valueIndex === -1 && classes.customSlippageActive
          )}
          type={'text'}
          value={value}
          onChange={e => {
            allowOnlyDigitsAndTrimUnnecessaryZeros(e)
            checkValue(e)
          }}
          ref={inputRef}
          startAdornment='Custom'
          endAdornment={
            <>
              %
              <button
                className={classes.detailsInfoBtn}
                onClick={() => {
                  setValue(Number(value).toFixed(2))
                  setValueIndex(-1)
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
      <Typography className={classes.info}>{description}</Typography>
    </>
  )
}

export default DepositOption
