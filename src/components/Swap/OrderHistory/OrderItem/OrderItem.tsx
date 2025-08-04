import React, { useEffect, useState } from 'react'
import { theme } from '@static/theme'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { useStyles } from './style'
import { Box, Grid, Typography, useMediaQuery } from '@mui/material'
import { formatNumberWithSuffix } from '@utils/utils'
import { unknownTokenIcon, warningIcon } from '@static/icons'
import { shortenAddress } from '@utils/uiUtils'
import ItemValue from '@common/TableItem/ItemValue/ItemValue'
import { SwapToken } from '@store/selectors/solanaWallet'
import { Button } from '@common/Button/Button'

interface IProps {
  itemNumber?: number
  tokenX: SwapToken
  tokenY: SwapToken
  price: number
  amount: number
  orderFilled: number
  handleCloseOrder: () => void
}

const OrderItem: React.FC<IProps> = ({
  itemNumber = 0,
  tokenX,
  tokenY,
  price,
  amount,
  orderFilled,
  handleCloseOrder
}) => {
  const [showInfo, setShowInfo] = useState(false)
  const { classes } = useStyles({ showInfo })

  const isSm = useMediaQuery(theme.breakpoints.down('sm'))
  const isMd = useMediaQuery(theme.breakpoints.down('md'))

  useEffect(() => {
    setShowInfo(false)
  }, [itemNumber])

  return (
    <Grid
      container
      classes={{ container: classes.container }}
      onClick={e => {
        e.stopPropagation()

        setShowInfo(prev => !prev)
      }}>
      <Grid container className={classes.mainContent}>
        <ItemValue
          title='Tokens'
          style={{ flexShrink: 1, flexBasis: '300px', minWidth: 80 }}
          value={
            <Grid display='flex' alignItems='center' gap={1}>
              <Grid className={classes.symbolsWrapper}>
                <Grid className={classes.imageWrapper}>
                  <img
                    className={classes.tokenIcon}
                    src={tokenX.logoURI}
                    alt='Token from'
                    onError={e => {
                      e.currentTarget.src = unknownTokenIcon
                    }}
                  />
                  {tokenX.isUnknown && tokenX.logoURI !== '/unknownToken.svg' && (
                    <img className={classes.warningIcon} src={warningIcon} />
                  )}
                </Grid>

                <Grid className={classes.imageToWrapper}>
                  <img
                    className={classes.tokenIcon}
                    src={tokenY.logoURI}
                    alt='Token from'
                    onError={e => {
                      e.currentTarget.src = unknownTokenIcon
                    }}
                  />

                  {tokenY.isUnknown && tokenY.logoURI !== '/unknownToken.svg' && (
                    <img className={classes.warningIcon} src={warningIcon} />
                  )}
                </Grid>
              </Grid>

              <Typography className={classes.poolAddress}>
                {shortenAddress(tokenX.symbol ?? '')}/{shortenAddress(tokenY.symbol ?? '')}
              </Typography>
            </Grid>
          }
        />

        <ItemValue
          style={{ flexBasis: 110 }}
          minWidth={80}
          title={'Price'}
          value={`$${formatNumberWithSuffix(price)}`}
        />

        {!isSm && (
          <>
            <ItemValue
              style={{ flexBasis: 110 }}
              minWidth={80}
              title={`Amount`}
              value={`$${formatNumberWithSuffix(amount)}`}
            />
            <ItemValue
              style={{ flexBasis: 100, flexGrow: isMd ? 0 : undefined }}
              minWidth={80}
              title={`Order filled`}
              value={`${orderFilled}%`}
            />
          </>
        )}
        <ArrowDropDownIcon preserveAspectRatio='none' className={classes.extendedRowIcon} />
      </Grid>
      {isSm && (
        <Grid gap={'12px'} display='flex' container flexDirection='column'>
          <Box className={classes.info}>
            <Grid container gap={'8px'} overflow={'hidden'}>
              {
                <>
                  <ItemValue
                    style={{ flexBasis: 110 }}
                    minWidth={80}
                    title={`Amount`}
                    value={`$${formatNumberWithSuffix(amount)}`}
                  />
                  <ItemValue
                    style={{ flexBasis: 100, flexGrow: isMd ? 0 : undefined }}
                    minWidth={80}
                    title={`Order filled`}
                    value={`${orderFilled}%`}
                  />
                </>
              }
            </Grid>
          </Box>
        </Grid>
      )}{' '}
      <Button scheme='pink' padding='0 42px' width={'100%'} onClick={handleCloseOrder}>
        <Box className={classes.button}>Close Order</Box>
      </Button>
    </Grid>
  )
}
export default OrderItem
