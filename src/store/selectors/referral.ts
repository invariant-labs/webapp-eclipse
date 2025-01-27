import { AnyProps, keySelectors } from './helpers'
import { IReferralStore, referralSliceName } from '@store/reducers/referral'

const store = (s: AnyProps) => s[referralSliceName] as IReferralStore

// Basic selectors
export const { proceeding, code, codeUsed, success } = keySelectors(store, [
  'proceeding',
  'code',
  'codeUsed',
  'success'
])

export const referralSelectors = {
  proceeding,
  code,
  codeUsed,
  success
}
