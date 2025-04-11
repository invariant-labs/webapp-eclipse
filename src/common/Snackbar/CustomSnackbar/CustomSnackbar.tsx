import React, { useCallback, useMemo } from 'react'
import { CustomContentProps, useSnackbar } from 'notistack'
import { actions } from '@store/reducers/snackbars'
import {
  StyledBackground,
  StyledCircularProgress,
  StyledCloseButton,
  StyledContainer,
  StyledDetails,
  StyledHideContainer,
  StyledIcon,
  StyledSnackbarContent,
  StyledTitle,
  useStyles
} from './style'
import { Grid } from '@mui/material'
import { useDispatch } from 'react-redux'
import { closeIcon, newTabIcon } from '@static/icons'
import { colors } from '@static/theme'
import { NetworkType } from '@store/consts/static'
import SwapSnackbar from './variants/SwapSnackbar'

const variantColors: Record<string, string> = {
  default: '#000000',
  success: colors.invariant.green,
  error: colors.invariant.Error,
  warning: colors.invariant.warning,
  info: colors.invariant.blue
}

const CustomSnackbar = React.forwardRef<HTMLDivElement, CustomContentProps>(
  ({ message, txid, variant = 'default', snackbarId, iconVariant, link, network, swap }, ref) => {
    const { closeSnackbar } = useSnackbar()
    const dispatch = useDispatch()
    const { classes } = useStyles()

    const handleDismiss = useCallback(() => {
      if (!snackbarId) return

      closeSnackbar(snackbarId)
      dispatch(actions.remove(snackbarId))
    }, [snackbarId, closeSnackbar])

    const icon = iconVariant[variant as keyof typeof iconVariant]
    const color = variantColors[variant] || variantColors.default

    const networkUrl = useMemo(() => {
      switch (network) {
        case NetworkType.Mainnet:
          return ''
        case NetworkType.Testnet:
          return '?cluster=testnet'
        case NetworkType.Devnet:
          return '?cluster=devnet'
        default:
          return '?cluster=testnet'
      }
    }, [network])

    const StandartContent = () => {
      return (
        <>
          <Grid className={classes.wrapper}>
            <Grid ml={1}>
              {variant === 'pending' ? (
                <StyledCircularProgress size={13} />
              ) : (
                <StyledIcon style={{ color }}>{icon}</StyledIcon>
              )}
            </Grid>
            <StyledTitle>{message}</StyledTitle>
          </Grid>
          {txid && (
            <Grid className={classes.transactionWrapper}>
              <StyledDetails
                onClick={() => {
                  window.open(
                    `https://eclipsescan.xyz/tx/${txid.toString()}${networkUrl}`,
                    '_blank'
                  )
                }}>
                Details
                <img alt='new tab' src={newTabIcon} />
              </StyledDetails>
              <StyledCloseButton onClick={handleDismiss}>
                <img width={16} src={closeIcon} alt='Close'></img>
              </StyledCloseButton>
            </Grid>
          )}
          {link && (
            <Grid className={classes.transactionWrapper}>
              <StyledDetails
                onClick={() => {
                  window.open(link.href, '_blank')
                }}>
                {link.label}
                <img alt='new tab' src={newTabIcon} />
              </StyledDetails>
              <StyledCloseButton onClick={handleDismiss}>
                <img width={16} src={closeIcon} alt='Close'></img>
              </StyledCloseButton>
            </Grid>
          )}
          {!link && !txid && (
            <Grid className={classes.transactionWrapper}>
              <StyledCloseButton onClick={handleDismiss}>
                <img width={16} src={closeIcon} alt='Close'></img>
              </StyledCloseButton>
            </Grid>
          )}
        </>
      )
    }

    const RenderContent = () => {
      if (variant === 'default') {
        if (swap) {
          return <SwapSnackbar {...swap} handleDismiss={handleDismiss} />
        }
      }
      return <StandartContent />
    }

    return (
      <StyledSnackbarContent ref={ref} role='alert'>
        <StyledBackground />
        <StyledHideContainer>
          <RenderContent />
        </StyledHideContainer>
        <StyledContainer>
          <RenderContent />
        </StyledContainer>
      </StyledSnackbarContent>
    )
  }
)

export default CustomSnackbar
