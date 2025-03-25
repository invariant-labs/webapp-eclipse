import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  ring: {
    cursor: 'pointer',
    width: '20px',
    height: '20px',
    transition: '300ms',
    '&:hover': {
      filter: 'brightness(1.25)',
      '@media (hover: none)': {
        filter: 'none'
      }
    }
  },
  innerCircle: {
    transition: '300ms stroke-dashoffset',
    transform: 'rotate(-90deg)',
    transformOrigin: '50% 50%'
  }
}))
