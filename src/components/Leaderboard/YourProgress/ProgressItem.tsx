import { Box, Grid, Skeleton, Typography, useMediaQuery } from '@mui/material'
import React from 'react'
import useStyles from './styles'
import { blurContent } from '@utils/uiUtils'
import { theme } from '@static/theme'
import { TooltipGradient } from '@common/TooltipHover/TooltipGradient'
import icons from '@static/icons'
import { Button } from '@common/Button/Button'

interface IProgressItemProps {
  onModalOpen?: (open: boolean) => void
  label: string
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
          <TooltipGradient title={tooltip} placement='bottom' top={1}>
            <img src={icons.infoIcon} alt='i' width={14} />
          </TooltipGradient>
        )}
      </Grid>
      {isLoading && isConnected ? (
        <Skeleton variant='rounded' animation='wave' className={classes.blur} />
      ) : isMobile && withButton ? (
        <Box className={classes.withButtonWrapper}>
          <Box sx={{ visibility: 'hidden' }}>
            <Button scheme='green' height={24} borderRadius={8}>
              More
            </Button>
          </Box>

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
