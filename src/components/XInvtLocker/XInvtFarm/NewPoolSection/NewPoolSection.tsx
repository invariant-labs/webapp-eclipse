import { Button } from '@common/Button/Button'
import { Box, Grid, Skeleton, Typography, useMediaQuery } from '@mui/material'
import { arrowRightIcon } from '@static/icons'
import useStyles from './style'
import { ConvertedPool } from '@containers/LockWrapper/LockWrapper'
import { typography } from '@static/theme'

export interface INewPoolSection {
  handleOpenPosition: (pool: ConvertedPool) => void
  pool: ConvertedPool | null
  isLoading: boolean
}

const NewPoolSection: React.FC<INewPoolSection> = ({ handleOpenPosition, pool, isLoading }) => {
  const { classes } = useStyles()
  const hideBanner = useMediaQuery(`(max-width: 429px), (min-width: 961px) and (max-width: 1064px)`)

  return (
    <Grid className={classes.newPoolWrapper}>
      <Grid className={classes.poolDescriptionWrapper}>
        <Grid className={classes.titleWrapper}>
          <Typography component='h1'>NEW POOL:</Typography>
          {isLoading || pool === null ? (
            <Skeleton variant='rounded' width={100} height={20} />
          ) : (
            <Typography component='h2'>
              {pool.tokenX.symbol}-{pool.tokenY.symbol}
            </Typography>
          )}
        </Grid>
        <Typography height={34} component='span' style={{ ...typography.body2 }}>
          Provide liquidity and collect xINVT {!hideBanner && <br />} while earning fees!
        </Typography>
        <Button
          scheme='pink'
          height={36}
          gap={6}
          onClick={() => {
            if (pool === null) return

            handleOpenPosition(pool)
          }}
          disabled={isLoading}>
          <Typography width={140}>Provide liquidity</Typography>
          <img
            alt='right arrow'
            src={arrowRightIcon}
            style={{ filter: 'brightness(0)' }}
            width={16}
          />
        </Button>
      </Grid>
      {!hideBanner &&
        (pool === null ? (
          <Box height={156} width={150} />
        ) : (
          <img src={pool.image} className={classes.usdcImg} height={'100%'} />
        ))}
    </Grid>
  )
}

export default NewPoolSection
