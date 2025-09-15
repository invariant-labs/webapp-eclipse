import React from 'react'
import { CustomContentProps, SnackbarProvider } from 'notistack'
import { theme } from '@static/theme'
import { Grow, GrowProps, useMediaQuery } from '@mui/material'
import CustomSnackbar from './CustomSnackbar/CustomSnackbar'
import { NetworkType } from '@store/consts/static'
import { useStyles } from './CustomSnackbar/style'

type ExtraVariants = 'pending' | 'custom'

export type SnackbarVariant = ExtraVariants

export type IkonType =
  | 'swap'
  | 'deposit'
  | 'withdraw'
  | 'claim'
  | 'stake'
  | 'unstake'
  | 'purchase'
  | 'claim-nft'
export interface TokensDetailsProps {
  ikonType: IkonType
  tokenXAmount: string
  tokenBetweenAmount?: string
  tokenYAmount?: string
  tokenXIcon: string
  tokenBetweenIcon?: string
  tokenYIcon?: string
  tokenXSymbol: string
  tokenBetweenSymbol?: string
  tokenYSymbol?: string
  tokenXIconAutoSwap?: string
  tokenYIconAutoSwap?: string
  tokenXAmountAutoSwap?: string
  tokenYAmountAutoSwap?: string
  roundIcon?: boolean
}
export interface CustomProps {
  txid?: string
  snackbarId: string
  network?: NetworkType
  link?: {
    label: string
    href: string
  }
  tokensDetails?: TokensDetailsProps
  closePosition?: object
}

export interface SnackbarSnackbarProps extends CustomContentProps, CustomProps {}

declare module 'notistack' {
  interface VariantOverrides {
    pending: true
    custom: true
  }
  interface OptionsObject extends CustomProps {}
}

interface ISnackbarProps {
  children: React.ReactNode
  maxSnack?: number
}

const Transition = (props: GrowProps) => <Grow {...props} />

const Snackbar: React.FC<ISnackbarProps> = ({ maxSnack = 3, children }) => {
  const isNavbarVisible = useMediaQuery(theme.breakpoints.down(1200))
  const isExSmall = useMediaQuery(theme.breakpoints.down('sm'))
  const { classes } = useStyles({})

  return (
    <SnackbarProvider
      TransitionComponent={Transition}
      transitionDuration={{ enter: 500, exit: 300 }}
      dense
      maxSnack={isExSmall ? 5 : maxSnack}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      classes={
        isNavbarVisible ? { containerAnchorOriginBottomLeft: classes.customSnackbarContainer } : {}
      }
      Components={{
        success: CustomSnackbar,
        error: CustomSnackbar,
        info: CustomSnackbar,
        warning: CustomSnackbar,
        pending: CustomSnackbar,
        custom: CustomSnackbar,
        default: CustomSnackbar
      }}>
      {children}
    </SnackbarProvider>
  )
}
export default Snackbar
