import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import { colors, typography } from '@static/theme'
export const useStyles = makeStyles()((theme: Theme) => ({
  bannerContainer: {
    position: 'relative',
    backgroundSize: 'cover',
    background: `radial-gradient(circle at 50% -400%, #00D9FF 0%, #00D9FF 20%, ${colors.invariant.component}aa 90%)`,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    padding: '24px',
    borderRadius: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    minHeight: '100px',
    height: '128px',
    marginBottom: '48px',
    maxWidth: '462px',
    width: '462px',
    maxHeight: '160px',
    overflow: 'hidden',
    transition: 'opacity 0.3s ease-out',

    [theme.breakpoints.down('md')]: {
      width: '90%',
      padding: '20px'
    },

    [theme.breakpoints.down('sm')]: {
      padding: '16px',
      minHeight: '80px'
    }
  },
  bannerHidden: {
    opacity: 0,
    pointerEvents: 'none'
  },
  closeButton: {
    position: 'absolute',
    top: '5px',
    right: '5px',
    filter: 'brightness(10)',
    color: colors.invariant.text
  },
  title: {
    ...typography.heading4,
    color: colors.invariant.text,
    textAlign: 'center',
    marginBottom: '8px',

    [theme.breakpoints.down('sm')]: {
      ...typography.heading4
    }
  },
  description: {
    ...typography.body2,
    color: colors.invariant.textGrey,
    textAlign: 'center',

    [theme.breakpoints.down('sm')]: {
      fontSize: '14px'
    }
  },
  actionButton: {
    width: '230px',
    height: '36px',
    borderRadius: '12px',
    background: 'linear-gradient(180deg, rgba(0, 217, 255, 0.8) 0%, rgba(0, 141, 166, 0.8) 100%)',
    color: colors.invariant.black,
    textTransform: 'none',
    ...typography.body1,
    marginTop: '16px',
    transition: 'background 0.3s, opacity 0.3s',

    '&:hover': {
      background: 'linear-gradient(180deg, rgba(0, 217, 255, 0.8) 0%, rgba(0, 141, 166, 0.8) 100%)',
      opacity: 0.8
    },

    [theme.breakpoints.down('sm')]: {
      width: '200px',
      height: '32px',
      fontSize: '14px',
      marginTop: '12px'
    }
  },
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px'
  },
  iconLeft: {
    marginRight: '2px'
  },
  iconMiddle: {
    margin: '0 2px'
  },
  iconRight: {
    marginLeft: '4px',
    filter: 'brightness(0)'
  },
  bannerContent: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',

    [theme.breakpoints.down('md')]: {
      alignItems: 'flex-start'
    }
  },
  bannerTextContent: {
    display: 'flex',
    flexDirection: 'column'
  },
  bannerImageContainer: {
    marginRight: '32px',
    marginLeft: '32px',
    '& img': {
      width: '150px',
      height: 'auto'
    },
    [theme.breakpoints.down('md')]: {
      marginRight: '0',
      marginLeft: '0',
      marginTop: '16px',
      alignSelf: 'center',
      '& img': {
        width: '120px',
        height: 'auto'
      }
    },

    [theme.breakpoints.down('sm')]: {
      '& img': {
        width: '90px',
        height: 'auto'
      }
    }
  }
}))

export default useStyles
