import { Faq } from '@common/Faq/Faq'
import { Box, Typography } from '@mui/material'
import { colors, typography } from '@static/theme'

const faqData = [
  {
    question: 'What is sBITZ?',
    answer: (
      <Typography sx={{ zIndex: 5, position: 'relative' }}>
        sBITZ is a liquid staking token you receive when you stake BITZ. It represents your staked
        position and <b style={{ color: colors.invariant.green }}>automatically increases</b> in
        value as staking rewards accumulate. Instead of claiming rewards manually once or twice a
        day, Invariant introduced an{' '}
        <b style={{ color: colors.invariant.green }}>auto-compounding</b> mechanism that{' '}
        <b style={{ color: colors.invariant.green }}>compounds</b> staking rewards every ten
        seconds. This increases the base amount from which rewards are calculated, allowing you to
        achieve a significantly <b style={{ color: colors.invariant.green }}>higher APY </b>{' '}
        compared to traditional BITZ staking. <br /> <br /> In addition, you can use sBITZ in DeFi
        protocols (for example, by providing liquidity) to earn extra yield while still continuously
        earning staking rewards.
      </Typography>
    )
  },
  {
    question: 'Why did Invariant create sBITZ?',
    answer: (
      <Typography sx={{ zIndex: 5, position: 'relative' }}>
        To solve the liquidity problem for BITZ and offer both current and future members of the
        Eclipse community more ways to earn from their capital, while also creating another
        incentive to bring <b style={{ color: colors.invariant.green }}> TVL</b> to Eclipse.
        Invariant has been contributing to the growth of DeFi on Eclipse from the very beginning,
        and this is another major step in that direction.
      </Typography>
    )
  },
  {
    question: 'What are the benefits of having sBITZ?',
    answer: (
      <Typography sx={{ zIndex: 5, position: 'relative' }}>
        For you, it’s a way to earn additional yield{' '}
        <b style={{ color: colors.invariant.green }}>(liquidity fees, Invariant Points)</b> while
        still earning BITZ staking rewards. For Eclipse DeFi, it’s a solution to the{' '}
        <b style={{ color: colors.invariant.green }}>liquidity</b> problem for BITZ.
      </Typography>
    )
  },
  {
    question: 'How can I get sBITZ?',
    answer: (
      <Typography sx={{ zIndex: 5, position: 'relative' }}>
        You can get <b style={{ color: colors.invariant.green }}>sBITZ</b> by staking your{' '}
        <b style={{ color: colors.invariant.green }}>BITZ</b> using the interface above or simply by
        swapping <b style={{ color: colors.invariant.green }}>BITZ → sBITZ.</b>
      </Typography>
    )
  },
  {
    question: 'Are there any fees on sBITZ?',
    answer: (
      <Typography sx={{ zIndex: 5, position: 'relative' }}>
        No, Invariant doesn't charge <b style={{ color: colors.invariant.green }}>any fees</b> for
        minting or burning sBITZ. Using it comes with{' '}
        <b style={{ color: colors.invariant.green }}>no additional costs</b> other than standard
        network fees.
      </Typography>
    )
  },

  {
    question: 'What is auto compounding and how does it work?',
    answer: (
      <Typography sx={{ zIndex: 5, position: 'relative' }}>
        Auto Compounding is a feature that automatically reinvests your staking rewards back into
        your sBITZ balance every <b style={{ color: colors.invariant.green }}>10 seconds.</b> This
        increases your staked amount and boosts future rewards, creating a continuous compounding
        loop. That’s <b style={{ color: colors.invariant.green }}>8,640</b> times per day. The
        result is a much <b style={{ color: colors.invariant.green }}>higher APY</b> and{' '}
        <b style={{ color: colors.invariant.green }}>more yield</b> for you over time.
      </Typography>
    )
  },

  {
    question: 'What can I do with sBITZ?',
    answer: (
      <Typography sx={{ zIndex: 5, position: 'relative' }}>
        At this point, you can put your sBITZ to work by adding it to one of the available liquidity
        pools. This way, on top of earning
        <b style={{ color: colors.invariant.green }}> staking rewards</b>, you’ll also earn{' '}
        <b style={{ color: colors.invariant.green }}>trading fees</b> and{' '}
        <b style={{ color: colors.invariant.green }}>Invariant Points.</b> More yield opportunities
        on other protocols within the Eclipse DeFi ecosystem should be available soon.
      </Typography>
    )
  },
  {
    question: 'How does price appreciation work for sBITZ?',
    answer: (
      <Typography sx={{ zIndex: 5, position: 'relative' }}>
        The value of sBITZ increases over time relative to BITZ. Instead of receiving separate
        staking rewards, one unit of sBITZ gradually becomes worth more BITZ. For example, if{' '}
        <b style={{ color: colors.invariant.green }}>1 sBITZ</b> equals{' '}
        <b style={{ color: colors.invariant.green }}>1 BITZ</b> at the start, it might be worth{' '}
        <b style={{ color: colors.invariant.green }}>1.05 BITZ</b> after some time. The yield
        <b style={{ color: colors.invariant.green }}> compounds automatically</b> and no action is
        required.
      </Typography>
    )
  },
  {
    question: 'How can I unstake sBITZ?',
    answer: (
      <Typography sx={{ zIndex: 5, position: 'relative' }}>
        The same way as with staking — either through the{' '}
        <b style={{ color: colors.invariant.green }}>interface above</b> or by swapping{' '}
        <b style={{ color: colors.invariant.green }}>sBITZ to BITZ</b>, or even to ETH.
      </Typography>
    )
  },
  {
    question: 'Can I instantly unstake sBITZ anytime I want?',
    answer: 'Yes.'
  },
  {
    question: 'What are the risks of holding sBITZ',
    answer: (
      <Typography sx={{ zIndex: 5, position: 'relative' }}>
        The same as holding BITZ. Staking through Invariant is{' '}
        <b style={{ color: colors.invariant.green }}>no different</b> from staking on PowPow, except
        that you receive sBITZ in return. The staked BITZ goes to the same{' '}
        <b style={{ color: colors.invariant.green }}>smart contract</b> as when staking via PowPow.
      </Typography>
    )
  }
]

export const FAQSection = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 2,
        padding: 2,
        marginTop: '32px'
      }}>
      <Typography
        sx={{ ...typography.heading1, color: colors.invariant.text, textAlign: 'center' }}>
        Frequently Asked Questions
      </Typography>
      <Faq faqData={faqData} />
    </Box>
  )
}
