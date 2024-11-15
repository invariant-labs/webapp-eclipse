import { Grid, Typography } from '@mui/material'
import { useStyles } from './style'
import { PopularPoolData } from '@containers/PopularPoolsWrapper/PopularPoolsWrapper'
import Card from './Card/Card'
import GradientBorder from '@components/GradientBorder/GradientBorder'
import { NetworkType } from '@store/consts/static'

export interface IPopularPools {
  pools: PopularPoolData[]
  isLoading: boolean
  network: NetworkType
}

const PopularPools: React.FC<IPopularPools> = ({ pools, isLoading, network }) => {
  const { classes } = useStyles()

  return (
    <Grid container mb={5}>
      <Typography className={classes.title} mb={3}>
        Popular pools
      </Typography>
      <GradientBorder
        opacity={0.25}
        borderRadius={34}
        borderWidth={1}
        innerClassName={classes.cardsContainer}>
        {pools.map(pool => (
          <Card
            addressFrom={pool.addressFrom}
            addressTo={pool.addressTo}
            iconFrom={pool.iconFrom}
            iconTo={pool.iconTo}
            volume={pool.volume}
            TVL={pool.TVL}
            fee={pool.fee}
            symbolFrom={pool.symbolFrom}
            symbolTo={pool.symbolTo}
            apy={pool.apy}
            apyData={pool.apyData}
            isUnknownFrom={pool.isUnknownFrom}
            isUnknownTo={pool.isUnknownTo}
            isLoading={isLoading}
            network={network}
          />
        ))}
      </GradientBorder>
    </Grid>
  )
}

export default PopularPools
