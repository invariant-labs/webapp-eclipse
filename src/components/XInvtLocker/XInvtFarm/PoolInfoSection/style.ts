import { typography, colors, theme } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  poolInfoWrapper: {
    flexShrink: 0,

    borderRadius: 24,
    padding: '24px 24px 24px 16px',
    display: 'flex',
    flexWrap: 'nowrap',
    flexDirection: 'column',
    boxSizing: 'border-box',
    gap: 12,
    width: 265,
    background: colors.invariant.component,
    [theme.breakpoints.down('md')]: {
      width: '100%'
    }
  },
  titleWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'nowrap',

    '& h1': {
      textWrap: 'nowrap',
      ...typography.body1,
      color: colors.invariant.text
    }
  },
  tokenWrapper: {
    display: 'flex',
    flexWrap: 'nowrap',
    height: 32,
    gap: 10,
    alignItems: 'center',

    '& img:nth-child(2)': {
      marginLeft: -18
    }
  },
  poolDistributeWapper: {
    flexWrap: 'nowrap',

    border: `1px solid ${colors.invariant.light}`,
    borderRadius: 12,
    padding: 8,
    justifyContent: 'space-between',
    display: 'flex',
    height: 42,
    alignItems: 'center'
  },
  poolDistributeTitle: {
    display: 'flex',
    gap: 4,
    alignItems: 'center'
  },
  textWrapper: {
    display: 'flex',
    flexDirection: 'column',
    '& h4': {
      ...typography.caption1,
      color: colors.invariant.textGrey
    },
    '& h5': {
      marginTop: -3,
      ...typography.caption4,
      color: colors.invariant.textGrey
    }
  },
  poolDistributeValueWrapper: {
    display: 'flex',
    gap: 2,
    '& p': {
      ...typography.body3,
      color: colors.invariant.text
    }
  },
  yourEarnWapper: {
    background: colors.invariant.newDark,
    borderRadius: 12,
    padding: 8,
    justifyContent: 'space-between',
    display: 'flex',
    height: 42,
    alignItems: 'center'
  },
  yourEarnTitle: {
    display: 'flex',
    gap: 4,
    alignItems: 'center',
    '& h4': {
      ...typography.body2,
      color: colors.invariant.textGrey
    }
  },
  starIcon: {
    width: 16,
    cursor: 'pointer',
    transition: '0.3s all',
    '&:hover': {
      opacity: '0.8'
    }
  }
}))

export default useStyles
