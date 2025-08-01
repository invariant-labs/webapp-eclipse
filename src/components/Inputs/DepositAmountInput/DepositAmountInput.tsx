import { Box, Grid, Input, Typography } from '@mui/material'
import loadingAnimation from '@static/gif/loading.gif'
import { formatNumberWithSuffix, formatNumberWithoutSuffix, getScaleFromString } from '@utils/utils'
import React, { CSSProperties, useRef } from 'react'
import useStyles from './style'
import { unknownTokenIcon, warningIcon } from '@static/icons'
import { getButtonClassName } from '@utils/uiUtils'
import { OutlinedButton } from '@common/OutlinedButton/OutlinedButton'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'

interface ActionButton {
  label: string
  onClick: () => void
  disabled?: boolean
  variant?: 'max' | 'half'
  customClass?: string
}

interface IProps {
  setValue: (value: string) => void
  currency: string | null
  currencyIconSrc?: string
  currencyIsUnknown: boolean
  value?: string
  placeholder?: string
  style?: CSSProperties
  blocked?: boolean
  blockerInfo?: string
  decimalsLimit: number
  onBlur?: () => void
  percentageChange?: number
  tokenPrice?: number
  balanceValue?: string
  disabled?: boolean
  priceLoading?: boolean
  limit?: number

  isBalanceLoading: boolean
  disableBackgroundColor?: boolean
  walletUninitialized: boolean
  actionButtons?: ActionButton[]
}
export const DepositAmountInput: React.FC<IProps> = ({
  currency,
  currencyIconSrc,
  currencyIsUnknown,
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
  balanceValue,
  disabled = false,
  priceLoading = false,
  disableBackgroundColor = false,
  isBalanceLoading,
  actionButtons = [],
  walletUninitialized
}) => {
  const { classes } = useStyles({ isSelected: !!currency && !walletUninitialized, disableBackgroundColor })

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
      const zerosRegex = /^0+\d+\.?\d*$/
      if (zerosRegex.test(parsed)) {
        parsed = parsed.replace(/^0+/, '')
      }
      const dotRegex = /^\.\d*$/
      if (dotRegex.test(parsed)) {
        parsed = `0${parsed}`
      }
      if (getScaleFromString(parsed) > decimalsLimit) {
        const parts = parsed.split('.')
        parsed = parts[0] + '.' + parts[1].slice(0, decimalsLimit)
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

  const renderActionButton = (button: ActionButton) => {
    const buttonClassName = getButtonClassName({
      label: button.variant ?? 'max',
      variants: [
        { label: 'max', className: classes.maxVariant },
        { label: 'half', className: classes.halfVariant }
      ],
      default: classes.actionButton
    })
    return (
      <OutlinedButton
        name={button.label}
        key={button.label}
        onClick={button.onClick}
        disabled={button.disabled || walletUninitialized || !currency}
        className={
          currency && !walletUninitialized
            ? buttonClassName
            : `${classes.actionButton} ${classes.actionButtonNotActive}`
        }
      />
    )
  }

  return (
    <Grid container className={classes.wrapper} style={style}>
      <div className={classes.root}>
        <Grid container className={classes.inputContainer}>
          <Grid className={classes.currency} container>
            {currency !== null ? (
              <>
                <Box className={classes.imageContainer}>
                  <img
                    alt='currency icon'
                    src={currencyIconSrc ?? unknownTokenIcon}
                    className={classes.currencyIcon}
                    onError={e => {
                      e.currentTarget.src = unknownTokenIcon
                    }}
                  />
                  {currencyIsUnknown && <img className={classes.warningIcon} src={warningIcon} />}
                </Box>
                <Typography className={classes.currencySymbol}>{currency}</Typography>
              </>
            ) : (
              <Typography className={classes.noCurrencyText}>-</Typography>
            )}
          </Grid>

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
        </Grid>

        <Grid container className={classes.balanceWrapper}>
          <Grid className={classes.balance} container>
            <Typography className={classes.caption2} onClick={() => actionButtons[0].onClick()}>
              Balance:{' '}
              {walletUninitialized ? (
                <>-</>
              ) : isBalanceLoading ? (
                <img src={loadingAnimation} className={classes.loadingBalance} alt='loading' />
              ) : (
                <>{formatNumberWithSuffix(balanceValue || 0)}</>
              )}{' '}
              {currency}
            </Typography>
            {actionButtons.map(renderActionButton)}
            {/* <Button
              className={
                currency && !walletUninitialized
                  ? classes.maxButton
                  : `${classes.maxButton} ${classes.maxButtonNotActive}`
              }>
              Max
            </Button> */}
          </Grid>
          <Grid className={classes.percentages} container>
            {currency ? (
              priceLoading ? (
                <img src={loadingAnimation} className={classes.loading} alt='loading' />
              ) : tokenPrice ? (
                <Box sx={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {percentageChange && (

                    <Box className={percentageChange > 0 ? classes.positiveDifference : classes.negativeDifference}>{percentageChange}%</Box>
                  )}
                  <TooltipHover title='Estimated USD Value of the Entered Tokens' placement='bottom'>
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

export default DepositAmountInput
