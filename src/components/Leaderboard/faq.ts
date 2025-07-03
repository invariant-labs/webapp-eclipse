import FAQ1 from '@static/png/faq-1.png'
import FAQ2 from '@static/png/faq-2.png'
import FAQ3 from '@static/png/faq-3.png'
import FAQ4 from '@static/png/faq-4.png'

export const faqData = [
  {
    question: 'What is Invariant Points?',
    answer: `
        Invariant Points is a program designed to incentivize Invariant liquidity providers. 
        <br></br>
        Users can earn points that can be redeemed for future exclusive benefits.
        
        

   `
  },

  {
    question: 'What is Eclipse Ecosystem Exposure?',
    answer: `
      
      It’s a <a href="https://docs.invariant.app/docs/invariant_points/ecosystem_exposure" style="color: #2EE09A" target="_blank"><b>triple-yield opportunity</b></a> for providing liquidity on Invariant.
      In addition to earning fees and Invariant Points, users unlock exclusive benefits from other projects in the Eclipse ecosystem, which are our official partners.
      <br></br>
      The higher your position on the leaderboard, the more perks you can access. 
      <br></br>
      You can earn points in Points Systems, receive boosts, and get discounts on products from our ecosystem partners.
      
      `
  },
  {
    question: 'How do I earn points?',
    answer: `
      
      Currently, you can earn points by <a href="https://docs.invariant.app/docs/invariant_points/get_started" style="color: #2EE09A" target="_blank"><b>providing liquidity in rewarded pools.</b></a>
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
       <li><span style="color: #2EE09A; font-weight: bold;">ETH/USDC</span> (<b>0.09%</b> fee tier)</li>
        <li><span style="color: #2EE09A; font-weight: bold;">sBITZ/ETH</span> (<b>1%</b> fee tier)</li>
         <li><span style="color: #2EE09A; font-weight: bold;">BITZ/ETH</span> (<b>1%</b> fee tier)</li>
         <li><span style="color: #2EE09A; font-weight: bold;">SOL/ETH</span> (<b>0.09%</b> fee tier)</li>
         <li><span style="color: #2EE09A; font-weight: bold;">tETH/ETH</span> (<b>0.01%</b> fee tier)</li>
         <li><span style="color: #2EE09A; font-weight: bold;">SOL/USDC</span> (<b>0.09%</b> fee tier)</li>
         <li><span style="color: #2EE09A; font-weight: bold;">tUSD/USDC</span> (<b>0.01%</b> fee tier)</li>

       </ul>
      <br></br>
       
       All pools distributing points are listed in the <b><span style="color: #2EE09A;">Rewarded Pools</span></b> list.
      
      `
  },
  {
    question: 'How are points calculated?',
    answer: `
    The algorithm we have created is unique in the entire DeFi space.</br></br>
Every second, a fixed amount of points is distributed and divided among all positions. Players compete for these points by creating the most efficient positions possible.</br></br>
The algorithm takes into account factors such as the size of the position (TVL), the time it has been open, and the level of concentration (position range). A higher value in one factor can compensate for another. For example, having a higher level of concentration can allow you to accrue more points than someone with a higher TVL.</br></br>

    In short: </br> <b>
    
   <ul>
    <li><span style="color: #2EE09A; font-weight: bold;">The larger the position, the more points you earn.</span></li>
    <li><span style="color: #2EE09A; font-weight: bold;">The narrower the range of the position (higher concentration), the more points you earn.</span></li>
    <li><span style="color: #2EE09A; font-weight: bold;">The longer the position remains active, the more points you accumulate.</span></li>
    <li><span style="color: #2EE09A; font-weight: bold;">The wider the position, the more consistent your point earnings become.</span></li>
  </ul>
    
    <img src="${FAQ3}"/> </br>The exact formula for calculating points is explained in detail in our <a href="https://docs.invariant.app/docs/invariant_points/mechanism" target="_blank" style="text-decoration-color: #2EE09A"><span style="color: #2EE09A" target="_blank">docs.<span></b></a>
     
  
    
    `
  },
  {
    question: 'On which blockchain can I earn points?',
    answer: '<b><span style="color: #2EE09A;">Eclipse</span></b>'
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
      Our <a href="https://docs.invariant.app/docs/invariant_points/mechanism" style="color: #2EE09A" target="_blank"><b>point distribution system</b></a> is designed in such a way as to appreciate OG users. A constant number of points is distributed every second and shared across all positions.
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
        <li>
          <b><span style="color: #EF84F5;">Position 1:</span></b> Wider range (<b><span style="color: #EF84F5;">0.9995 - 1.0005</span></b>).
        </li>
        <li>
          <b><span style="color: #2EE09A;">Position 2:</span></b> Narrow range (<b><span style="color: #2EE09A;">0.9999 - 1.0001</span></b>).
        </li>
      </ul>
      When both positions are active:
      <ul>
        <li>
          <b><span style="color: #EF84F5;">Position 1</span></b> receives only 
          <b><span style="color: #EF84F5;">⅙</span></b> (1000 points) of the distributed points due to its wider range.
        </li>
        <li>
          <b><span style="color: #2EE09A;">Position 2</span></b> receives 
          <b><span style="color: #2EE09A;">⅚</span></b> (5000 points) of the distributed points due to its narrower range (higher concentration).
        </li>
      </ul>

      </br>
      
      Where do the values ⅙ and ⅚ come from? </br>
      Earning fees depends on the width of a position, assuming the same TVL.
      <ul>
        <li>
          <b><span style="color: #EF84F5;">Position 1</span></b> spans 10 ticks 
          (<b><span style="color: #EF84F5;">0.9995 - 1.0005</span></b>).
        </li>
        <li>
          <b><span style="color: #2EE09A;">Position 2</span></b> spans 2 ticks 
          (<b><span style="color: #2EE09A;">0.9999 - 1.0001</span></b>).
        </li>
      </ul>
      </br>

      Since Position 2 is narrower, it earns 5x more because</br>
      <b>(1.0005 − 0.9995) / (1.0001 − 0.9999) = 5</span></b><br>

      The narrower the range, the greater the concentration and the higher the potential earnings.</br></br>

      <img src="${FAQ1}" /></br>

      If the price moves to <b><span style="color: #2EE09A;">1.0002</span></b>:
      <ul>
        <li>
          <b><span style="color: #EF84F5;">Position 1</span></b> becomes the sole active position and collects all distributed points (6000 points) during this time.
        </li>
        <li>
          <b><span style="color: #2EE09A;">Position 2</span></b> is no longer active (falls out of range, not collecting fee and accruing points).
        </li>
      </ul>
      <img src="${FAQ2}" />
      <br><br>
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
      You need to <a href="https://docs.invariant.app/docs/invariant_points/get_started" style="color: #2EE09A" target="_blank"><b>rebalance</b></a> your position, which means closing it, adjusting the token ratio to match the ratio required for the new position, and then reopening it within the new price range.`
  },
  {
    question: `How to contact us?`,
    answer: `You can contact us via: <b> </br> <ul><li><a href="https://discord.com/invite/w6hTeWTJvG" style="color: #2EE09A" target="_blank">Discord</a></li><li><a href="mailto:contact@invariant.app" style="color: #2EE09A">Email</a></li><li><a href="https://x.com/invariant_labs" style="color: #2EE09A" target="_blank">X</a></li></ul><p>The Terms and Conditions of the Invariant Points Program are available <a href="https://docs.invariant.app/docs/points_terms" style="color: #2EE09A" target="_blank">here.</a></p> </b>`
  }
]
