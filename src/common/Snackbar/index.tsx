import React from 'react'
import { CustomContentProps, SnackbarProvider } from 'notistack'
import { theme } from '@static/theme'
import { useMediaQuery } from '@mui/material'
import CustomSnackbar from './CustomSnackbar/CustomSnackbar'
import { NetworkType } from '@store/consts/static'
import { Global } from '@emotion/react'

type ExtraVariants = 'pending' | 'custom'

export type SnackbarVariant = ExtraVariants

export type IkonType = 'swap' | 'deposit' | 'withdraw'
export interface TokensDetailsProps {
  ikonType: IkonType
  tokenXAmount: string
  tokenYAmount: string
  tokenXIcon: string
  tokenYIcon: string
  earnedPoints?: string
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
  closePosition?: {}
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

const Snackbar: React.FC<ISnackbarProps> = ({ maxSnack = 3, children }) => {
  const isNavbarVisible = useMediaQuery(theme.breakpoints.down(1200))
  const isExSmall = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <>
      {isNavbarVisible && (
        <Global
          styles={`
          .custom-snackbar-container {
            bottom: 90px !important;
            z-index: 100 !important; 

          }
        `}
        />
      )}
      <SnackbarProvider
        dense
        maxSnack={isExSmall ? 5 : maxSnack}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        classes={
          isNavbarVisible ? { containerAnchorOriginBottomLeft: 'custom-snackbar-container' } : {}
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
    </>
  )
}

export default Snackbar
