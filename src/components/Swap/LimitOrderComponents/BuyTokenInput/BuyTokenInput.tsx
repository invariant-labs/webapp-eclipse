import { Box, Grid, Input, Skeleton, Typography } from '@mui/material'
import { formatNumberWithoutSuffix } from '@utils/utils'
import React, { CSSProperties, useRef } from 'react'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import useStyles from './style'

interface IProps {
  setValue: (value: string) => void
  currency: string | null
  value?: string
  placeholder?: string
  style?: CSSProperties
  blocked?: boolean
  blockerInfo?: string
  decimalsLimit: number
  onBlur?: () => void
  percentageChange?: number
  tokenPrice?: number
  disabled?: boolean
  priceLoading?: boolean
  limit?: number
  disableBackgroundColor?: boolean
  setMarketPrice: () => void
}
export const BuyTokenInput: React.FC<IProps> = ({
  currency,
  value,
  setValue,
  placeholder,
  style,
  limit,
  blocked = false,
  blockerInfo,
  onBlur,
  decimalsLimit,
  percentageChange,
  tokenPrice,
  disabled = false,
  priceLoading = false,
  disableBackgroundColor = false,
  setMarketPrice
}) => {
  const { classes } = useStyles({
    disableBackgroundColor
  })

  const inputRef = useRef<HTMLInputElement>(null)

  const allowOnlyDigitsAndTrimUnnecessaryZeros: React.ChangeEventHandler<HTMLInputElement> = e => {
    const inputValue = e.target.value.replace(/,/g, '.')
    const onlyNumbersRegex = /^\d*\.?\d*$/
    const trimDecimal = `^\\d*\\.?\\d{0,${decimalsLimit}}$`
    const regex = new RegExp(trimDecimal, 'g')
    if (inputValue === '' || regex.test(inputValue)) {
      if ((typeof limit !== 'undefined' && +inputValue > limit) || disabled) {
        return
      }

      const startValue = inputValue
      const caretPosition = e.target.selectionStart

      let parsed = inputValue

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
    } else if (!onlyNumbersRegex.test(inputValue)) {
      setValue('')
    } else if (!regex.test(inputValue)) {
      setValue(inputValue.slice(0, inputValue.length - 1))
    }
  }

  const usdBalance = tokenPrice && value ? tokenPrice * +value : 0

  return (
    <Grid container className={classes.wrapper} style={style}>
      <div className={classes.root}>
        <Grid container className={classes.inputContainer}>
          <Input
            className={classes.input}
            classes={{ input: classes.innerInput }}
            inputRef={inputRef}
            value={value}
            disableUnderline={true}
            placeholder={placeholder}
            onChange={allowOnlyDigitsAndTrimUnnecessaryZeros}
            onBlur={onBlur}
            disabled={disabled}
            inputProps={{
              inputMode: 'decimal'
            }}
          />
          <Grid className={classes.currency} container>
            {currency !== null ? (
              <Typography className={classes.currencySymbol}>{currency}</Typography>
            ) : (
              <Typography className={classes.noCurrencyText}>-</Typography>
            )}
          </Grid>
        </Grid>

        <Grid container className={classes.balanceWrapper}>
          <Grid className={classes.percentages} container>
            {currency ? (
              priceLoading ? (
                <Skeleton
                  variant='rounded'
                  height={20}
                  width={100}
                  animation='wave'
                  sx={{ borderRadius: '8px' }}
                />
              ) : tokenPrice ? (
                <Box sx={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {percentageChange && (
                    <Box
                      className={
                        percentageChange > 0
                          ? classes.positiveDifference
                          : classes.negativeDifference
                      }>
                      {percentageChange}%
                    </Box>
                  )}
                  <TooltipHover
                    title='Estimated USD Value of the Entered Tokens'
                    placement='bottom'>
                    <Typography className={classes.estimatedBalance}>
                      ~${formatNumberWithoutSuffix(usdBalance)}
                    </Typography>
                  </TooltipHover>
                </Box>
              ) : (
                <TooltipHover title='Cannot fetch price of token' placement='bottom' top={1}>
                  <Typography className={classes.noData}>
                    <span className={classes.noDataIcon}>?</span>No data
                  </Typography>
                </TooltipHover>
              )
            ) : null}
          </Grid>
          <button className={classes.marketPriceBtn} onClick={setMarketPrice}>
            Set market price
          </button>
        </Grid>
      </div>
      {blocked && (
        <>
          <Grid container className={classes.blocker} />
          <Grid container className={classes.blockedInfoWrapper}>
            <Typography className={classes.blockedInfo}>{blockerInfo}</Typography>
          </Grid>
        </>
      )}
    </Grid>
  )
}

export default BuyTokenInput
