import type { Meta, StoryObj } from '@storybook/react'
import { BrowserRouter } from 'react-router-dom'
import { PositionsList } from './PositionsList'
import { Network } from '@invariant-labs/a0-sdk'

const meta = {
  title: 'PositionsList',
  component: PositionsList,
  decorators: [
    Story => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    )
  ]
} satisfies Meta<typeof PositionsList>

export default meta
type Story = StoryObj<typeof meta>

const data = [
  {
    tokenXName: 'BTC',
    tokenYName: 'AZERO',
    tokenXIcon: '',
    tokenYIcon: '',
    min: 2149.6,
    max: 149.6,
    fee: 0.05,
    valueX: 10000.45,
    valueY: 2137.4,
    id: 1,
    address: '0x123132423423',
    tokenXLiq: 5000,
    tokenYLiq: 300.2,
    currentPrice: 1000,
    network: Network.Testnet,
    isFullRange: false
  },
  {
    tokenXName: 'BTC',
    tokenYName: 'AZERO',
    tokenXIcon: '',
    tokenYIcon: '',
    min: 2149.6,
    max: 149.6,
    fee: 0.05,
    valueX: 10000.45,
    valueY: 2137.4,
    id: 2,
    address: '0x123132423423',
    tokenXLiq: 5000,
    tokenYLiq: 300.2,
    currentPrice: 1000,
    network: Network.Testnet,
    isFullRange: false
  },
  {
    tokenXName: 'BTC',
    tokenYName: 'AZERO',
    tokenXIcon: '',
    tokenYIcon: '',
    min: 2149.6,
    max: 149.6,
    fee: 0.05,
    valueX: 10000.45,
    valueY: 2137.4,
    id: 3,
    address: '0x123132423423',
    tokenXLiq: 5000,
    tokenYLiq: 300.2,
    currentPrice: 1000,
    network: Network.Testnet,
    isFullRange: false
  },
  {
    tokenXName: 'BTC',
    tokenYName: 'AZERO',
    tokenXIcon: '',
    tokenYIcon: '',
    min: 2149.6,
    max: 149.6,
    fee: 0.05,
    valueX: 10000.45,
    valueY: 2137.4,
    id: 4,
    address: '0x123132423423',
    tokenXLiq: 5000,
    tokenYLiq: 300.2,
    currentPrice: 1000,
    network: Network.Testnet,
    isFullRange: false
  }
]

const handleClick = () => {
  console.log('actionButton add Position')
}

export const Primary: Story = {
  args: {
    data,
    onAddPositionClick: handleClick,
    itemsPerPage: 5,
    noConnectedBlockerProps: {
      onConnect: () => {}
    },
    searchValue: '',
    searchSetValue: () => {},
    handleRefresh: () => {},
    initialPage: 1,
    setLastPage: () => {},
    pageChanged: () => {},
    length: 0 as any,
    loadedPages: {},
    getRemainingPositions: () => {},
    noInitialPositions: false
  }
}
