import { Faq } from '@common/Faq/Faq'
import { Box, Typography } from '@mui/material'
import { colors, typography } from '@static/theme'
import useStyles from './style'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '@utils/utils'
import { sBITZ_MAIN, WETH_MAIN } from '@store/consts/static'
import { useDispatch } from 'react-redux'
import { actions } from '@store/reducers/navigation'

export const FAQSection = () => {
  const { classes } = useStyles()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()

  const faqData = [
    {
      question: 'What is sBITZ?',
      answer: (
        <Typography className={classes.typography}>
          1. What is sBITZ? sBITZ is a liquid staking token you receive when you stake BITZ. It
          represents your staked position, and the amount of BITZ backing it{' '}
          <b>automatically increases</b> as staking rewards accumulate. Instead of claiming rewards
          manually once or twice a day, Invariant introduced an <b>auto-compounding</b> mechanism
          that <b>compounds</b> staking rewards every ten seconds. This increases the base amount
          from which rewards are calculated, allowing you to achieve a significantly{' '}
          <b>higher APY</b> compared to native BITZ staking.
          <br /> <br />
          In addition, you can use sBITZ in DeFi protocols (for example, by providing liquidity) to
          earn extra yield while still continuously earning staking rewards.
          <br />
          <br />
          For more informations, check out{' '}
          <a
            href={'https://docs.invariant.app/docs/sbitz'}
            style={{ textDecoration: 'none' }}
            target='_blank'>
            docs
          </a>
        </Typography>
      )
    },
    {
      question: 'Why did Invariant create sBITZ?',
      answer: (
        <Typography className={classes.typography}>
          To solve the liquidity problem for BITZ and offer both current and future members of the
          Eclipse community more ways to earn from their capital, while also creating another
          incentive to bring <b>TVL</b> to Eclipse. Invariant has been contributing to the growth of
          DeFi on Eclipse from the very beginning, and this is another major step in that direction.
        </Typography>
      )
    },
    {
      question: 'What are the benefits of having sBITZ?',
      answer: (
        <Typography className={classes.typography}>
          For you, it’s a way to earn additional yield{' '}
          <b>(Higher APY, LP fees, Invariant Points)</b> while still earning BITZ staking rewards.
          For Eclipse DeFi, it’s a solution to the <b>liquidity problem</b> for BITZ.
        </Typography>
      )
    },
    {
      question: 'How can I get sBITZ?',
      answer: (
        <Typography className={classes.typography}>
          You can get <b>sBITZ</b> by staking your <b>BITZ</b> using the interface above.
        </Typography>
      )
    },
    {
      question: 'Do we charge any fee for sBITZ?',
      answer: (
        <Typography className={classes.typography}>
          No, Invariant doesn't charge <b>any fees</b> for minting or burning sBITZ. Using it comes
          with <b>no additional costs</b> other than standard network fees.
        </Typography>
      )
    },

    {
      question: 'What is auto compounding and how does it work?',
      answer: (
        <Typography className={classes.typography}>
          Auto Compounding is a feature that automatically reinvests your staking rewards back into
          your sBITZ balance every <b>10 seconds.</b> This increases your staked amount and boosts
          future rewards, creating a continuous compounding loop. That adds up to <b>8,640</b> times
          per day. The result is a <b>much higher APY</b> and <b>more yield</b> for you over time.
        </Typography>
      )
    },

    {
      question: 'What can I do with sBITZ?',
      answer: (
        <Typography className={classes.typography}>
          At this point, you can put your sBITZ to work by adding it to the{' '}
          <b
            style={{ cursor: 'pointer' }}
            onClick={() => {
              dispatch(actions.setNavigation({ address: location.pathname }))
              navigate(ROUTES.getNewPositionRoute(sBITZ_MAIN.symbol, WETH_MAIN.symbol, '1_00'))
            }}>
            sBITZ-ETH pool.
          </b>{' '}
          This way, on top of earning <b>staking rewards</b>, you’ll also earn <b>trading fees</b>{' '}
          and <b>Invariant Points.</b> More yield opportunities on other protocols within the
          Eclipse DeFi ecosystem should be available soon.
        </Typography>
      )
    },
    {
      question: 'How does price appreciation work for sBITZ?',
      answer: (
        <Typography className={classes.typography}>
          The value of sBITZ increases over time relative to BITZ. Instead of receiving separate
          staking rewards, one unit of sBITZ gradually becomes worth more BITZ. For example, if{' '}
          <b>1 sBITZ</b> equals <b>1 BITZ</b> at the start, it might be worth <b>1.05 BITZ</b> after
          some time. The yield <b>compounds automatically</b> and no action is required
        </Typography>
      )
    },
    {
      question: 'How can I unstake sBITZ?',
      answer: (
        <Typography className={classes.typography}>
          The same way as with staking — either through the <b>interface above</b> or by swapping{' '}
          <b>sBITZ to ETH</b>.
        </Typography>
      )
    },
    {
      question: 'Can I stake/unstake sBITZ anytime I want?',
      answer: 'Yes. There’s no lockup, vesting, or anything like that.'
    },
    {
      question: 'What are the risks of holding sBITZ',
      answer: (
        <Typography className={classes.typography}>
          The same as holding BITZ. Staking through Invariant is <b>no different</b> from staking on
          PowPow, except that you receive sBITZ in return. The staked BITZ goes to the{' '}
          <b>same PowPow reserve</b>.
        </Typography>
      )
    },
    {
      question: 'Who controls minting or burning sBITZ?',
      answer: (
        <Typography className={classes.typography}>
          Only the staking program can mint or burn sBITZ. It is fully automated and governed by the
          staking logic. There is no premint, no manual control, and no privileged wallets.
        </Typography>
      )
    },
    {
      question: 'Can the sBITZ to BITZ exchange rate ever go down?',
      answer: (
        <Typography className={classes.typography}>
          No. The sBITZ exchange rate can only <b>go up</b>. It increases continuously every few
          seconds as rewards are <b>auto-compounded</b>. It is never diluted or reduced.
        </Typography>
      )
    },
    {
      question: 'When do rewards start accumulating after I mint sBITZ?',
      answer: (
        <Typography className={classes.typography}>
          Rewards start accruing <b>immediately</b> after staking. You don’t need to wait or do
          anything else. Your sBITZ balance starts growing right away.
        </Typography>
      )
    },
    {
      question:
        'If I’m not using sBITZ in DeFi, is sBITZ still better than staking directly on PowPow?',
      answer: (
        <Typography className={classes.typography}>
          Yes. sBITZ gives you a <b>significantly higher</b> yield because it compounds rewards
          automatically every <b>10 seconds</b>. On PowPow, rewards must be claimed manually. With
          sBITZ, your staked amount grows <b>faster</b> without any extra steps.
        </Typography>
      )
    }
  ]
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 2,
        marginTop: '72px'
      }}>
      <Typography sx={{ ...typography.heading4, color: colors.invariant.text, textAlign: 'left' }}>
        Frequently Asked Questions
      </Typography>
      <Faq faqData={faqData} />
    </Box>
  )
}
