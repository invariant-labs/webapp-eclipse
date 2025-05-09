import { colors } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles<{
  imagePosition: 'left' | 'right'
  imageOffsetTop: number
  imageOffsetSide: number
}>()((_theme, { imagePosition, imageOffsetTop, imageOffsetSide }) => ({
  container: {
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
    maxWidth: '520px',
    maxHeight: '130px',
    background: colors.invariant.component,
    borderRadius: '24px',
    padding: '24px 0px 24px 24px'
  },
  contentContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    width: '100%'
  },
  title: {
    fontSize: '48px',
    lineHeight: '36px',
    fontWeight: 700,
    color: colors.invariant.text
  },
  subtitle: {
    fontSize: '20px',
    lineHeight: '24px',
    fontWeight: 400,
    color: colors.invariant.textGrey,
    marginTop: '12px'
  },
  imageContainer: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    top: `${imageOffsetTop}%`,
    left: imagePosition === 'right' ? `${imageOffsetSide}%` : `${100 - imageOffsetSide}%`
  }
}))

export default useStyles
