import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import SelectNetwork, { ISelectNetwork } from './SelectNetwork'
import { NetworkType, EclipseNetworks } from '@consts/static'

const networks: ISelectNetwork[] = [
  { networkType: NetworkType.MAINNET, rpc: EclipseNetworks.MAIN },
  { networkType: NetworkType.DEVNET, rpc: EclipseNetworks.DEV },
  { networkType: NetworkType.TESTNET, rpc: EclipseNetworks.TEST }
]

storiesOf('modals/newSelectNetwork', module).add('default', () => (
  <SelectNetwork
    networks={networks}
    open={true}
    handleClose={() => {}}
    onSelect={(networkType, rpc) => action('chosen: ' + networkType + ' ' + rpc)()}
    anchorEl={null}
    activeNetwork={NetworkType.TESTNET}
  />
))
