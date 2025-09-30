import { Box, Grid, Typography, useMediaQuery } from '@mui/material'
import { closeSmallGreenIcon, closeSmallIcon } from '@static/icons'
import { theme } from '@static/theme'
import useStyles from './styles'

interface INormalBannerProps {
  onClose: () => void
  isHiding: boolean
}

export const Banner = ({ onClose, isHiding }: INormalBannerProps) => {
  const bannerHeight = 'fit-content'
  const isSmallDevice = useMediaQuery(theme.breakpoints.down('sm'))

  const { classes } = useStyles({ isHiding })

  const text = (
    <span>
      Invariant TGE is live – claim your $INVT
      <span
        className={classes.text}
        onClick={() => window.open('https://claims.invariant.app/claim')}>
        here!
      </span>
      {/* {!isSmallDevice && `...`} And see also distribution of points in the
      <span
        style={{
          color: colors.invariant.pink,
          textDecoration: 'underline',
          marginLeft: '6px',
          cursor: 'pointer',
          ...typography.body1
        }}
        onClick={() => {
          navigate(ROUTES.POINTS)

          if (isSmallDevice) {
            onClose()
          }
        }}>
        leaderboard!
      </span> */}
    </span>
  )

  const close = (
    <Box onClick={onClose}>
      <Box
        component='img'
        src={isSmallDevice ? closeSmallGreenIcon : closeSmallIcon}
        sx={{
          cursor: 'pointer',
          width: { xs: '16px', sm: '11px' },
          height: { xs: '16px', sm: '11px' },
          minWidth: { xs: '16px', sm: '11px' }
        }}
        alt='Close'
      />
    </Box>
  )

  return (
    <>
      {!isSmallDevice && (
        <Box
          className={classes.bannerWrapper}
          sx={{
            height: isHiding ? '0px' : bannerHeight,
            padding: isHiding ? '0px 0px' : { xs: '12px 16px', sm: '10px 25px' }
          }}>
          <Box className={classes.airdropWrapper}>
            <Grid className={classes.labelWrapper}>
              <Box
                sx={{
                  fontSize: { xs: '14px', sm: '16px' }
                }}>
                {text}
              </Box>
            </Grid>
          </Box>
          {close}
        </Box>
      )}
      {isSmallDevice && (
        <>
          <Box className={classes.background} onClick={onClose}></Box>
          <Box className={classes.container}>
            <Box className={classes.modal}>
              <Box className={classes.header}>
                <Typography>Announcement</Typography>
                {close}
              </Box>
              {text}
            </Box>
          </Box>
        </>
      )}
    </>
  )
}
