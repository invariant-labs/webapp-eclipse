import { Theme } from '@mui/material'
import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
  wrapper: {
    maxWidth: 510,
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    background: colors.invariant.component,
    borderRadius: 24,

    padding: '16px 24px 22px 24px',
    [theme.breakpoints.down('sm')]: {
      padding: '12px 8px',
      maxWidth: 'auto'
    }
  },
  title: {
    color: colors.invariant.text,
    ...typography.heading4
  },
  amountOutInput: {
    position: 'relative',
    background: colors.invariant.newDark,
    '& .MuiInputBase-input': {
      userSelect: 'text',
      caretColor: 'transparent',
      opacity: 1,
      cursor: 'default'
    }
  },
  amountInput: {
    position: 'relative',
    background: colors.invariant.newDark
  },
  swapButton: {
    marginTop: 24,
    width: '100%',
    height: 48
  },
  ButtonSwapActive: {
    transition: 'filter 0.3s linear',
    background: `${colors.invariant.greenLinearGradient} !important`,
    filter: 'brightness(0.8)',
    '&:hover': {
      filter: 'brightness(1.15)',
      boxShadow:
        '0px 3px 1px -2px rgba(43, 193, 144, 0.2),0px 1px 2px 0px rgba(45, 168, 128, 0.14),0px 0px 5px 7px rgba(59, 183, 142, 0.12)'
    }
  },
  apyWrapper: {
    minHeight: 34,
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  placeholder: {
    [theme.breakpoints.between('sm', 'md')]: {
      width: 344,

      height: 34
    }
  }
}))

export default useStyles
