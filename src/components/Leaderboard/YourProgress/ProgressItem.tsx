import { Box, Button, Grid, Skeleton, Typography, useMediaQuery } from '@mui/material'
import React from 'react'
import useStyles from './styles'
import infoIcon from '@static/svg/info.svg'
import { blurContent } from '@utils/uiUtils'
import { theme } from '@static/theme'
import { TooltipGradient } from '@components/TooltipHover/TooltipGradient'

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
            <img src={infoIcon} alt='i' width={14} />
          </TooltipGradient>
        )}
      </Grid>
      {isLoading ? (
        <Skeleton variant='rounded' animation='wave' className={classes.blur} />
      ) : isMobile && withButton ? (
        <Box className={classes.withButtonWrapper}>
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
        <Box className={classes.valueWrapper}>
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
