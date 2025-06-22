import { Box, Grid, Skeleton, Typography, useMediaQuery } from '@mui/material'
import React from 'react'
import useStyles from './styles'
import { blurContent } from '@utils/uiUtils'
import { theme } from '@static/theme'
import { infoIcon } from '@static/icons'
import { Button } from '@common/Button/Button'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'

interface IProgressItemProps {
  onModalOpen?: (open: boolean) => void
  label: string | React.ReactNode
  bgImage: string
  value: string | number
  tooltip?: React.ReactNode
  isLoading?: boolean
  withButton?: boolean
  isConnected: boolean
}

export const ProgressItem: React.FC<IProgressItemProps> = ({
  label,
  value,
  tooltip,
  bgImage,
  withButton = false,
  isLoading = false,
  isConnected,
  onModalOpen
}) => {
  const { classes } = useStyles({ bgImage })
  const isMobile = useMediaQuery(theme.breakpoints.down(500))

  return (
    <Grid className={classes.itemWrapper}>
      <Grid className={classes.mobileWrapper}>
        <Typography className={classes.headerSmallText}>{label}</Typography>
        {tooltip && (
          <TooltipHover title={tooltip} placement='bottom' increasePadding gradient>
            <img src={infoIcon} alt='i' width={14} />
          </TooltipHover>
        )}
      </Grid>
      {isLoading && isConnected ? (
        <Skeleton variant='rounded' animation='wave' className={classes.blur} />
      ) : isMobile && withButton ? (
        <Box className={classes.withButtonWrapper}>
          <Typography className={classes.headerBigText} textAlign='center'>
            {value}
          </Typography>

          <Button
            scheme='green'
            height={24}
            borderRadius={8}
            onClick={() => {
              blurContent()
              onModalOpen && onModalOpen(true)
            }}>
            More
          </Button>
        </Box>
      ) : (
        <Box className={classes.valueWrapper}>
          <Typography className={classes.headerBigText}>{value}</Typography>
          {withButton && (
            <Button
              scheme='green'
              height={24}
              borderRadius={8}
              onClick={() => {
                blurContent()
                onModalOpen && onModalOpen(true)
              }}>
              More
            </Button>
          )}
        </Box>
      )}
    </Grid>
  )
}
