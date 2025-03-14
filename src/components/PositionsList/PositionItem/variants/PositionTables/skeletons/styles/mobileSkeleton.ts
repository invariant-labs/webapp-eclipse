import { colors, theme } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useMobileSkeletonStyles = makeStyles()(() => ({
  card: {
    height: '290px',
    flexDirection: 'column',
    [theme.breakpoints.between('sm', 'lg')]: {
      padding: '16px',
      paddingTop: '16px'
    },
    padding: '8px',
    background: colors.invariant.component,
    borderRadius: '24px',
    '&:first-child': {
      marginTop: '16px'
    },
    marginBottom: '16px'
  },
  innerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  mobileCardSkeletonHeader: {
    display: 'flex',
    alignItems: 'center',
    height: '36px'
  },

  tokenIcons: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  circularSkeleton: {
    width: '28px',
    height: '28px',
    [theme.breakpoints.between('sm', 'lg')]: {
      width: '40px',
      height: '40px'
    }
  },
  circularSkeletonSmall: {
    width: '24px',
    height: '24px',
    [theme.breakpoints.between('sm', 'lg')]: {
      width: '30px',
      height: '30px'
    }
  },

  textSkeleton: {
    width: '120px',
    height: '24px',
    marginLeft: '8px'
  },

  skeletonRect36: {
    width: '100%',
    height: '36px',
    borderRadius: '10px',
    margin: '0 auto'
  },
  skeletonRect40: {
    width: '100%',
    height: '40px',
    borderRadius: '12px',
    marginTop: '18px'
  },

  marginTop16: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '16px'
  },
  marginTopBottom16: {
    marginTop: '16px',
    marginBottom: '16px'
  },
  paddingLeft16PT0: {
    paddingLeft: '16px',
    '&': {
      paddingTop: '0 !important'
    }
  },
  paddingTop0Important: {
    '&': {
      paddingTop: '0 !important'
    }
  },

  chartContainer: {
    justifyContent: 'center',
    width: '80%',
    margin: '0 auto'
  }
}))
