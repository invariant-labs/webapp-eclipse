import { useStyles } from './style'
import icons from '@static/icons'
import { Box, Typography } from '@mui/material'
import { CHAINS } from '@store/consts/static'
import classNames from 'classnames'
import { Chain, ISelectChain } from '@store/consts/types'
import { Modal } from '../Modal/Modal'

type Props = {
  onChainChange: (chain: ISelectChain) => void
}

export const ChainModal = ({ onChainChange }: Props) => {
  const { classes } = useStyles()

  return (
    <Modal icon={<img className={classes.barButtonIcon} src={icons.Eclipse} alt='Chain icon' />}>
      <Box className={classes.container}>
        <Typography className={classes.title}>Select a chain</Typography>
        <Box className={classes.chainContainer}>
          {CHAINS.map(chain => (
            <Box
              className={classNames(classes.chain, {
                [classes.chainActive]: chain.name === Chain.Eclipse
              })}
              key={chain.name}
              onClick={() => {
                onChainChange(chain)
              }}>
              <img
                className={classes.icon}
                src={icons[chain.iconGlow]}
                alt={`${chain.name} icon`}
              />
              <Typography className={classes.name}>{chain.name}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Modal>
  )
}
