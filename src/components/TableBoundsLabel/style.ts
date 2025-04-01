import { colors } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles<{
  isMobile: boolean
  containerPadding?: string | number
  containerHeight?: string | number
}>()((theme, { isMobile, containerPadding, containerHeight }) => ({
  container: {
    [theme.breakpoints.up('md')]: { paddingLeft: '24px', paddingRight: '24px' },
    maxWidth: '100%',
    display: 'flex',
    height: containerHeight ?? 'auto',
    justifyContent: 'center',
    alignItems: 'center'
  },
  gridContainer: {
    padding: containerPadding ? '20px 0 10px 0' : 0,
    maxWidth: '100%',
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: 'center',
    position: 'relative'
  },
  paginatorContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center'
  },
  paginatorBox: {
    width: '80%',
    [theme.breakpoints.down('md')]: { width: '90%' }
  },
  labelContainer: {
    display: 'flex',
    justifyContent: isMobile ? 'center' : 'flex-end',
    width: '100%',
    position: isMobile ? 'static' : 'absolute',
    right: 0,
    top: '55%',
    pointerEvents: 'none',
    transform: isMobile ? 'none' : 'translateY(-50%)'
  },
  labelText: {
    color: colors.invariant.textGrey,
    textWrap: 'nowrap',
    textAlign: isMobile ? 'center' : 'right'
  }
}))

export default useStyles
