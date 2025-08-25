import { alpha } from '@mui/material'
import { colors, theme, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles<{ showInfo?: boolean; noBorder?: boolean }>()(
  (_theme, { showInfo = false, noBorder = false }) => ({
    container: {
      transition: 'all 0.3s',
      rowGap: 12,
      color: colors.white.main,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '12px 24px',
      whiteSpace: 'nowrap',
      borderBottom: noBorder ? '' : `1px solid ${colors.invariant.light}`,
      overflow: 'hidden',
      flexDirection: 'row',
      height: showInfo ? 158 : 92,
      background: showInfo ? colors.invariant.darkGradient : colors.invariant.component,

      [theme.breakpoints.down('sm')]: {
        padding: '12px 8px',
        height: showInfo ? 233 : 92
      }

      // '&:last-of-type': {
      //   borderBottom: 'none'
      // }
    },

    info: {
      visibility: showInfo ? 'visible' : 'hidden',
      width: '100%'
    },
    symbolsWrapper: {
      display: 'flex',
      flexWrap: 'nowrap',
      width: 40
    },
    mainContent: {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'nowrap',
      paddingBottom: 12,
      borderBottom: '4px solid transparent',
      borderImage: `repeating-linear-gradient(
      to right,
      ${colors.invariant.light} 0,
      ${colors.invariant.light} 8px,
      transparent 8px,
      transparent 24px
    )`,
      borderImageSlice: 1,
      borderImageWidth: '0 0 1px 0'
    },
    imageWrapper: {
      position: 'relative',
      display: 'flex'
    },
    imageToWrapper: {
      position: 'relative',
      display: 'flex'
    },
    tokenIcon: {
      minWidth: 24,
      maxWidth: 24,
      height: 24,
      marginRight: 3,
      borderRadius: '50%',
      ':last-of-type': {
        marginRight: 4,
        [theme.breakpoints.down(650)]: {
          marginRight: 4
        }
      },
      [theme.breakpoints.down('sm')]: {
        ':last-of-type': {
          marginRight: 4
        }
      }
    },
    warningIcon: {
      position: 'absolute',
      width: 12,
      height: 12,
      bottom: -6,
      right: 0
    },
    extendedRowIcon: {
      justifySelf: 'end',
      alignSelf: 'center',
      display: 'flex',
      height: 24,
      padding: 0,
      width: 20,
      fontSize: 10,
      cursor: 'pointer',
      fill: colors.invariant.green,
      transition: 'all 0.3s ease',
      transform: showInfo ? 'rotate(180deg)' : 'rotate(0deg)'
    },
    poolAddress: {
      maxWidth: 100,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      ...typography.heading4,

      [theme.breakpoints.down('sm')]: {
        ...typography.body1
      }
    },
    adressLabel: {
      maxWidth: 100,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      color: colors.invariant.textGrey,
      ...typography.caption2,

      [theme.breakpoints.down('sm')]: {
        ...typography.caption4
      }
    },
    closeButton: {
      width: '100%',
      height: 40,
      borderRadius: 11
    },
    buttonCloseActive: {
      transition: 'filter 0.3s linear',
      background: `${colors.invariant.pinkLinearGradient} !important`,
      filter: 'brightness(0.8)',
      '&:hover': {
        filter: 'brightness(1.15)',
        boxShadow: `0px 0px 12px 0px ${alpha(colors.invariant.pink, 0.35)}`
      }
    }
  })
)
