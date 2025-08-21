import React, { useEffect, useState } from 'react'
import { colors, theme } from '@static/theme'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { useStyles } from './style'
import { Box, Grid, Typography, useMediaQuery } from '@mui/material'
import { formatNumberWithSuffix } from '@utils/utils'
import { unknownTokenIcon, warningIcon } from '@static/icons'
import { shortenAddress } from '@utils/uiUtils'
import ItemValue from '@common/TableItem/ItemValue/ItemValue'
import { SwapToken } from '@store/selectors/solanaWallet'
import { Button } from '@common/Button/Button'
import ItemValueExtended from '@common/TableItem/ItemValueExtended/ItemValueExtended'

interface IProps {
  itemNumber?: string
  tokenX: SwapToken
  tokenY: SwapToken
  price: number
  amount: number
  usdValue: number
  orderFilled: string
  handleCloseOrder: () => void
  noBorder?: boolean
  isXtoY: boolean
}

const OrderItem: React.FC<IProps> = ({
  itemNumber = '',
  tokenX,
  tokenY,
  price,
  amount,
  usdValue,
  orderFilled,
  handleCloseOrder,
  noBorder
  // isXtoY
}) => {
  const [showInfo, setShowInfo] = useState(false)
  const { classes } = useStyles({ showInfo, noBorder })

  const isSm = useMediaQuery(theme.breakpoints.down('sm'))

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
      }}
      key={itemNumber}>
      <Grid container className={classes.mainContent}>
        <ItemValueExtended
          title='Tokens'
          style={{ flexShrink: 0.2, flexBasis: isSm ? 130 : 160, minWidth: 70 }}
          value={
            <Grid display='flex' alignItems='center' gap={1}>
              <Grid className={classes.symbolsWrapper}>
                <Grid className={classes.imageWrapper}>
                  <img
                    className={classes.tokenIcon}
                    src={tokenX?.logoURI || '/unknownToken.svg'}
                    alt='Token from'
                    onError={e => {
                      e.currentTarget.src = unknownTokenIcon
                    }}
                  />
                  {tokenX?.isUnknown && tokenX?.logoURI !== '/unknownToken.svg' && (
                    <img className={classes.warningIcon} src={warningIcon} />
                  )}
                </Grid>

                <Grid className={classes.imageToWrapper}>
                  <img
                    className={classes.tokenIcon}
                    src={tokenY?.logoURI}
                    alt='Token from'
                    onError={e => {
                      e.currentTarget.src = unknownTokenIcon
                    }}
                  />

                  {tokenY?.isUnknown && tokenY?.logoURI !== '/unknownToken.svg' && (
                    <img className={classes.warningIcon} src={warningIcon} />
                  )}
                </Grid>
              </Grid>
              <Grid>
                <Typography className={classes.poolAddress}>
                  {shortenAddress(tokenX?.symbol ?? '')}/{shortenAddress(tokenY?.symbol ?? '')}
                </Typography>
                <Typography className={classes.adressLabel}>Pair name</Typography>
              </Grid>
            </Grid>
          }
        />

        <ItemValueExtended
          style={{ flexBasis: isSm ? 80 : 110 }}
          minWidth={80}
          title={'Price'}
          value={`${formatNumberWithSuffix(price)}`}
          secondValue={tokenY.symbol + ' per ' + tokenX.symbol}
        />

        {!isSm && (
          <>
            <ItemValueExtended
              style={{ flexBasis: 150 }}
              minWidth={80}
              title={`Amount`}
              value={
                <Box display={'flex'} gap={'2px'}>
                  <span>{formatNumberWithSuffix(amount)}</span> <span> {tokenX.symbol}</span>
                </Box>
              }
              secondValue={`$${formatNumberWithSuffix(usdValue)}`}
            />

            <ItemValueExtended
              style={{ flexBasis: 80 }}
              minWidth={80}
              title={`Order filled`}
              value={`${orderFilled}%`}
              secondValue={'out of 100%'}
              valueColor={colors.invariant.green}
            />
          </>
        )}
        <ArrowDropDownIcon preserveAspectRatio='none' className={classes.extendedRowIcon} />
      </Grid>
      {isSm && (
        <Grid gap={'12px'} display='flex' container flexDirection='column'>
          <Box className={classes.info}>
            <Grid container display='flex' gap={'8px'} overflow={'hidden'}>
              <ItemValueExtended
                style={{ flexBasis: 100, flexGrow: 2 }}
                minWidth={80}
                title={`Amount`}
                value={
                  <Box display={'flex'} gap={'2px'}>
                    <span>{formatNumberWithSuffix(amount)}</span> <span> {tokenX.symbol}</span>
                  </Box>
                }
                secondValue={`$${formatNumberWithSuffix(usdValue)}`}
              />
              <ItemValueExtended
                style={{ flexBasis: 100 }}
                minWidth={80}
                title={`Order filled`}
                value={`${orderFilled}%`}
                secondValue={'out of 100%'}
                valueColor={colors.invariant.green}
              />
            </Grid>
          </Box>
        </Grid>
      )}{' '}
      <Button
        scheme='pink'
        padding='0 42px'
        width={'100%'}
        onClick={e => {
          e.stopPropagation()
          handleCloseOrder()
        }}>
        <Box>Close Order</Box>
      </Button>
    </Grid>
  )
}
export default OrderItem
