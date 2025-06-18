import { PayloadAction } from '@reduxjs/toolkit'
import { actions, StakeLiquidityPayload } from '@store/reducers/sBitz'
import { all, call, select, spawn, takeLatest } from 'typed-redux-saga'
import { network, rpcAddress } from '@store/selectors/solanaConnection'
import { getWallet } from './wallet'
import { getStakingProgram } from '@utils/web3/programs/amm'
import { computeUnitsInstruction, IWallet } from '@invariant-labs/sdk-eclipse'
import { BN } from '@coral-xyz/anchor'
import { BITZ_MAIN, sBITZ_MAIN } from '@store/consts/static'
import { Transaction, TransactionInstruction } from '@solana/web3.js'

export function* handleStake(action: PayloadAction<StakeLiquidityPayload>) {
  console.log('handleStake')
  const { amount: bitzAmount } = action.payload

  const networkType = yield* select(network)
  const rpc = yield* select(rpcAddress)
  const wallet = yield* call(getWallet)
  console.log(bitzAmount.toString())
  const stakingProgram = yield* call(getStakingProgram, networkType, rpc, wallet as IWallet)
  console.log(stakingProgram)

  try {
    const setCuIx = computeUnitsInstruction(1_400_000, wallet.publicKey)

    const stakeTx = yield* call([stakingProgram, stakingProgram.stakeIx], {
      amount: bitzAmount,
      mint: BITZ_MAIN.address,
      stakedMint: sBITZ_MAIN.address,
      createStakedATA: false
    })
    console.log(stakeTx)
    const prependendIxs: TransactionInstruction[] = []
    const appendedIxs: TransactionInstruction[] = []
    // const tx = new Transaction().add(setCuIx).add(stakeTx)
  } catch (error) {}
}

export function* stakeHandler(): Generator {
  yield* takeLatest(actions.stake, handleStake)
}

export function* stakeSaga(): Generator {
  yield all([stakeHandler].map(spawn))
}
