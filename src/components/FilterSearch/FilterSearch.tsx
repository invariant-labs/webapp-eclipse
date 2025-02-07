import {
  Autocomplete,
  Box,
  Divider,
  Fade,
  Grid,
  InputAdornment,
  Paper,
  Popper,
  TextField,
  Typography
} from '@mui/material'
import SearchIcon from '@static/svg/lupaDark.svg'

import { forwardRef, useMemo, useState } from 'react'

import useStyles from './styles'
import { shortenAddress } from '@utils/uiUtils'
import icons from '@static/icons'
import { printBN } from '@utils/utils'
import { NetworkType } from '@store/consts/static'
import { colors } from '@static/theme'

interface ISearchToken {
  icon: string
  name: string
  symbol: string
  address: string
  balance: any
  decimals: number
}

interface IFilterSearch {
  networkType: string
  selectedFilters: ISearchToken[]
  setSelectedFilters: React.Dispatch<React.SetStateAction<ISearchToken[]>>
  mappedTokens: ISearchToken[]
}

export const FilterSearch: React.FC<IFilterSearch> = ({
  networkType,
  selectedFilters,
  setSelectedFilters,
  mappedTokens
}) => {
  const [open, setOpen] = useState(false)

  const isTokensSelected = selectedFilters.length === 2
  const fullWidth = open || selectedFilters.length >= 1
  const { classes } = useStyles({ fullWidth, isTokensSelected })

  const PaperComponent = (paperProps, ref) => {
    return (
      <Fade in timeout={600}>
        <Paper {...paperProps} ref={ref}>
          <Box onClick={e => e.stopPropagation()}>
            <Box className={classes.commonTokens}>
              <Typography className={classes.headerText}>Commons Tokens</Typography>
              <Box display='flex' gap='8px' flexDirection='column' height='80px'>
                <Box gap='8px' display='flex'>
                  {mappedTokens.slice(0, 3).map(token => (
                    <Box
                      key={token.address}
                      className={classes.commonTokenContainer}
                      onMouseDown={e => handleSelectToken(e, token)}>
                      <img
                        className={classes.commonTokenIcon}
                        src={token.icon}
                        alt={token.symbol}
                      />
                      <Typography className={classes.commonTokenLabel}>{token.symbol}</Typography>
                    </Box>
                  ))}
                </Box>

                <Box gap='8px' display='flex'>
                  {mappedTokens.slice(3, 6).map(token => (
                    <Box
                      key={token.address}
                      className={classes.commonTokenContainer}
                      onMouseDown={e => handleSelectToken(e, token)}>
                      <img
                        className={classes.commonTokenIcon}
                        src={token.icon}
                        alt={token.symbol}
                      />
                      <Typography className={classes.commonTokenLabel}>{token.symbol}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
              <Divider className={classes.divider} orientation='horizontal' flexItem />
            </Box>
          </Box>
          <Box>{paperProps.children}</Box>
        </Paper>
      </Fade>
    )
  }

  const CustomPopper = props => {
    return <Popper {...props} placement='bottom-start' modifiers={[]} />
  }

  const PaperComponentForward = forwardRef(PaperComponent)

  const networkUrl = useMemo(() => {
    switch (networkType) {
      case NetworkType.Mainnet:
        return ''
      case NetworkType.Testnet:
        return '?cluster=testnet'
      case NetworkType.Devnet:
        return '?cluster=devnet'
      default:
        return '?cluster=testnet'
    }
  }, [networkType])

  const handleRemoveToken = (tokenToRemove: ISearchToken) => {
    setSelectedFilters(prevFilters =>
      prevFilters.filter(token => token.address !== tokenToRemove.address)
    )
  }

  const handleSelectToken = (e: React.MouseEvent, token: ISearchToken) => {
    e.stopPropagation()
    e.preventDefault()
    setSelectedFilters(prevFilters => {
      if (
        prevFilters.length >= 2 ||
        prevFilters.some(selected => selected.address === token.address)
      ) {
        return prevFilters
      }
      return [...prevFilters, token]
    })
    setOpen(true)
  }

  const options: ISearchToken[] = mappedTokens.filter(
    token => !selectedFilters.some(selected => selected.address === token.address)
  )

  const filterOptions = (opts: ISearchToken[], state: { inputValue: string }) => {
    return opts.filter(token => {
      return (
        token.symbol?.toLowerCase().includes(state.inputValue.toLowerCase()) ||
        token.address?.toLowerCase().includes(state.inputValue.toLowerCase())
      )
    })
  }

  const handleAutoCompleteChange = (_event: any, newValue: ISearchToken[]) => {
    setSelectedFilters(newValue)
    setOpen(true)
  }

  return (
    <Autocomplete
      disableCloseOnSelect={!isTokensSelected}
      sx={{
        '& .MuiOutlinedInput-root': {
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' }
        }
      }}
      multiple
      ListboxProps={{
        autoFocus: true,
        sx: {
          '&::-webkit-scrollbar': {
            width: '6px'
          },
          '&::-webkit-scrollbar-track': {
            background: colors.invariant.newDark
          },
          '&::-webkit-scrollbar-thumb': {
            background: colors.invariant.pink,
            borderRadius: '3px'
          }
        }
      }}
      disablePortal
      value={selectedFilters}
      onChange={handleAutoCompleteChange}
      classes={{ paper: classes.paper }}
      PopperComponent={CustomPopper}
      PaperComponent={PaperComponentForward}
      id='token-selector'
      options={options}
      open={isTokensSelected ? false : open}
      getOptionLabel={option => option.symbol}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      disableClearable
      popupIcon={null}
      filterOptions={filterOptions}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => {
          return (
            <Box
              {...getTagProps({ index })}
              margin={0}
              className={`${getTagProps({ index }).className} ${classes.boxChip}`}>
              <img src={option.icon} className={classes.avatarChip} alt={option.symbol} />
              <Typography>{shortenAddress(option.symbol)}</Typography>
              <img
                src={icons.closeIcon}
                className={classes.closeIcon}
                alt='close'
                onClick={e => {
                  e.stopPropagation()
                  handleRemoveToken(option)
                }}
              />
            </Box>
          )
        })
      }
      renderOption={(props, option) => {
        return (
          <Box component='li' {...props}>
            <Box className={classes.tokenContainer}>
              <Box display='flex' alignItems='center'>
                <img src={option.icon} alt={option.symbol} className={classes.searchResultIcon} />
                <Box display='flex' flexDirection='column'>
                  <Box display='flex' flexDirection='row' alignItems='center' gap='6px'>
                    <Typography className={classes.tokenLabel}>
                      {shortenAddress(option.symbol)}
                    </Typography>
                    <Grid className={classes.tokenAddress} container direction='column'>
                      <a
                        href={`https://eclipsescan.xyz/token/${option.address.toString()}${networkUrl}`}
                        target='_blank'
                        rel='noopener noreferrer'
                        onClick={event => {
                          event.stopPropagation()
                        }}>
                        <Typography>{shortenAddress(option.address)}</Typography>
                        <img width={8} height={8} src={icons.newTab} alt='Token address' />
                      </a>
                    </Grid>
                  </Box>
                  <Typography className={classes.tokenName}>
                    {option.name === option.address ? shortenAddress(option.name) : option.name}
                  </Typography>
                </Box>
              </Box>
              <Typography className={classes.balaceLabel}>
                {option.balance > 0 && `Balance: ${printBN(option.balance, option.decimals)}`}
              </Typography>
            </Box>
          </Box>
        )
      }}
      renderInput={params => (
        <TextField
          {...params}
          variant='outlined'
          className={classes.searchBar}
          InputProps={
            {
              ...params.InputProps,
              style: { padding: 0, height: '100%', display: 'flex', alignItems: 'center' },
              endAdornment: (
                <InputAdornment position='end'>
                  <img src={SearchIcon} className={classes.searchIcon} alt='Search' />
                </InputAdornment>
              ),
              inputProps: {
                ...params.inputProps,
                readOnly: isTokensSelected
              },
              onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
                if (params.inputProps.onKeyDown) {
                  params.inputProps.onKeyDown(event)
                }
                if (event.key === 'Backspace' && event.currentTarget.value === '') {
                  if (isTokensSelected) {
                  } else if (selectedFilters.length > 0) {
                    const lastToken = selectedFilters[selectedFilters.length - 1]
                    handleRemoveToken(lastToken)
                  }
                }
              }
            } as any
          }
          onClick={() => {
            if (!isTokensSelected) {
              setOpen(true)
            }
          }}
        />
      )}
    />
  )
}
