import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import { theme } from '@static/theme'
import React, { forwardRef, memo, useEffect, useMemo, useRef, useState } from 'react'
import { FixedSizeList as List, ListChildComponentProps } from 'react-window'
import useStyles from './style'
import AddTokenModal from '@components/Modals/AddTokenModal/AddTokenModal'
import {
  Box,
  Button,
  CardMedia,
  Checkbox,
  FormControlLabel,
  Grid,
  Popover,
  Typography,
  useMediaQuery
} from '@mui/material'
import { formatNumberWithSuffix, getTokenPrice, printBN } from '@utils/utils'
import { SwapToken } from '@store/selectors/solanaWallet'
import Scrollbars from 'rc-scrollbars'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { PublicKey } from '@solana/web3.js'
import { NetworkType } from '@store/consts/static'
import CustomScrollbar from './CustomScrollbar'
import { TokenIcon } from './TokenIcon'
import { emptyIcon, newTabIcon, searchIcon, warningIcon } from '@static/icons'

export interface ISelectTokenModal {
  tokens: SwapToken[]
  commonTokens: PublicKey[]
  open: boolean
  handleClose: () => void
  anchorEl: HTMLButtonElement | null
  centered?: boolean
  onSelect: (index: number) => void
  hideBalances?: boolean
  handleAddToken: (address: string) => void
  initialHideUnknownTokensValue: boolean
  onHideUnknownTokensChange: (val: boolean) => void
  hiddenUnknownTokens: boolean
  network: NetworkType
}
interface RowItemData {
  tokens: (SwapToken & { index: number; strAddress: string })[]
  onSelect: (index: number) => void
  hideBalances: boolean
  isXs: boolean
  networkUrl: string
  classes: ReturnType<typeof useStyles>['classes']
  prices: Record<string, number>
}

export interface IScroll {
  onScroll: (e: React.UIEvent<HTMLElement>) => void
  children: React.ReactNode
}

const Scroll = forwardRef<React.LegacyRef<Scrollbars>, IScroll>(({ onScroll, children }, ref) => {
  return (
    <CustomScrollbar ref={ref} style={{ overflow: 'hidden' }} onScroll={onScroll}>
      {children}
    </CustomScrollbar>
  )
})

const CustomScrollbarsVirtualList = React.forwardRef<React.LegacyRef<Scrollbars>, IScroll>(
  (props, ref) => <Scroll {...props} ref={ref} />
)

const RowItem: React.FC<ListChildComponentProps<RowItemData>> = React.memo(
  ({ index, style, data }) => {
    const { tokens, onSelect, hideBalances, isXs, networkUrl, classes, prices } = data
    const token = tokens[index]
    const tokenBalance = printBN(token.balance, token.decimals)
    const price = prices[token.assetAddress.toString()]
    const usdBalance = price ? Number(tokenBalance) * price : 0

    return (
      <Grid
        className={classes.tokenItem}
        container
        style={{
          ...style,
          width: 'calc(100% - 50px)'
        }}
        onClick={() => {
          onSelect(token.index)
        }}>
        <Box className={classes.imageContainer}>
          <TokenIcon icon={token.logoURI} name={token.name} />
          {token.isUnknown && <img className={classes.warningIcon} src={warningIcon} />}
        </Box>
        <Grid container className={classes.tokenContainer}>
          <Grid container className={classes.tokenHeaderWrapper}>
            <Typography className={classes.tokenName}>
              {token.symbol ? token.symbol : 'Unknown'}{' '}
            </Typography>
            <Grid className={classes.tokenAddress} container>
              <a
                href={`https://eclipsescan.xyz/token/${token.assetAddress.toString()}${networkUrl}`}
                target='_blank'
                rel='noopener noreferrer'
                onClick={event => {
                  event.stopPropagation()
                }}>
                <Typography>
                  {token.assetAddress.toString().slice(0, isXs ? 3 : 4) +
                    '...' +
                    token.assetAddress.toString().slice(isXs ? -4 : -5, -1)}
                </Typography>
                <img width={8} height={8} src={newTabIcon} alt={'Token address'} />
              </a>
            </Grid>
          </Grid>

          <Typography className={classes.tokenDescrpiption}>
            {token.name ? token.name.slice(0, isXs ? 20 : 30) : 'Unknown'}
            {token.name.length > (isXs ? 20 : 30) ? '...' : ''}
          </Typography>
        </Grid>
        <Grid container className={classes.balanceWrapper}>
          {!hideBalances && Number(tokenBalance) > 0 ? (
            <>
              <Typography className={classes.tokenBalanceStatus} noWrap>
                {formatNumberWithSuffix(tokenBalance)}
              </Typography>
              <Typography className={classes.tokenBalanceUSDStatus}>
                ${usdBalance.toFixed(2)}
              </Typography>
            </>
          ) : null}
        </Grid>
      </Grid>
    )
  }
)

