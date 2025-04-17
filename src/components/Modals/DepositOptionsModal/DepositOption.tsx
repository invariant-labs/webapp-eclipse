import React, { useEffect, useRef, useState } from 'react'
import useStyles from './style'
import { Box, Button, Divider, Grid, Input, Tooltip, Typography } from '@mui/material'
import classNames from 'classnames'
import { goldenInfoIcon, infoIcon } from '@static/icons'

interface Props {
  value: string
  valueIndex: number
  setValue: (value: string) => void
  saveValue: (value: string) => void
  options: {
    value: string
    label: string
    message: string
  }[]
  upperValueTreshHold: string
  lowerValueTreshHold: string
  label: string
  description: string
  divider?: boolean
}

const DepositOption: React.FC<Props> = ({
  value,
  setValue,
  saveValue,
  valueIndex,
  description,
  label,
  options,
  upperValueTreshHold,
  lowerValueTreshHold,
  divider
}) => {
  const { classes } = useStyles()
  const inputRef = useRef<HTMLInputElement>(null)
  const [temp, setTemp] = useState<string>(valueIndex === -1 ? value : '')
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

      setTemp(parsed)

      if (caretPosition !== null && parsed !== startValue) {
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.selectionStart = Math.max(caretPosition - diff, 0)
            inputRef.current.selectionEnd = Math.max(caretPosition - diff, 0)
          }
        }, 0)
      }
    } else if (!regex.test(value)) {
      setTemp('0.00')
    }
  }

  const checkValue: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = e => {
    const value = e.target.value
    if (Number(value) > Number(upperValueTreshHold)) {
      setTemp(upperValueTreshHold)
    } else if (Number(value) < Number(lowerValueTreshHold) || isNaN(Number(value))) {
      setTemp(lowerValueTreshHold)
    } else {
      const onlyTwoDigits = '^\\d*\\.?\\d{0,2}$'
      const regex = new RegExp(onlyTwoDigits, 'g')
      if (regex.test(value)) {
        setTemp(value)
      } else {
        setTemp(Number(value).toFixed(2))
      }
    }
  }
  useEffect(() => {
    if (valueIndex !== -1 && temp !== '') setTemp('')
  }, [value, valueIndex])
  return (
    <>
      {divider && <Divider className={classes.divider} />}
      <Typography className={classes.label}>{label}</Typography>
      <Grid container className={classes.defaultOptionsContainer}>
        {options.map((tier, index) => (
          <Button
            className={classNames(
              classes.slippagePercentageButton,
              valueIndex === index && classes.slippagePercentageButtonActive
            )}
            key={tier.value}
            onClick={e => {
              e.preventDefault()
              setValue(Number(options[index].value).toFixed(2))
              saveValue(Number(options[index].value).toFixed(2))
            }}>
            <Box className={classes.singleOption}>
              <Box className={classes.singleOptionValue}>{tier.value}%</Box>
              <Tooltip
                title={
                  <Box className={classes.singleOptionTooltipContainer}>
                    <img src={goldenInfoIcon} alt='' className={classes.singleOptionTooltipIcon} />
                    <Box className={classes.singleOptionMessageContainer}>{tier.message}</Box>
                  </Box>
                }
                classes={{ tooltip: classes.tooltip }}>
                <Typography className={classes.singleItemLabel}>
                  {tier.label}
                  {tier.message !== '' ? (
                    <img
                      src={infoIcon}
                      alt=''
                      className={classNames(classes.grayscaleIcon, classes.labelInfoItem)}
                    />
                  ) : null}
                </Typography>
              </Tooltip>
            </Box>
          </Button>
        ))}
      </Grid>
      <Input
        disableUnderline
        placeholder='0.00'
        className={classNames(
          classes.detailsInfoForm,
          valueIndex === -1 && classes.customSlippageActive
        )}
        type={'text'}
        value={temp}
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
                setValue(Number(temp).toFixed(2))
                saveValue(Number(temp).toFixed(2))
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

      <Typography className={classNames(classes.info, classes.detailsInfoTextContainer)}>
        {description}
      </Typography>
    </>
  )
}

export default DepositOption
