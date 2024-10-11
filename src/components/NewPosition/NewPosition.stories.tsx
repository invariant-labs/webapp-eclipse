import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { MemoryRouter } from 'react-router-dom'
import NewPosition from './NewPosition'
import { Network } from '@invariant-labs/a0-sdk'
import { Status } from '@store/reducers/wallet'

const meta = {
  title: 'PageComponent/NewPosition',
  component: NewPosition,
  decorators: [
    Story => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    )
  ]
} satisfies Meta<typeof NewPosition>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    currentPairReversed: false,
    isXtoY: true,
    addLiquidityHandler: fn(),
    midPrice: { x: 1234, index: 23 } as any,
    bestTiers: [],
    commonTokens: [],
    copyPoolAddressHandler: fn(),
    currentFeeIndex: 0,
    currentPriceSqrt: 123 as any,
    data: [],
    feeTiers: [
      { feeValue: 0.1 },
      { feeValue: 0.2 },
      { feeValue: 0.3 },
      { feeValue: 0.4 },
      { feeValue: 0.5 }
    ],
    handleAddToken: fn(),
    initialFee: '0.05',
    initialHideUnknownTokensValue: false,
    initialOpeningPositionMethod: 'concentration',
    initialSlippage: '0.01',
    initialTokenFrom: 'BTC',
    initialTokenTo: 'ETH',
    isCurrentPoolExisting: true,
    isWaitingForNewPool: false,
    onChangePositionTokens: fn(),
    onHideUnknownTokensChange: fn(),
    onPositionOpeningMethodChange: fn(),
    onSlippageChange: fn(),
    poolIndex: 0,
    progress: 'progress',
    reloadHandler: fn(),
    setMidPrice: fn(),
    ticksLoading: false,
    tickSpacing: 1 as any,
    tokens: {},
    xDecimal: 9 as any,
    yDecimal: 12 as any,
    hasTicksError: false,
    calcAmount: fn(),
    loadingTicksAndTickMaps: false,
    poolKey: '',
    onRefresh: fn(),
    isBalanceLoading: false,
    shouldNotUpdatePriceRange: false,
    unblockUpdatePriceRange: fn(),
    isGetLiquidityError: false,
    onlyUserPositions: false,
    setOnlyUserPositions: fn(),
    network: Network.Testnet,
    isLoadingTokens: false,
    azeroBalance: 20000000000000 as any,
    walletStatus: Status.Initialized,
    onConnectWallet: () => {},
    onDisconnectWallet: () => {}
  },
  render: () => {
    return (
      <NewPosition
        midPrice={{ x: 1234, index: 23n, sqrtPrice: 123n }}
        currentPriceSqrt={123n}
        tickSpacing={1n}
        xDecimal={9n}
        yDecimal={12n}
        commonTokens={[]}
        handleAddToken={fn()}
        onChangePositionTokens={fn()}
        onPositionOpeningMethodChange={fn()}
        onSlippageChange={fn()}
        onHideUnknownTokensChange={fn()}
        copyPoolAddressHandler={fn()}
        reloadHandler={fn()}
        setMidPrice={fn()}
        ticksLoading={false}
        hasTicksError={false}
        progress='progress'
        isCurrentPoolExisting={true}
        isWaitingForNewPool={false}
        poolIndex={0}
        tokens={{}}
        bestTiers={[]}
        currentPairReversed={false}
        isXtoY={true}
        initialTokenFrom='BTC'
        initialTokenTo='ETH'
        initialFee='0.05'
        initialSlippage='0.01'
        initialOpeningPositionMethod='concentration'
        initialHideUnknownTokensValue={false}
        data={[]}
        currentFeeIndex={0}
        feeTiers={[
          { feeValue: 0.1 },
          { feeValue: 0.2 },
          { feeValue: 0.3 },
          { feeValue: 0.4 },
          { feeValue: 0.5 }
        ]}
        addLiquidityHandler={fn()}
        calcAmount={() => 1n}
        loadingTicksAndTickMaps={false}
        poolKey=''
        onRefresh={fn()}
        isBalanceLoading={false}
        shouldNotUpdatePriceRange={false}
        unblockUpdatePriceRange={fn()}
        isGetLiquidityError={false}
        onlyUserPositions={false}
        setOnlyUserPositions={fn()}
        network={Network.Testnet}
        isLoadingTokens={false}
        azeroBalance={20000000000000n}
        walletStatus={Status.Initialized}
        onConnectWallet={() => {}}
        onDisconnectWallet={() => {}}
      />
    )
  }
}