export const SelectTokenModal: React.FC<ISelectTokenModal> = memo(
  ({
    tokens,
    commonTokens,
    open,
    handleClose,
    anchorEl,
    centered = false,
    onSelect,
    hideBalances = false,
    handleAddToken,
    initialHideUnknownTokensValue,
    onHideUnknownTokensChange,
    hiddenUnknownTokens,
    network
  }) => {
    const { classes } = useStyles()
    const isXs = useMediaQuery(theme.breakpoints.down('sm'))
    const [value, setValue] = useState<string>('')
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [hideUnknown, setHideUnknown] = useState(initialHideUnknownTokensValue)
    const [prices, setPrices] = useState<Record<string, number>>({})

    const outerRef = useRef<HTMLElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
      setHideUnknown(hiddenUnknownTokens)
    }, [hiddenUnknownTokens])

    type IndexedSwapToken = SwapToken & {
      index: number
      strAddress: string
    }

    const tokensWithIndexes = useMemo<IndexedSwapToken[]>(() => {
      return tokens.map(
        (token, index): IndexedSwapToken => ({
          ...token,
          index,
          strAddress: token.assetAddress.toString()
        })
      )
    }, [tokens])

    useEffect(() => {
      tokensWithIndexes.forEach(token => {
        const balanceStr = printBN(token.balance, token.decimals)
        const balance = Number(balanceStr)
        if (balance > 0) {
          const addr = token.assetAddress.toString()
          if (prices[addr] === undefined) {
            getTokenPrice(addr, network).then(price => {
              setPrices(prev => ({ ...prev, [addr]: price || 0 }))
            })
          }
        }
      })
    }, [tokensWithIndexes])

    const commonTokensList = useMemo(
      () =>
        tokensWithIndexes.filter(
          ({ assetAddress }) => commonTokens.findIndex(key => key.equals(assetAddress)) !== -1
        ),
      [tokensWithIndexes, commonTokens]
    )

    const filteredTokens = useMemo(() => {
      const list = tokensWithIndexes.filter(
        token =>
          token.symbol.toLowerCase().includes(value.toLowerCase()) ||
          token.name.toLowerCase().includes(value.toLowerCase()) ||
          token.strAddress.includes(value)
      )

      const tokensWithPrice = list.filter(token => {
        const price = prices[token.assetAddress.toString()]
        return price !== undefined && price > 0
      })

      const tokensNoPrice = list.filter(token => {
        const price = prices[token.assetAddress.toString()]
        return price === undefined || price === 0
      })

      tokensWithPrice.sort((a, b) => {
        const aNative = +printBN(a.balance, a.decimals)
        const bNative = +printBN(b.balance, b.decimals)
        const aPrice = prices[a.assetAddress.toString()]!
        const bPrice = prices[b.assetAddress.toString()]!
        const aUSD = aNative * aPrice
        const bUSD = bNative * bPrice

        if (aUSD !== bUSD) return bUSD - aUSD
        if (aNative !== bNative) return bNative - aNative
        return a.symbol.toLowerCase().localeCompare(b.symbol.toLowerCase())
      })

      tokensNoPrice.sort((a, b) => {
        const aNative = +printBN(a.balance, a.decimals)
        const bNative = +printBN(b.balance, b.decimals)
        if (aNative !== bNative) return bNative - aNative
        return a.symbol.toLowerCase().localeCompare(b.symbol.toLowerCase())
      })

      const sorted = [...tokensWithPrice, ...tokensNoPrice]

      return hideUnknown ? sorted.filter(token => !token.isUnknown) : sorted
    }, [value, tokensWithIndexes, hideUnknown, prices])

    const searchToken = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value)
    }

    useEffect(() => {
      let timeoutId: NodeJS.Timeout | null = null
      if (open) {
        timeoutId = setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus()
          }
        }, 100)
      }
      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
      }
    }, [open])

    const networkUrl = useMemo(() => {
      switch (network) {
        case NetworkType.Mainnet:
          return ''
        case NetworkType.Testnet:
          return '?cluster=testnet'
        case NetworkType.Devnet:
          return '?cluster=devnet'
        default:
          return '?cluster=testnet'
      }
    }, [network])
    return (
      <>
        <Popover
          classes={{ paper: classes.paper }}
          open={open && !isAddOpen}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorReference={centered ? 'none' : 'anchorEl'}
          className={classes.popover}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center'
          }}>
          <Grid container className={classes.container}>
            <Grid className={classes.selectTokenHeader}>
              <Typography component='h1'>Select a token</Typography>
              <Button
                className={classes.selectTokenClose}
                onClick={handleClose}
                aria-label='Close'
              />
            </Grid>
            <Grid className={classes.topRow} container>
              <Grid container className={classes.inputControl}>
                <input
                  ref={inputRef}
                  className={classes.selectTokenInput}
                  placeholder='Search token name or address'
                  onChange={searchToken}
                  value={value}
                />
                <CardMedia image={searchIcon} className={classes.inputIcon} />
              </Grid>
              <TooltipHover title='Add token'>
                <AddCircleOutlineIcon
                  className={classes.addIcon}
                  onClick={() => setIsAddOpen(true)}
                />
              </TooltipHover>
            </Grid>
            <Grid container>
              <Grid className={classes.commonTokensList}>
                {commonTokensList.map(token => (
                  <Box
                    className={classes.commonTokenItem}
                    key={token.symbol}
                    onClick={() => {
                      onSelect(token.index)
                      setValue('')
                      handleClose()
                    }}>
                    <img
                      className={classes.commonTokenIcon}
                      src={token.logoURI}
                      alt={token.name + 'logo'}
                    />
                    <Typography component='p'>{token.symbol}</Typography>
                  </Box>
                ))}
              </Grid>
            </Grid>
            <Grid container>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={hideUnknown}
                    onChange={e => {
                      setHideUnknown(e.target.checked)
                      onHideUnknownTokensChange(e.target.checked)
                    }}
                    name='hideUnknown'
                  />
                }
                label='Hide unknown tokens'
              />
            </Grid>
            <Box className={classes.tokenList}>
              {!filteredTokens.length && (
                <Grid className={classes.noTokenFoundContainer}>
                  <img className={classes.img} src={emptyIcon} alt='Not connected' />
                  <Typography className={classes.noTokenFoundPlaceholder}>
                    No token found...
                  </Typography>
                  <Typography className={classes.noTokenFoundPlaceholder}>
                    Add your token by pressing the button!
                  </Typography>
                  <Button
                    className={classes.addTokenButton}
                    onClick={() => setIsAddOpen(true)}
                    variant='contained'>
                    Add a token
                  </Button>
                </Grid>
              )}
              <List
                height={400}
                width={360}
                itemSize={66}
                itemCount={filteredTokens.length}
                outerElementType={CustomScrollbarsVirtualList}
                outerRef={outerRef}
                itemData={{
                  tokens: filteredTokens,
                  onSelect: (idx: number) => {
                    onSelect(idx)
                    setValue('')
                    handleClose()
                  },
                  hideBalances,
                  isXs,
                  networkUrl,
                  classes,
                  prices
                }}>
                {RowItem}
              </List>
            </Box>
          </Grid>
        </Popover>
        <AddTokenModal
          open={isAddOpen}
          handleClose={() => setIsAddOpen(false)}
          addToken={(address: string) => {
            handleAddToken(address)
            setIsAddOpen(false)
            setHideUnknown(false)
            onHideUnknownTokensChange(false)
          }}
        />
      </>
    )
  }
)
export default SelectTokenModal
