import { Accordion, AccordionSummary, AccordionDetails, Typography, alpha } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useStyles } from './styles'
import { colors, typography } from '@static/theme'
import FAQ1 from '@static/png/faq-1.png'
import FAQ2 from '@static/png/faq-2.png'
import FAQ3 from '@static/png/faq-3.png'
import FAQ4 from '@static/png/faq-4.png'

export const Faq = () => {
  const { classes } = useStyles()

  const faqData = [
    {
      question: 'What is Invariant Points?',
      answer: `
        Invariant Points is a program designed to incentivize Invariant liquidity providers. 
        <br></br>
        Users can earn points that can be redeemed for future exclusive benefits.
        
        

   `
    },
    {
      question: 'How do I earn points?',
      answer: `
      
      Currently, you can earn points by <a href="https://docs.invariant.app/docs/invariant_points/get_started" style="color: #2EE09A" target="_blank">providing liquidity in rewarded pools.</a>
      <br></br>
      The more efficient and concentrated your liquidity, the more points you’ll earn. 
      <br></br>
      In the future, we plan to introduce even more ways to earn points.
      
      `
    },
    {
      question: `Which pool should I add liquidity to?`,
      answer: `
      Pools currently distributing points: <br></br>
       <ul>
       <li>ETH/USDC (<b>0.09%</b> fee tier)</li>
       <li>SOL/ETH (<b>0.09%</b> fee tier)</li>
       <li>tETH/ETH (<b>0.01%</b> fee tier)</li>
       </ul>
      <br></br>
       
       All pools distributing points are listed in the <b>"Rewarded Pools"</b> list.
      
      `
    },
    {
      question: 'How are points calculated?',
      answer: `
    The algorithm we have created is unique in the entire DeFi space.</br></br>
Every second, a fixed amount of points is distributed and divided among all positions. Players compete for these points by creating the most efficient positions possible.</br></br>
The algorithm takes into account factors such as the size of the position (TVL), the time it has been open, and the level of concentration (position range). A higher value in one factor can compensate for another. For example, having a higher level of concentration can allow you to accrue more points than someone with a higher TVL.</br></br>

    In short: </br> <b><ul><li>The larger the position, the more points you earn.</li><li>The narrower the range of the position (higher concentration), the more points you earn.</li><li>The longer the position remains active, the more points you accumulate.</li><li>The wider the position, the more consistent your point earnings become.</li></ul>  <img src="${FAQ3}"/> </br>The exact formula for calculating points is explained in detail in our <a href="https://docs.invariant.app/docs/invariant_points/mechanism" target="_blank" style="text-decoration-color: #2EE09A"><span style="color: #2EE09A" target="_blank">docs.<span></b></a>
     
  
    
    `
    },
    {
      question: 'On which blockchain can I earn points?',
      answer: 'Eclipse'
    },
    {
      question: 'How long will points continue?',
      answer: 'Invariant Points will run through 2025, with no specific end date defined yet.'
    },
    {
      question: 'Do I get rewarded for being an early user?',
      answer: `
      Yes. 
      <br></br>
      Our <a href="https://docs.invariant.app/docs/invariant_points/mechanism" style="color: #2EE09A" target="_blank">point distribution system</a> is designed in such a way as to appreciate OG users. A constant number of points is distributed every second and shared across all positions.
      <br></br>
      As the number of positions increases, the number of points received by each one decreases, so it pays off to be early.
      <br></br>
      One dollar in a position now might be worth as much as 30 dollars in the future.`
    },
    {
      question: `If I'm not a whale, do I still have a chance at being competitive points? `,
      answer: `
        Yes.
        <br></br>
        Invariant Points is the fairest point system ever created.
        <br></br>
        That was our goal, and it’s confirmed by users who, with less than 0.5 ETH in capital, made it to the TOP 50.
        <br></br>
        Find out how you can achieve this <b> <a href="https://docs.invariant.app/docs/invariant_points/concentration" style="color: #2EE09A" target="_blank">here.</a> </b>
        <br></br>
        <img src="${FAQ4}"/>
        
       
        `
    },

    {
      question: `I don't understand how the points distribution works. Could you explain it to me?`,
      answer: `    
      Sure! Here is the explanation with a graphic example.</br></br>
      You create two positions in a <b>USDC/USDT</b> pool with a price of <b>1 USDC per USDT</b>.</br>
      (*Both positions contribute an equal amount of tokens to the pool.)
      <ul>
      <li><b>Position 1:</b> Wider range (<b>0.9995 - 1.0005</b>).</li>
      <li><b>Position 2:</b> Narrow range (<b>0.9999 - 1.0001</b>).</li>
      </ul>
      When both positions are active:
      <ul>
      <li><b>Position 1</b> receives only <b>⅙</b> (1000 points) of the distributed points due to its wider range.</li>
      <li><b>Position 2</b> receives <b>⅚</b> (5000 points) of the distributed points due to its narrower range (higher concentration).</li>
      </ul>

      </br>
      
      Where do the values ⅙ and ⅚ come from? </br>
      Earning fees depends on the width of a position, assuming the same TVL.
      <ul>
      <li><b>Position 1</b> spans 10 ticks (<b>0.9995 - 1.0005</b>).</li>
      <li><b>Position 2</b> spans 2 ticks (<b>0.9999 - 1.0001</b>)</li>
      </ul>
      </br>

      Since Position 2 is narrower, it earns 5x more because</br>
      <b> (1.0005−0.9995) / (1.0001−0.9999) = 5</b></br></br>
      The narrower the range, the greater the concentration and the higher the potential earnings.</br></br>

      <img src="${FAQ1}" /></br>

      If the price moves to <b>1.0002</b>:
      <ul>
      <li>
      <b>Position 1</b> becomes the sole active position and collects all distributed points (6000 points) during this time.
      </li>
      <li><b>Position 2</b> is no longer active (falls out of range, not collecting fee and accruing points).</li>
      </ul>
      <img src="${FAQ2}" />
      <br></br>
      Check out more details about points about <b><a href="https://docs.invariant.app/docs/invariant_points/mechanism" style="color: #2EE09A" target="_blank">point distribution system</a></b>.
    
    `
    },
    {
      question: `I'm new to providing liquidity, how can I learn how to do it correctly?`,
      answer:
        'No worries, everyone started somewhere. You can start by reading our docs about concentrated liquidity provision <b> <a href="https://docs.invariant.app/docs/tutorial/get_started" style="color: #2EE09A" target="_blank">here.</a> </b>'
    },
    {
      question: `My position is out of range and isn’t earning points. What should I do?`,
      answer: `
      It's a normal situation in concentrated liquidity. 
      <br></br>
      You need to <a href="https://docs.invariant.app/docs/invariant_points/get_started" style="color: #2EE09A" target="_blank">rebalance</a> your position, which means closing it, adjusting the token ratio to match the ratio required for the new position, and then reopening it within the new price range.`
    },
    {
      question: `How to contact us?`,
      answer: `You can contact us via: <b> </br> <ul><li><a href="https://discord.com/invite/w6hTeWTJvG" style="color: #2EE09A" target="_blank">Discord</a></li><li><a href="mailto:contact@invariant.app" style="color: #2EE09A">Email</a></li><li><a href="https://x.com/invariant_labs" style="color: #2EE09A" target="_blank">X</a></li></ul><p>The Terms and Conditions of the Invariant Points Program are available <a href="https://docs.invariant.app/docs/points_terms" style="color: #2EE09A" target="_blank">here.</a></p> </b>`
    }
  ]

  return (
    <div className={classes.container}>
      {faqData.map((item, index) => (
        <Accordion
          disableGutters
          key={index}
          sx={{
            backgroundColor: 'transparent',
            boxShadow: 'none',
            position: 'relative',
            '&:before': {
              display: 'none'
            },
            '&.Mui-expanded': {
              margin: '0px !important',
              '&::after': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: 0,
                pointerEvents: 'none',
                height: '100%',
                padding: '0px 10px',
                transiton: 'all 1s ease-in-out',
                width: '100%',
                background: `linear-gradient(to right, ${alpha(colors.invariant.light, 0.2)} , transparent)`,
                opacity: 1
              }
            },
            '&:not(:last-child)': {
              borderBottom: `1px solid ${colors.invariant.light}`
            }
          }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: colors.invariant.text }} />}
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 40px',
              alignItems: 'center',
              padding: '16px 2px',
              '& .MuiAccordionSummary-content': {
                margin: 0
              },
              '& .MuiAccordionSummary-expandIconWrapper': {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }
            }}>
            <Typography
              sx={{
                color: colors.invariant.text,
                fontSize: '16px',
                fontWeight: 500
              }}>
              {item.question}
            </Typography>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              padding: '16px'
            }}
            className={classes.item}>
            <Typography
              dangerouslySetInnerHTML={{ __html: item.answer }}
              sx={{
                color: colors.invariant.textGrey,
                ...typography.body2,
                fontWeight: 400,
                lineHeight: '20px',
                fontSize: '16px',
                opacity: 0.8
              }}
            />
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  )
}
