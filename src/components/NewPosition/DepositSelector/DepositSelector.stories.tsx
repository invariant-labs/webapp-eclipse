import React from 'react'
import { storiesOf } from '@storybook/react'
import DepositSelector from './DepositSelector'
import { SwapToken } from '@selectors/solanaWallet'
import { BN } from '@project-serum/anchor'
import { PublicKey } from '@solana/web3.js'
import { useState } from '@storybook/addons'

const tokens: SwapToken[] = [
  {
    balance: new BN(100).mul(new BN(34786)),
    decimals: 6,
    symbol: 'SOL',
    assetAddress: new PublicKey('So11111111111111111111111111111111111111112'),
    name: 'Wrapped Solana',
    logoURI:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
  },
  {
    balance: new BN(100).mul(new BN(126)),
    decimals: 6,
    symbol: 'BTC',
    assetAddress: new PublicKey('9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E'),
    name: 'BTC',
    logoURI:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E/logo.png'
  },
  {
    balance: new BN(10).mul(new BN(5342)),
    decimals: 6,
    symbol: 'USDC',
    assetAddress: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
    name: 'USD coin',
    logoURI:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
  }
]

storiesOf('position/depositSelector', module).add('deposit', () => {
  const [feeTierIndex, setFeeTierIndex] = useState<number>(0)
  return (
    <DepositSelector
      tokens={tokens}
      setPositionTokens={(_a, _b, fee) => {
        setFeeTierIndex(fee)
      }}
      onAddLiquidity={() => {}}
      tokenAInputState={{
        value: '0.000001',
        setValue: () => {},
        blocked: false,
        decimalsLimit: 6
      }}
      tokenBInputState={{
        value: '',
        setValue: () => {},
        blocked: true,
        blockerInfo: 'Select a token.',
        decimalsLimit: 8
      }}
      feeTiers={[0.02, 0.04, 0.1, 0.3, 1]}
      progress='none'
      onReverseTokens={() => {}}
      poolIndex={0}
      canCreateNewPool
      canCreateNewPosition
      handleAddToken={() => {}}
      commonTokens={[
        new PublicKey('So11111111111111111111111111111111111111112'),
        new PublicKey('9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E'),
        new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
      ]}
      initialHideUnknownTokensValue={false}
      onHideUnknownTokensChange={() => {}}
      feeTierIndex={feeTierIndex}
    />
  )
})
