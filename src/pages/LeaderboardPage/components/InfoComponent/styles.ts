import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  infoContainer: {
    width: '100%',
    marginTop: '72px',
    minHeight: '445px',
    padding: '0 max(15%, 20px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background:
      'linear-gradient(90deg, rgba(32, 41, 70, 0.2) 0%, #202946 22%, #202946 78%, rgba(32, 41, 70, 0.2) 100%)',
    boxSizing: 'border-box',
    overflowX: 'hidden'
  },
  astronaut: {
    width: '100%',
    maxWidth: '400px',
    height: 'auto'
  },

  button: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '13px',
    gap: '10px',
    width: '250px',
    height: '50px',
    background: 'linear-gradient(180deg, #2EE09A 0%, #21A47C 100%)',
    borderRadius: '16px',
    fontFamily: 'Mukta',
    fontStyle: 'normal',
    ...typography.heading4,
    textTransform: 'none',
    color: colors.invariant.dark,
    '&:hover': {
      background: 'linear-gradient(180deg, #2EE09A 0%, #21A47C 100%)'
    }
  }
}))
