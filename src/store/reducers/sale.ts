import { BN } from '@coral-xyz/anchor'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PublicKey } from '@solana/web3.js'
import { PayloadType } from '@store/consts/types'

export interface IUserStats {
  deposited: BN
  received: BN
  canMintNft: boolean
}

export enum NFTStatus {
  NonEligible = 'Non-eligible',
  Eligible = 'Eligible',
  Claimed = 'Claimed'
}

export interface ISaleStats {
  currentAmount: BN
  targetAmount: BN
  startTimestamp: BN
  duration: BN
  whitelistWalletLimit: BN
  minDeposit: BN
  mint: PublicKey
}

export interface ISaleStore {
  userStats: IUserStats | null
  saleStats: ISaleStats | null
  isLoadingSaleStats: boolean
  isLoadingUserStats: boolean
  isLoadingProof: boolean
  proofOfInclusion: Array<number> | undefined
  deposit: {
    inProgress: boolean
    success: boolean
  }
}

export const defaultState: ISaleStore = {
  userStats: null,
  saleStats: null,
  isLoadingSaleStats: false,
  isLoadingUserStats: false,
  isLoadingProof: false,
  proofOfInclusion: undefined,
  deposit: {
    inProgress: false,
    success: false
  }
}

export interface IDepositSale {
  amount: BN
  mint: PublicKey
  // proofOfInclusion: Array<number> | undefined
}

export const saleSliceName = 'sale'

const saleSlice = createSlice({
  name: saleSliceName,
  initialState: defaultState,
  reducers: {
    setUserStats(
      state,
      action: PayloadAction<{
        deposited: BN
        received: BN
        canMintNft: boolean
      } | null>
    ) {
      if (!action.payload) {
        state.isLoadingUserStats = false
        return state
      }
      const { deposited, received, canMintNft } = action.payload
      state.userStats = { deposited, received, canMintNft }
      state.isLoadingUserStats = false
      return state
    },
    getUserStats(state) {
      state.isLoadingUserStats = true
      return state
    },
    setSaleStats(
      state,
      action: PayloadAction<{
        saleStats: ISaleStats
      } | null>
    ) {
      if (!action.payload) {
        state.isLoadingUserStats = false
        return state
      }
      const { saleStats } = action.payload
      state.saleStats = saleStats
      state.isLoadingSaleStats = false
      return state
    },
    getSaleStats(state) {
      state.isLoadingSaleStats = true
      return state
    },
    depositSale(state, _action: PayloadAction<IDepositSale>) {
      state.deposit.inProgress = true
      return state
    },
    setDepositSuccess(state, action: PayloadAction<boolean>) {
      state.deposit.inProgress = false
      state.deposit.success = action.payload
      return state
    },
    resetUserStats(state) {
      state.userStats = null
      return state
    },
    getProof(state) {
      state.proofOfInclusion = undefined
      state.isLoadingProof = true
      return state
    },
    setProofOfInclusion(state, action: PayloadAction<Array<number> | undefined>) {
      state.proofOfInclusion = action.payload
      state.isLoadingProof = false
      return state
    },
    mintNft(state) {
      state.deposit.inProgress = true
      return state
    }
  }
})

export const actions = saleSlice.actions
export const reducer = saleSlice.reducer
export type PayloadTypes = PayloadType<typeof actions>
