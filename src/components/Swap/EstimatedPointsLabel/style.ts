import { colors } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles<{ isVisible: boolean }>()((_theme, { isVisible }) => ({
  pointsBox: {
    height: 27,
    padding: '0px 8px',
    borderRadius: 8,
    backgroundColor: colors.invariant.component,
    color: colors.invariant.textGrey,
    fontSize: 16,
    fontsWeigth: 500,
    opacity: isVisible ? 1 : 0,
    cursor: 'pointer',
    userSelect: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textTransform: 'none',
    gap: 4,
    transition: 'all 0.7s ease-in-out'
  },
  pointsAmount: { color: colors.invariant.pink }
}))

export default useStyles
