// import { colors, typography } from '@static/theme'
// import { makeStyles } from 'tss-react/mui'
// import { SwitcherAlignment } from './DEXChart'

// interface StyleProps {
//   alignment: SwitcherAlignment
// }

// const useStyles = makeStyles<StyleProps>()((theme, { alignment }) => {
//   const getMarkerPosition = (alignment: string) => {
//     switch (alignment) {
//       case SwitcherAlignment.FEE_TVL:
//         return '0'
//       case SwitcherAlignment.VOLUME_TVL:
//         return '100%'

//       default:
//         return '0'
//     }
//   }

//   return {
//     switchWrapper: {
//       display: 'flex',
//       position: 'relative',
//       justifyContent: 'center',
//       alignItems: 'center',
//       width: '100%',
//       flexWrap: 'wrap-reverse'
//     },
//     switchPoolsContainer: {
//       position: 'relative',
//       width: 'fit-content',
//       backgroundColor: colors.invariant.component,
//       borderRadius: 10,
//       overflow: 'hidden',
//       display: 'inline-flex',
//       height: 32,

//       [theme.breakpoints.down('md')]: {
//         width: '95%'
//       },
//       [theme.breakpoints.down('sm')]: {
//         height: '40px',
//         width: '100%'
//       }
//     },
//     switchPoolsMarker: {
//       position: 'absolute',
//       top: 0,
//       bottom: 0,
//       width: 'calc(100% / 2)',
//       backgroundColor: colors.invariant.light,
//       borderRadius: 10,
//       transition: 'transform 0.3s ease',
//       zIndex: 1,
//       transform: `translateX(${getMarkerPosition(alignment)})`
//     },
//     switchPoolsButtonsGroup: {
//       position: 'relative',
//       zIndex: 2,
//       display: 'flex',
//       width: '100%'
//     },
//     switchPoolsButton: {
//       ...typography.body2,
//       display: 'flex',
//       justifyContent: 'center',
//       alignItems: 'center',
//       color: 'white',
//       flex: 1,
//       width: 120,
//       minWidth: 'unset',
//       textTransform: 'none',
//       textWrap: 'nowrap',
//       border: 'none',
//       borderRadius: 10,
//       zIndex: 2,
//       transition: '300ms',
//       '&.Mui-selected': {
//         backgroundColor: 'transparent'
//       },
//       '&:hover': {
//         filter: 'brightness(1.2)',
//         borderRadius: 10
//       },
//       '&.Mui-selected:hover': {
//         backgroundColor: 'transparent'
//       },
//       '&:disabled': {
//         color: colors.invariant.componentBcg,
//         pointerEvents: 'auto',
//         transition: 'all 0.3s',
//         '&:hover': {
//           boxShadow: 'none',
//           cursor: 'not-allowed',
//           filter: 'brightness(1.15)',
//           '@media (hover: none)': {
//             filter: 'none'
//           }
//         }
//       },
//       letterSpacing: '-0.03em',
//       paddingTop: 6,
//       paddingBottom: 6
//     },
//     container: {
//       width: '100%',
//       height: '372px'
//     },
//     headerContainer: {
//       display: 'flex',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//       padding: '24px 49px'
//     },
//     leftSection: {
//       display: 'flex',
//       flexDirection: 'column',
//       [theme.breakpoints.down('lg')]: {
//         width: '100%'
//       }
//     },
//     higherText: {
//       color: colors.invariant.textGrey,
//       ...typography.body2,
//       padding: '12px 0px'
//     },
//     rightSection: {
//       display: 'flex',
//       alignItems: 'center',
//       [theme.breakpoints.down('lg')]: {
//         display: 'none'
//       }
//     },
//     sourceText: {
//       color: colors.invariant.textGrey,
//       ...typography.body2
//     },
//     divider: {
//       width: '1px',
//       height: '16px',
//       backgroundColor: colors.invariant.textGrey,
//       margin: '0 12px'
//     },
//     eclipseLogo: {
//       width: '24px',
//       height: '24px'
//     },
//     chartContainer: {
//       height: '70%',
//       width: '100%'
//     },
//     footerContainer: {
//       padding: '16px 49px',
//       [theme.breakpoints.down('lg')]: {
//         padding: '16px 24px'
//       }
//     },
//     footerText: {
//       color: colors.invariant.textGrey,
//       ...typography.heading4,
//       [theme.breakpoints.down('lg')]: {
//         ...typography.body2,
//         marginTop: '32px'
//       },
//       fontWeight: '400',
//       marginTop: '16px',
//       fontSize: '18px'
//     },
//     barValueText: {
//       ...typography.body1,
//       fill: colors.invariant.textGrey
//     },
//     axisTickText: {
//       fill: colors.invariant.text,
//       ...typography.body2,
//       [theme.breakpoints.down('md')]: {
//         ...typography.caption2
//       },
//       [theme.breakpoints.down('sm')]: {
//         ...typography.tiny2
//       },
//       textAnchor: 'middle'
//     },
//     leftAxisTickText: {
//       fill: colors.invariant.textGrey,
//       fontSize: '12px'
//     }
//   }
// })

// export default useStyles
