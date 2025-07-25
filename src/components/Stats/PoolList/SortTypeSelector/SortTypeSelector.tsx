import React, { useState } from 'react'
import { Box, Button, Grid, Popover, Typography } from '@mui/material'

import { SortTypePoolList } from '@store/consts/static'
import { useStyles } from './style'
import { dropdownIcon, dropdownReverseIcon } from '@static/icons'
import { colors, typography } from '@static/theme'

interface Props {
  currentSort: SortTypePoolList
  onSelect: (value: SortTypePoolList) => void
  fullWidth?: boolean
}

const sortGroups: {
  label: string
  asc: SortTypePoolList
  desc: SortTypePoolList
}[] = [
  { label: 'Name', asc: SortTypePoolList.NAME_ASC, desc: SortTypePoolList.NAME_DESC },
  { label: 'Fee', asc: SortTypePoolList.FEE_ASC, desc: SortTypePoolList.FEE_DESC },
  { label: '24h Fee', asc: SortTypePoolList.FEE_24_ASC, desc: SortTypePoolList.FEE_24_DESC },
  { label: 'Volume', asc: SortTypePoolList.VOLUME_ASC, desc: SortTypePoolList.VOLUME_DESC },
  { label: 'TVL', asc: SortTypePoolList.TVL_ASC, desc: SortTypePoolList.TVL_DESC },
  { label: 'APY', asc: SortTypePoolList.APY_ASC, desc: SortTypePoolList.APY_DESC }
]

const SortTypeSelector: React.FC<Props> = ({ currentSort, onSelect, fullWidth }) => {
  const { classes } = useStyles()
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleSelect = (option: SortTypePoolList) => {
    onSelect(option)
    handleClose()
  }

  return (
    <Box display='flex' flexGrow={fullWidth ? 1 : 'initial'}>
      <Button onClick={handleClick} className={classes.selectButton}>
        <Box display={'flex'} gap={1}>
          <Typography sx={{ ...typography.caption1 }} color={colors.invariant.text}>
            Sort by:
          </Typography>{' '}
          <Typography sx={{ ...typography.caption2 }} color={colors.invariant.textGrey}>
            {sortGroups
              .flatMap(group => [group.asc, group.desc])
              .find(value => value === currentSort) !== undefined &&
              sortGroups.find(group => group.asc === currentSort || group.desc === currentSort)
                ?.label + (currentSort % 2 === 0 ? ' ↑' : ' ↓')}
          </Typography>
        </Box>
        {!open ? <img src={dropdownIcon} alt='' /> : <img src={dropdownReverseIcon} alt='' />}
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        classes={{ paper: classes.paper }}>
        <Grid className={classes.root}>
          {sortGroups.map(group => (
            <Grid item key={group.label}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant={currentSort === group.asc ? 'contained' : 'text'}
                    onClick={() => handleSelect(group.asc)}
                    className={classes.optionButton}>
                    {group.label} ↑
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant={currentSort === group.desc ? 'contained' : 'text'}
                    onClick={() => handleSelect(group.desc)}
                    className={classes.optionButton}>
                    {group.label} ↓
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Popover>
    </Box>
  )
}

export default SortTypeSelector
