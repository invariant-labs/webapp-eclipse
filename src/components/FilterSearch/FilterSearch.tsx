import SearchIcon from '@static/svg/lupaDark.svg'
import {
  Autocomplete,
  Avatar,
  Box,
  Chip,
  Fade,
  InputAdornment,
  Paper,
  TextField,
  Typography
} from '@mui/material'
import { forwardRef, useState } from 'react'
import useStyles from './styles'
import { shortenAddress } from '@utils/uiUtils'

interface ISearchToken {
  icon: string
  name: string
  symbol: string
  address: string
}

interface IFilterSearch {
  selectedTokens: ISearchToken[]
  setSelectedTokens: (tokens: ISearchToken[]) => void
  mappedTokens: ISearchToken[]
}

function PaperComponent(paperProps, ref) {
  return (
    <Fade in>
      <Paper {...paperProps} ref={ref} />
    </Fade>
  )
}
const PaperComponentForward = forwardRef(PaperComponent)

export const FilterSearch: React.FC<IFilterSearch> = ({
  selectedTokens,
  setSelectedTokens,
  mappedTokens
}) => {
  const { classes } = useStyles()
  const [open, setOpen] = useState(false)

  return (
    <Autocomplete
      sx={{
        '& .MuiOutlinedInput-root': {
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' }
        }
      }}
      multiple
      PaperComponent={PaperComponentForward}
      classes={{ paper: classes.paper }}
      id='token-selector'
      options={mappedTokens.filter(
        option => !selectedTokens.some(selected => selected.address === option.address)
      )}
      getOptionLabel={option => option.symbol}
      value={selectedTokens}
      onChange={(_, newValue) => {
        if (newValue.length <= 2) {
          setSelectedTokens(newValue)
        }
      }}
      onOpen={() => {
        if (selectedTokens.length < 2) setOpen(true)
      }}
      onClose={() => setOpen(false)}
      open={open}
      disableClearable
      popupIcon={null}
      filterOptions={(options, { inputValue }) =>
        options.filter(
          option =>
            option.symbol.toLowerCase().includes(inputValue.toLowerCase()) ||
            option.address.toLowerCase().includes(inputValue.toLowerCase())
        )
      }
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            avatar={<Avatar src={option.icon} />}
            label={shortenAddress(option.symbol)}
          />
        ))
      }
      renderOption={(props, option) => (
        <Box component='li' {...props}>
          <img src={option.icon} alt={option.symbol} className={classes.searchResultIcon} />
          <Typography>{shortenAddress(option.symbol)}</Typography>
        </Box>
      )}
      renderInput={params => (
        <TextField
          {...params}
          variant='outlined'
          placeholder={!selectedTokens.length ? 'Select token' : ''}
          className={classes.searchBar}
          InputProps={{
            ...params.InputProps,
            readOnly: selectedTokens.length >= 2,
            endAdornment: (
              <>
                {params.InputProps.endAdornment}
                <InputAdornment position='end'>
                  <img src={SearchIcon} className={classes.searchIcon} alt='Search' />
                </InputAdornment>
              </>
            )
          }}
          onClick={() => {
            if (selectedTokens.length < 2) setOpen(true)
          }}
        />
      )}
    />
  )
}
