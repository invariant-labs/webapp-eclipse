import React from 'react'
import { Button, Grid, Typography } from '@mui/material'
import icons from '@static/icons'
import classNames from 'classnames'
import { Token } from '@components/OverviewYourPositions/types/types'
import { useStyles } from './styles'

interface UnclaimedFeeItemProps {
  type: 'header' | 'item'
  data?: {
    index: number
    tokenX: Token
    tokenY: Token
    fee: number
    value: number
    unclaimedFee: number
  }
  hideBottomLine?: boolean
  onClaim?: () => void
}

export const UnclaimedFeeItem: React.FC<UnclaimedFeeItemProps> = ({
  type,
  data,
  hideBottomLine,
  onClaim
}) => {
  const { classes } = useStyles()

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = icons.unknownToken
  }

  return (
    <Grid
      container
      className={classNames(classes.container, type === 'header' ? classes.header : classes.item, {
        [classes.noBottomBorder]: hideBottomLine
      })}>
      <Typography component='p' style={{ alignSelf: 'center' }}>
        {type === 'header' ? (
          <>
            N<sup>o</sup>
          </>
        ) : (
          data?.index
        )}
      </Typography>

      <Typography style={{ alignSelf: 'center', display: 'flex' }}>
        {type === 'header' ? (
          'Name'
        ) : (
          <>
            <div className={classes.icons}>
              <img
                className={classes.tokenIcon}
                src={data?.tokenX.icon}
                alt={data?.tokenX.name}
                onError={handleImageError}
              />
              <img
                className={classes.tokenIcon}
                src={data?.tokenY.icon}
                alt={data?.tokenY.name}
                onError={handleImageError}
              />
            </div>
            {`${data?.tokenX.name}/${data?.tokenY.name}`}
          </>
        )}
      </Typography>

      <Typography style={{ alignSelf: 'center' }}>
        {type === 'header' ? 'Fee' : `$${data?.fee.toFixed(2)}`}
      </Typography>

      <Typography style={{ alignSelf: 'center' }}>
        {type === 'header' ? 'Value' : `$${data?.value.toFixed(2)}`}
      </Typography>

      <Typography style={{ alignSelf: 'center' }}>
        {type === 'header' ? 'Unclaimed fee' : `$${data?.unclaimedFee.toFixed(2)}`}
      </Typography>

      <Grid container justifyContent='flex-end' alignItems='center'>
        {type === 'header' ? (
          <Typography>Action</Typography>
        ) : (
          <Button className={classes.claimButton} onClick={onClaim}>
            Claim fee
          </Button>
        )}
      </Grid>
    </Grid>
  )
}
