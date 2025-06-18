import { PayloadAction } from '@reduxjs/toolkit'
import { actions } from '@store/reducers/sBitz'
import { all, call, select, spawn, takeLatest } from 'typed-redux-saga'
import { network, rpcAddress } from '@store/selectors/solanaConnection'
import { getWallet } from './wallet'
import { getStakingProgram } from '@utils/web3/programs/amm'
import { IWallet } from '@invariant-labs/sdk-eclipse'

export function* handleStake(_action: PayloadAction<{}>) {
  const networkType = yield* select(network)
  const rpc = yield* select(rpcAddress)
  const wallet = yield* call(getWallet)
  const stakingProgram = yield* call(getStakingProgram, networkType, rpc, wallet as IWallet)
  console.log(stakingProgram)
  // const swapTx = yield* call(
  //   [stakingProgram, stakingProgram.stakeIx],
  //   {amount: new BN(0),
  //     mint: new BN(0),
  //     stakedMint:new BN(0),

  //   }

  // )
}

export function* stakeHandler(): Generator {
  yield* takeLatest(actions.stake, handleStake)
}

export function* creatorSaga(): Generator {
  yield all([stakeHandler].map(spawn))
}
