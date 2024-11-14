import { Grid, Skeleton } from '@mui/material'
import { useStyles } from './style'
import { PopularPoolData } from '@containers/PopularPoolsWrapper/PopularPoolsWrapper'
import GradientBorder from '@components/GradientBorder/GradientBorder'
import { colors } from '@static/theme'
import cardBackgroundBottom from '@static/png/cardBackground1.png'
import cardBackgroundTop from '@static/png/cardBackground2.png'

export interface ICard extends PopularPoolData {
  isLoading: boolean
}

const Card: React.FC<ICard> = ({ addressFrom, addressTo, TVL, apy, apyData, isLoading }) => {
  const { classes } = useStyles()

  return (
    <Grid className={classes.root}>
      {isLoading ? (
        <Skeleton />
      ) : (
        <Grid>
          <GradientBorder
            borderRadius={24}
            borderWidth={2}
            backgroundColor={colors.invariant.component}
            innerClassName={classes.container}>
            <img
              src={cardBackgroundTop}
              alt=''
              className={classes.backgroundImage}
              style={{ top: 0 }}
            />
            <img
              src={cardBackgroundBottom}
              alt=''
              className={classes.backgroundImage}
              style={{ bottom: 0 }}
            />
            <Grid container justifyContent='center' alignItems='center'>
              card
            </Grid>
          </GradientBorder>
        </Grid>
      )}
    </Grid>
  )
}

export default Card
