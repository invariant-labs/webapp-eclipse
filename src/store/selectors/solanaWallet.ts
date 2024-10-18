import { BN } from '@project-serum/anchor'
import { createSelector } from '@reduxjs/toolkit'
import { keySelectors, AnyProps } from './helpers'
import { PublicKey } from '@solana/web3.js'
import { tokens } from './pools'
import { ISolanaWallet, ITokenAccount, solanaWalletSliceName } from '@store/reducers/solanaWallet'
import { ISolanaConnectionStore, solanaConnectionSliceName } from '@store/reducers/solanaConnection'
import {
  NetworkType,
  WETH_MIN_DEPOSIT_SWAP_FROM_AMOUNT,
  WETH_POSITION_INIT_LAMPORTS,
  WRAPPED_ETH_ADDRESS
} from '@store/consts/static'

const store = (s: AnyProps) => s[solanaWalletSliceName] as ISolanaWallet

export const { address, balance, accounts, status, balanceLoading, thankYouModalShown } =
  keySelectors(store, [
    'address',
    'balance',
    'accounts',
    'status',
    'balanceLoading',
    'thankYouModalShown'
  ])

const connectionStore = (s: AnyProps) => s[solanaConnectionSliceName] as ISolanaConnectionStore

export const { network } = keySelectors(connectionStore, ['network'])

export const tokenBalance = (tokenAddress: PublicKey) =>
  createSelector(accounts, tokensAccounts => {
    if (!tokensAccounts[tokenAddress.toString()]) {
      return { balance: new BN(0), decimals: 9 }
    }
    return {
      balance: tokensAccounts[tokenAddress.toString()].balance,
      decimals: tokensAccounts[tokenAddress.toString()].decimals
    }
  })
export const tokenAccount = (tokenAddress: PublicKey) =>
  createSelector(accounts, tokensAccounts => {
    if (tokensAccounts[tokenAddress.toString()]) {
      return tokensAccounts[tokenAddress.toString()]
    }
  })

export const tokenAccountsAddress = () =>
  createSelector(accounts, tokenAccounts => {
    return Object.values(tokenAccounts).map(item => {
      return item.address
    })
  })

export interface SwapToken {
  balance: BN
  decimals: number
  symbol: string
  assetAddress: PublicKey
  name: string
  logoURI: string
  isUnknown?: boolean
  coingeckoId?: string
}

export const swapTokens = createSelector(
  accounts,
  tokens,
  balance,
  network,
  (allAccounts, tokens, ethBalance, networkType) => {
    const ethEstimatedBalance =
      networkType === NetworkType.Mainnet
        ? ethBalance
        : ethBalance.gt(WETH_MIN_DEPOSIT_SWAP_FROM_AMOUNT)
          ? ethBalance.sub(WETH_MIN_DEPOSIT_SWAP_FROM_AMOUNT)
          : new BN(0)

    return Object.values(tokens).map(token => ({
      ...token,
      assetAddress: token.address,
      balance:
        token.address.toString() === WRAPPED_ETH_ADDRESS
          ? ethEstimatedBalance
          : allAccounts[token.address.toString()]?.balance ?? new BN(0)
    }))
  }
)

export const poolTokens = createSelector(
  accounts,
  tokens,
  balance,
  network,
  (allAccounts, tokens, ethBalance, networkType) => {
    const ethEstimatedBalance =
      networkType === NetworkType.Mainnet
        ? ethBalance
        : ethBalance.gt(WETH_POSITION_INIT_LAMPORTS)
          ? ethBalance.sub(WETH_POSITION_INIT_LAMPORTS)
          : new BN(0)

    return Object.values(tokens).map(token => ({
      ...token,
      assetAddress: token.address,
      balance:
        token.address.toString() === WRAPPED_ETH_ADDRESS
          ? ethEstimatedBalance
          : allAccounts[token.address.toString()]?.balance ?? new BN(0)
    }))
  }
)

export const swapTokensDict = createSelector(
  accounts,
  tokens,
  balance,
  (allAccounts, tokens, ethBalance) => {
    const swapTokens: Record<string, SwapToken> = {}

    Object.entries(tokens).forEach(([key, val]) => {
      swapTokens[key] = {
        ...val,
        assetAddress: val.address,
        balance:
          val.address.toString() === WRAPPED_ETH_ADDRESS
            ? ethBalance
            : allAccounts[val.address.toString()]?.balance ?? new BN(0)
      }
    })

    return swapTokens
  }
)

// export const canCreateNewPool = (network: NetworkType) =>
//   createSelector(balance, ethBalance => {
//     switch (network) {
//       case NetworkType.Devnet:
//         return ethBalance.gte(WETH_POOL_INIT_LAMPORTS)
//       case NetworkType.Testnet:
//         return ethBalance.gte(WETH_POOL_INIT_LAMPORTS_TEST)
//       case NetworkType.Mainnet:
//         return ethBalance.gte(WETH_POOL_INIT_LAMPORTS)
//       default:
//         return ethBalance.gte(WETH_POOL_INIT_LAMPORTS)
//     }
//   })
// export const canCreateNewPosition = (network: NetworkType) =>
//   createSelector(balance, ethBalance => {
//     switch (network) {
//       case NetworkType.Devnet:
//         return ethBalance.gte(WETH_POOL_INIT_LAMPORTS)
//       case NetworkType.Testnet:
//         return ethBalance.gte(WETH_POOL_INIT_LAMPORTS_TEST)
//       case NetworkType.Mainnet:
//         return ethBalance.gte(WETH_POOL_INIT_LAMPORTS)
//       default:
//         return ethBalance.gte(WETH_POOL_INIT_LAMPORTS)
//     }
//   })

export type TokenAccounts = ITokenAccount & {
  symbol: string
  usdValue: BN
  assetDecimals: number
}

export const solanaWalletSelectors = {
  address,
  balance,
  accounts,
  status,
  tokenAccount,
  balanceLoading,
  thankYouModalShown
}
export default solanaWalletSelectors
