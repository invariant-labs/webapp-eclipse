import { Faq } from '@common/Faq/Faq'
import { Box, Typography } from '@mui/material'
import { colors, typography } from '@static/theme'


const faqData = [
    {
        question: 'What is sBITZ?',
        answer: 'sBITZ is a liquid staking token you receive when you stake BITZ. It represents your staked position and automatically grows in value as staking rewards accumulate. Instead of claiming rewards manually, the value of sBITZ increases over time relative to BITZ, making it easy to hold, trade, or use across DeFi while still earning yield.'
    },
    {
        question: 'Why did Invariant create sBITZ?',
        answer: `To solve the liquidity problem for BITZ and offer both current and future members of the Eclipse community more ways to earn from their capital, while also creating another incentive to bring TVL to Eclipse.
Invariant has been contributing to the growth of DeFi on Eclipse from the very beginning, and this is another major step in that direction.`
    },
    {
        question: 'What are the benefits of having sBITZ?',
        answer: `For you, it’s a way to earn additional yield (liquidity fees, Invariant Points) while still earning BITZ staking rewards.
For Eclipse DeFi, it’s a solution to the liquidity problem for BITZ.`
    },
    {
        question: 'How can I get sBITZ?',
        answer: 'You can get sBITZ by staking your BITZ using the interface above or simply by swapping BITZ → sBITZ.'
    },
    {
        question: 'Are there any fees on sBITZ?',
        answer: `No, Invariant doesn't charge any fees for minting or burning sBITZ. Using it comes with no additional costs other than standard network fees.`
    },

    {
        question: 'What is auto compounding and how does it work?',
        answer: `Auto Compounding is a feature that automatically reinvests your staking rewards back into your sBITZ balance every 10 seconds. This increases your staked amount and boosts future rewards, creating a continuous compounding loop.
That’s 8,640 times per day. The result is a much higher APY and more yield for you over time.`
    },

    {
        question: 'What can I do with sBITZ?',
        answer: `At this point, you can put your sBITZ to work by adding it to one of the available liquidity pools. This way, on top of earning staking rewards, you’ll also earn trading fees and Invariant Points.
More yield opportunities on other protocols within the Eclipse DeFi ecosystem should be available soon.`
    },
    {
        question: 'How does price appreciation work for sBITZ?',
        answer: `The value of sBITZ increases over time relative to BITZ. Instead of receiving separate staking rewards, one unit of sBITZ gradually becomes worth more BITZ.
For example, if 1 sBITZ equals 1 BITZ at the start, it might be worth 1.05 BITZ after some time. The yield compounds automatically and no action is required.`
    },
    { question: 'How can I unstake sBITZ?', answer: "The same way as with staking — either through the interface above or by swapping sBITZ to BITZ, or even to ETH." }

]

export const FAQSection = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2, padding: 2, marginTop: '32px' }}>
            <Typography sx={{ ...typography.heading1, color: colors.invariant.text, textAlign: 'center' }}>
                Frequently Asked Questions
            </Typography>
            <Faq faqData={faqData} />
        </Box>
    )
}
