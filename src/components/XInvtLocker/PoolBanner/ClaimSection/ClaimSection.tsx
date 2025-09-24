import { Button } from '@common/Button/Button'
import { Box, Grid, Typography } from '@mui/material'
import { xINVT_MAIN } from '@store/consts/static'
import useStyles from './style'
import { UserPoints } from '@store/reducers/xInvt'

interface IProps {
  handleClaim: () => void
  userPointsState: UserPoints
}
export const ClaimSection: React.FC<IProps> = ({ handleClaim, userPointsState }) => {
  const { classes } = useStyles()
  return (
    <Box className={classes.wrapper}>
      <Grid className={classes.valueWrapper}>
        <Typography component='h5'>Current round xINVT</Typography>
        <Box display={'flex'} alignItems={'center'} gap={0.5}>
          <img width={20} height={20} src={xINVT_MAIN.logoURI} />
          <Typography component='h3'>{userPointsState?.accumulatedRewards || '0'} </Typography>
        </Box>
      </Grid>
      <Grid className={classes.claimWrapper}>
        <Box display={'flex'} alignItems={'center'} className={classes.claimValue}>
          <Typography component='h5'>Unclaimed xINVT</Typography>
          <Box display={'flex'} alignItems={'center'} gap={0.5}>
            <img width={20} height={20} src={xINVT_MAIN.logoURI} />
            <Typography component='h3'>{userPointsState?.claimableRewards || '0'} </Typography>
          </Box>
        </Box>
        <Button width={'100%'} scheme='green' onClick={handleClaim}>
          Claim
        </Button>
      </Grid>
    </Box>
  )
}
