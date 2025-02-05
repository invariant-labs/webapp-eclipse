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
import icons from '@static/icons'

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
  const [open, setOpen] = useState(false)
  const fullWidth = open || selectedTokens.length >= 1
  const { classes } = useStyles({ fullWidth })

  const handleRemoveToken = (tokenToRemove: ISearchToken) => {
    setSelectedTokens(selectedTokens.filter(token => token.address !== tokenToRemove.address))
  }

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
        value.map((option, index) => {
          const tagProps = getTagProps({ index })
          return (
            // Chip

            <Box {...tagProps} margin={0} className={`${tagProps.className} ${classes.boxChip}`}>
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
      renderOption={(props, option) => (
        <Box>
          <Box component='li' {...props}>
            <img src={option.icon} alt={option.symbol} className={classes.searchResultIcon} />
            <Typography>{shortenAddress(option.symbol)}</Typography>
          </Box>
        </Box>
      )}
      renderInput={params => (
        <TextField
          {...params}
          variant='outlined'
          className={classes.searchBar}
          InputProps={{
            ...params.InputProps,
            readOnly: selectedTokens.length >= 2
          }}
          onClick={() => {
            if (selectedTokens.length < 2) setOpen(true)
          }}
        />
      )}
    />
  )
}
