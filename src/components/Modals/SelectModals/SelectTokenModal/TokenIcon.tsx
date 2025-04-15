import { unknownTokenIcon } from '@static/icons'
import useStyles from './style'
import { memo } from 'react'

type Props = {
  icon: string
  name: string
}

export const TokenIcon = memo(({ icon, name }: Props) => {
  const { classes } = useStyles()

  return (
    <img
      className={classes.tokenIcon}
      src={icon ?? ''}
      loading='lazy'
      alt={name + 'logo'}
      onError={e => {
        e.currentTarget.onerror = null
        e.currentTarget.src = unknownTokenIcon
      }}
    />
  )
})
