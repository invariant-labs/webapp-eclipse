import { Autocomplete, Box, Divider, Fade, Paper, TextField, Typography } from '@mui/material'
import { forwardRef, useState } from 'react'
import copyAddressIcon from '@static/svg/copyIcon.svg'

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

export const FilterSearch: React.FC<IFilterSearch> = ({
  selectedTokens,
  setSelectedTokens,
  mappedTokens
}) => {
  const PaperComponent = (paperProps, ref) => {
    return (
      <Fade in timeout={600}>
        <Paper {...paperProps} ref={ref}>
          <Box onMouseDown={e => e.stopPropagation()}>
            <Box className={classes.commonTokens}>
              <Typography className={classes.headerText}>Commons Tokens</Typography>
              <Box height='80px'></Box>
              <Divider className={classes.divider} orientation='horizontal' flexItem />
            </Box>
          </Box>
          <Box>{paperProps.children}</Box>
        </Paper>
      </Fade>
    )
  }

  const PaperComponentForward = forwardRef(PaperComponent)

  const [openh, setOpen] = useState(false)
  const open = true
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
      disableCloseOnSelect
      classes={{ paper: classes.paper }}
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
        <Box component='li' {...props}>
          <Box className={classes.tokenContainer}>
            <Box display='flex' alignItems='center'>
              <img src={option.icon} alt={option.symbol} className={classes.searchResultIcon} />
              <Box display='flex' flexDirection='column'>
                <Box display='flex' flexDirection='row' alignItems='center' gap='6px'>
                  <Typography className={classes.tokenLabel}>
                    {shortenAddress(option.symbol)}
                  </Typography>
                  <Box className={classes.labelContainer}>
                    <Typography className={classes.addressLabel}>
                      {shortenAddress(option.address)}
                    </Typography>
                    <img width={8} src={copyAddressIcon} />
                  </Box>
                </Box>
                <Typography className={classes.tokenName}>
                  {option.name === option.address ? shortenAddress(option.name) : option.name}
                </Typography>
              </Box>
            </Box>
            <Typography className={classes.balaceLabel}>Balance: 1.3468</Typography>
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
