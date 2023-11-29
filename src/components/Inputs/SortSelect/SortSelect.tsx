import React from 'react'
import { Button } from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import classNames from 'classnames'
import useStyles from './style'
import SelectSortFarmsModal from '@components/Modals/SelectModals/SortFarmsModal/SortFarmModal'

export interface SortItem {
  icon?: string
  value?: string
  name: string
}

export interface ISortSelectModal {
  name?: string
  current: SortItem | null
  centered?: boolean
  sortItems: SortItem[]
  onSelect: (name: string) => void
  className?: string
  onlyText: boolean
}
export const SortSelect: React.FC<ISortSelectModal> = ({
  name = 'SortSelect',
  className,
  current,
  sortItems,
  onSelect,
  centered,
  onlyText
}) => {
  const classes = useStyles()
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)
  const [open, setOpen] = React.useState<boolean>(false)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <>
      <Button
        className={classNames(classes.button, className)}
        color='primary'
        variant='contained'
        onClick={handleClick}
        endIcon={<ExpandMoreIcon className={classes.endIcon} />}
        classes={{
          endIcon: 'selectArrow'
        }}
        disableRipple>
        <span style={{ whiteSpace: 'nowrap' }} className={classes.tokenName}>
          {!current ? name : onlyText ? current.value : current.name}
        </span>
      </Button>
      <SelectSortFarmsModal
        sortItems={sortItems}
        open={open}
        centered={centered}
        onSelect={onSelect}
        handleClose={handleClose}
        onlyText={onlyText}
        anchorEl={anchorEl}
      />
    </>
  )
}

export default SortSelect
