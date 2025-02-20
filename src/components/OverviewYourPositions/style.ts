import { makeStyles } from 'tss-react/mui'
import { colors, theme, typography } from '@static/theme'

export const useStyles = makeStyles()(() => ({
  footer: {
    maxWidth: 1201,
    height: 48,
    width: '100%',
    borderTop: `1px solid ${colors.invariant.light}`,
    display: 'flex',
    justifyContent: 'space-between',
    background: colors.invariant.component,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    [theme.breakpoints.down('lg')]: {
      marginBottom: 32
    },
    [theme.breakpoints.down('md')]: {
      borderRadius: 16,
      border: 'none',
      marginTop: 8
    }
  },
  footerItem: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    paddingLeft: 16,
    paddingRight: 16
  },
  footerCheckboxContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  checkBoxLabel: {
    '.MuiFormControlLabel-label': {
      ...typography.body2,
      color: colors.invariant.text
    }
  },
  footerText: { ...typography.body2 },
  footerPositionDetails: {
    ...typography.body1
  },
  whiteText: {
    color: colors.invariant.text
  },
  greenText: {
    color: colors.invariant.green
  },
  pinkText: {
    color: colors.invariant.pink
  },
  greyText: {
    color: colors.invariant.textGrey
  },
  checkBox: {
    width: 25,
    height: 25,
    marginLeft: 3,
    marginRight: 3,
    color: colors.invariant.newDark,
    '&.Mui-checked': {
      color: colors.invariant.green
    },
    '& .MuiSvgIcon-root': {
      fontSize: 25
    },
    padding: 0,
    '& .MuiIconButton-label': {
      width: 20,
      height: 20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: 0
    }
  }
}))
