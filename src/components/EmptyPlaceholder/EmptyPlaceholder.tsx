import { Button, Grid, Typography } from '@mui/material'
import classNames from 'classnames'
import React from 'react'
import { useStyles } from './style'
import icons from '@static/icons'

export interface IEmptyPlaceholder {
  desc: string
  onAction?: () => void
  className?: string
  style?: React.CSSProperties
  withButton?: boolean
  mainTitle?: string
  roundedCorners?: boolean
  buttonName?: string
  height?: number
  newVersion?: boolean
  img?: string
  desc2?: string
}

export const EmptyPlaceholder: React.FC<IEmptyPlaceholder> = ({
  desc,
  onAction,
  withButton = true,
  buttonName,
  mainTitle = `It's empty here...`,
  height,
  newVersion = false,
  roundedCorners = false,
  img = icons.empty,
  desc2
}) => {
  const { classes } = useStyles({ newVersion, roundedCorners, height })

  return (
    <Grid container className={classes.wrapperContainer}>
      <Grid className={classNames(classes.blur, 'blurLayer')} />
      <Grid className={classNames(classes.container, 'blurLayer')}>
        <Grid className={classNames(classes.root, 'blurInfo')} gap='24px'>
          <img src={img} alt='Not connected' />
          <Grid container flexDirection='column' gap='12px'>
            <Typography className={classes.title}>{mainTitle}</Typography>
            {desc?.length > 0 && <Typography className={classes.desc}>{desc}</Typography>}
          </Grid>
          {withButton && (
            <Button className={classes.button} onClick={onAction} variant='contained'>
              {buttonName ? buttonName : 'Add a position'}
            </Button>
          )}
          {desc2 && <Typography className={classes.desc}>{desc2}</Typography>}
        </Grid>
      </Grid>
    </Grid>
  )
}
