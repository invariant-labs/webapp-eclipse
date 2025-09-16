import { Button } from '@common/Button/Button'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { Grid, Typography, useMediaQuery } from '@mui/material'
import { arrowRightIcon, infoCircleIcon } from '@static/icons'
import bannerIMG from '@static/png/invt-usdc.png'
import useStyles from './style'

const NewPoolSection = () => {
  const { classes } = useStyles()
  const hideBanner = useMediaQuery(`(max-width: 429px), (min-width: 961px) and (max-width: 1064px)`)

  return (
    <Grid className={classes.newPoolWrapper}>
      <Grid className={classes.poolDescriptionWrapper}>
        <Grid className={classes.titleWrapper}>
          <Typography component='h1'>NEW POOL:</Typography>
          <Typography component='h2'>INVT-USDC</Typography>
          <TooltipHover title='lorem ipsum'>
            <img style={{ zIndex: 1 }} alt='info circle' src={infoCircleIcon} />
          </TooltipHover>
        </Grid>
        <Typography height={34} component='span'>
          Provide liquidity and LP while {!hideBanner && <br />} earning fees!
        </Typography>
        <Button scheme='pink' height={36} gap={6}>
          <Typography>Provide liquidity</Typography>
          <img
            alt='right arrow'
            src={arrowRightIcon}
            style={{ filter: 'brightness(0)' }}
            width={16}
          />
        </Button>
      </Grid>
      {!hideBanner && <img src={bannerIMG} className={classes.usdcImg} />}{' '}
    </Grid>
  )
}

export default NewPoolSection
