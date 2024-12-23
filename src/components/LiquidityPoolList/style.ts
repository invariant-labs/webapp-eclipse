import { alpha } from '@mui/material'
import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  container: {
    maxWidth: 1072,
    padding: '0 24px',
    borderRadius: '24px',
    backgroundColor: `${colors.invariant.component} !important`
  },
  pagination: {
    padding: '20px 0 10px 0',
    maxWidth: '100%'
  },
  noPoolFoundPlaceholder: {
    ...typography.body2,
    fontWeight: 500,
    lineHeight: '20px',
    color: colors.invariant.lightHover
  },
  addPoolButton: {
    height: 40,
    width: 200,
    margin: 20,
    color: colors.invariant.componentBcg,
    ...typography.body1,
    textTransform: 'none',
    borderRadius: 14,
    background: colors.invariant.pinkLinearGradientOpacity,

    '&:hover': {
      background: colors.invariant.pinkLinearGradient,
      boxShadow: '0px 0px 16px rgba(239, 132, 245, 0.35)',
      '@media (hover: none)': {
        background: colors.invariant.pinkLinearGradientOpacity,
        boxShadow: 'none'
      }
    }
  },
  noPoolFoundContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 32
  },
  img: {
    paddingBottom: 25
  },
  loadingOverlay: {
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      inset: 0,
      backgroundColor: alpha(colors.invariant.newDark, 0.7),
      backdropFilter: 'blur(4px)',
      zIndex: 1,
      pointerEvents: 'none',
      borderRadius: '24px'
    }
  }
}))
