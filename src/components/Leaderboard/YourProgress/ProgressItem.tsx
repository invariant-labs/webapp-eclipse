import { Button, Grid, Skeleton, Tooltip, Typography } from '@mui/material'
import React from 'react'
import useStyles from './styles'
import infoIcon from '@static/svg/info.svg'
import { blurContent } from '@utils/uiUtils'

interface IProgressItemProps {
  onModalOpen?: (open: boolean) => void
  label: string
  blockHeight?: {
    mobile?: string
    desktop?: string
  }
  value: string | number
  tooltip?: React.ReactNode
  isLoading?: boolean
  withButton?: boolean
}

export const ProgressItem: React.FC<IProgressItemProps> = ({
  label,
  value,
  tooltip,
  withButton = false,
  isLoading = false,
  onModalOpen
}) => {
  const { classes } = useStyles()

  return (
    <Grid className={classes.itemWrapper}>
      <Grid container gap='8px'>
        <Typography className={classes.headerSmallText}>{label}</Typography>
        {tooltip && (
          <Tooltip
            title={tooltip}
            placement='bottom'
            classes={{
              tooltip: classes.tooltip
            }}
            enterTouchDelay={0}>
            <img src={infoIcon} alt='i' width={14} />
          </Tooltip>
        )}
      </Grid>
      {isLoading ? (
        <Skeleton variant='rounded' animation='wave' className={classes.blur} />
      ) : (
        <Grid container alignItems='center' gap='8px'>
          <Typography className={classes.headerBigText}>{value}</Typography>
          {withButton && onModalOpen && (
            <Button
              className={classes.button}
              onClick={() => {
                blurContent()
                onModalOpen(true)
              }}>
              More
            </Button>
          )}
        </Grid>
      )}
    </Grid>
  )
}
