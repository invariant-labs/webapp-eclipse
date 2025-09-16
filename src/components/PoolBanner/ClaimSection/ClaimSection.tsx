import { Button } from '@common/Button/Button'
import { Grid, Typography } from '@mui/material'
import { xINVT_MAIN } from '@store/consts/static'
import useStyles from './style'

export const ClaimSection = () => {
  const { classes } = useStyles()
  return (
    <>
      <Typography component='h5'>Your unclaimed xINVT</Typography>
      <Grid className={classes.valueWrapper}>
        <img width={36} src={xINVT_MAIN.logoURI} />
        <Typography component='h3'>30K xINVT</Typography>
      </Grid>
      <Button width={'100%'} scheme='green'>
        Claim
      </Button>
    </>
  )
}
