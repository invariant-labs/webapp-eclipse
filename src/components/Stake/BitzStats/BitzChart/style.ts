import { colors, theme, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  wrapper: {
    display: 'flex',
    width: '100%',
    maxHeight: 280,
    gap: 24,
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
      maxHeight: '600px'
    }
  },

  chartWrapper: {
    display: 'flex',
    background: colors.invariant.component,
    borderRadius: 24,
    width: '100%',
    padding: 24,
    minHeight: 280,
    [theme.breakpoints.down(460)]: {
      flexDirection: 'column'
    }
  },
  leftWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    width: '100%'
  },
  rightWrapper: {
    display: 'flex',
    width: '100%',
    marginTop: -10
  },
  supplyTitleWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    '& h4': {
      display: 'flex',
      gap: 8,
      ...typography.body1,
      color: colors.invariant.textGrey
    },
    '& h3': {
      ...typography.heading1,
      color: colors.invariant.text
    }
  },
  legendWrapper: {
    display: 'grid',
    rowGap: 28,
    gridTemplateColumns: `repeat( 2, 1fr)`,
    [theme.breakpoints.down(460)]: {
      gridTemplateColumns: `repeat( 3, 1fr)`
    },
    [theme.breakpoints.down(360)]: {
      gridTemplateColumns: `repeat( 2, 1fr)`
    }
  },
  singleLegendWrapper: {
    display: 'flex',
    gap: 8
  },
  legendText: {
    display: 'flex',
    flexDirection: 'column',
    '& h3': {
      ...typography.heading3,
      color: colors.invariant.text
    },
    '& h4': {
      ...typography.heading4,
      color: colors.invariant.lightBlue
    }
  },
  tokenArc: {
    width: 28,
    height: 56,
    borderLeft: `none`,
    borderTop: `12px solid ${colors.invariant.lightBlue}`,
    borderRight: `12px solid ${colors.invariant.lightBlue}`,
    borderBottom: `12px solid ${colors.invariant.lightBlue}`,
    borderRadius: '0px 56px 56px 0px',
    backgroundColor: 'transparent',
    flexShrink: 0,
    filter: `drop-shadow(0 0 10px ${colors.invariant.lightBlue}60)`
  }
}))

export default useStyles
