import {
  Autocomplete,
  Box,
  Fade,
  InputAdornment,
  Paper,
  Popper,
  TextField,
  Typography,
  useMediaQuery
} from '@mui/material'
import SearchIcon from '@static/svg/lupaDark.svg'
import { forwardRef, useMemo, useState } from 'react'
import { NetworkType } from '@store/consts/static'
import { colors, theme, typography } from '@static/theme'
import useStyles from './styles'
import { TokenChip } from './Helpers/TokenChip'
import { TokenOption } from './Helpers/TokenOption'

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
  //const open = true
  const isTokensSelected = selectedFilters.length === 2
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
  const { classes } = useStyles({ isSmall })
  const shouldOpenPopper = isSmall ? !isTokensSelected && open : !isTokensSelected && open

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

  const options: ISearchToken[] = mappedTokens.filter(
    token => !selectedFilters.some(selected => selected.address === token.address)
  )

  const PaperComponent = (paperProps, ref) => {
    return (
      <Fade in timeout={300}>
        <Paper {...paperProps} ref={ref}>
          <Box>{paperProps.children}</Box>
        </Paper>
      </Fade>
    )
  }

  const CustomPopper = props => {
    return <Popper {...props} placement='bottom-start' modifiers={[]} />
  }

  const PaperComponentForward = forwardRef(PaperComponent)

  const handleRemoveToken = (tokenToRemove: ISearchToken) => {
    setSelectedFilters(prev => prev.filter(token => token.address !== tokenToRemove.address))
  }

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
      multiple
      disablePortal
      disableClearable
      id='token-selector'
      disableCloseOnSelect={!isTokensSelected}
      value={selectedFilters}
      popupIcon={null}
      onChange={handleAutoCompleteChange}
      PopperComponent={CustomPopper}
      PaperComponent={PaperComponentForward}
      options={options}
      classes={{ paper: classes.paper }}
      open={shouldOpenPopper}
      getOptionLabel={option => option.symbol}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      filterOptions={filterOptions}
      noOptionsText={<Typography className={classes.headerText}>No tokens found</Typography>}
      sx={{
        '& .MuiOutlinedInput-root': {
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' }
        },
        width: isSmall ? '100%' : 'auto'
      }}
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
        },
        style: { maxHeight: '460px' }
      }}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <TokenChip option={option} onRemove={handleRemoveToken} {...getTagProps({ index })} />
        ))
      }
      renderOption={(props, option) => (
        <Box component='li' {...props}>
          <TokenOption option={option} networkUrl={networkUrl} />
        </Box>
      )}
      renderInput={params => (
        <TextField
          {...params}
          variant='outlined'
          className={classes.searchBar}
          placeholder={selectedFilters.length === 0 ? 'Search token' : ''}
          InputProps={
            {
              ...params.InputProps,
              style: {
                padding: 0,
                height: '100%',

                display: 'flex',
                alignItems: 'center',
                ...typography.body2
              },
              endAdornment: (
                <InputAdornment position='end'>
                  <img src={SearchIcon} className={classes.searchIcon} alt='Search' />
                </InputAdornment>
              ),
              inputProps: {
                ...params.inputProps,
                readOnly: isTokensSelected,
                style: { paddingLeft: '12px' }
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
          onClick={() => !isTokensSelected && setOpen(true)}
        />
      )}
    />
  )
}
