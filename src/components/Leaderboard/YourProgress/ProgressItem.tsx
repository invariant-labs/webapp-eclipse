import { Box, Button, Grid, Skeleton, Typography, useMediaQuery } from '@mui/material'
import React from 'react'
import useStyles from './styles'
import { blurContent } from '@utils/uiUtils'
import { theme } from '@static/theme'
import { TooltipGradient } from '@components/TooltipHover/TooltipGradient'
import icons from '@static/icons'

interface IProgressItemProps {
  onModalOpen?: (open: boolean) => void
  label: string
  bgImage: string
  value: string | number
  tooltip?: React.ReactNode
  isLoading?: boolean
  withButton?: boolean
}

export const ProgressItem: React.FC<IProgressItemProps> = ({
  label,
  value,
  tooltip,
  bgImage,
  withButton = false,
  isLoading = false,
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
      {isLoading ? (
        <Skeleton variant='rounded' animation='wave' className={classes.blur} />
      ) : isMobile && withButton ? (
        <Box display='grid' gridTemplateColumns='auto 1fr auto' gap='8px' alignItems='center'>
          <Box sx={{ visibility: 'hidden' }}>
            <Button className={classes.button}>More</Button>
          </Box>

          <Typography className={classes.headerBigText} textAlign='center'>
            {value}
          </Typography>

          <Button
            className={classes.button}
            onClick={() => {
              blurContent()
              onModalOpen && onModalOpen(true)
            }}>
            More
          </Button>
        </Box>
      ) : (
        <Box display='flex' alignItems='center' gap='8px'>
          <Typography className={classes.headerBigText}>{value}</Typography>
          {withButton && (
            <Button
              className={classes.button}
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
