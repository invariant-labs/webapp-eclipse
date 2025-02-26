import allDomains from '@static/svg/allDomains.svg'
import turboTap from '@static/svg/turboTap.svg'
import nucleus from '@static/svg/nucleus.svg'
import nightly from '@static/svg/nightlyRect.svg'
type MockedDataInterface = Array<{
  img: string
  title: string
  current?: number
  max?: number
  description?: string
  footerDescription?: string
}>

export const mockedData: MockedDataInterface[] = [
  [
    {
      img: allDomains,
      title: 'Reach TOP2000',
      current: 3454,
      max: 4000,
      description:
        'The biggest domain service on Eclipse is here! Join the TOP 2000 and earn AllDomains Points every 2 weeks!',
      footerDescription: '210 AllDomains Points every 2 weeks'
    }
  ],
  [
    {
      img: turboTap,
      title: 'Keep an open position on Invariant',
      current: 0,
      max: 1,
      description:
        'Holding a position on Invariant now gives you passive grass! Open a position on Invariant and get yours!',
      footerDescription: 'Passive Grass'
    },
    {
      img: turboTap,
      title: 'Earn 25,000 points on Invariant',
      current: 25000,
      max: 25000,
      description:
        'Earn 25,000 points on Invariant to get a permanent +10% passive grass boost on Turbo Tap!',
      footerDescription: '+10% Passive Grass permanent'
    }
  ],
  [
    {
      img: nucleus,
      title: 'Keep an open tETH position',
      current: 0,
      max: 1,
      description:
        'Every tETH provider earns Nucleus Points! Open your tETH position to start earning!',
      footerDescription: 'Nucleus Points'
    }
  ],
  [
    {
      img: nightly,
      title: 'Coming soon! 👀'
    }
  ],
  [
    {
      img: allDomains,
      title: 'Reach TOP2000',
      current: 3454,
      max: 4000,
      description:
        'The biggest domain service on Eclipse is here! Join the TOP 2000 and earn AllDomains Points every 2 weeks!',
      footerDescription: '210 AllDomains Points every 2 weeks'
    }
  ]
]
