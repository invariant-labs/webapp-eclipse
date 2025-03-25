import { RouteTemplateProps, GridDefinition } from '@components/TransactionRoute/TransactionRoute'
import { CornerPosition } from '../types/types'

export const generateOneHopTemplate = (data: RouteTemplateProps): GridDefinition => {
  const { sourceToken, destinationToken, exchanges } = data

  return [
    [
      {
        type: 'node',
        shape: 'circle',
        bigNode: true,
        textA: sourceToken.symbol,
        textB: sourceToken.amount,
        connectors: [{ direction: 'right' }],
        logoImg: sourceToken.logoUrl
      },
      {
        type: 'node',
        shape: 'rect',
        showTriangleArrow: true,
        cornerPosition: CornerPosition.BottomLeft,
        connectors: [{ direction: 'down' }]
      }
    ],
    [null, null],
    [
      null,
      {
        type: 'node',
        shape: 'rect',
        dexInfo: {
          logo: exchanges[0].logoUrl,
          fee: exchanges[0].fee,
          link: 'http://foo.bar',
          name: exchanges[0].name
        },
        connectors: [
          { direction: 'down', longerConnector: true },
          { direction: 'up', longerConnector: true }
        ]
      }
    ],
    [null, null],
    [
      {
        type: 'node',
        shape: 'circle',
        textA: destinationToken.symbol,
        bigNode: true,
        textB: destinationToken.amount,
        logoImg: destinationToken.logoUrl
      },
      {
        type: 'node',
        showTriangleArrow: true,
        arrowDirection: 'left',
        cornerPosition: CornerPosition.TopLeft,
        shape: 'rect',
        connectors: [{ direction: 'left', withArrow: true, longerConnector: true }]
      }
    ]
  ]
}

export const generateTwoHopTemplate = (data: RouteTemplateProps): GridDefinition => {
  const { sourceToken, destinationToken, exchanges } = data

  return [
    [
      {
        type: 'node',
        shape: 'circle',
        bigNode: true,
        textA: sourceToken.symbol,
        textB: sourceToken.amount,
        connectors: [{ direction: 'right' }],
        logoImg: sourceToken.logoUrl
      },
      {
        type: 'node',
        shape: 'rect',
        dexInfo: {
          logo: exchanges[0].logoUrl,
          fee: exchanges[0].fee,
          link: 'http://foo.bar',
          name: exchanges[0].name
        },
        connectors: [{ direction: 'down', withArrow: true, longerConnector: true }]
      }
    ],
    [null, null],
    [
      null,
      {
        type: 'node',
        shape: 'circle',
        labelPos: 'right',
        textA: exchanges[0].toToken?.symbol,
        textB: exchanges[0].toToken?.amount,
        connectors: [],
        logoImg: exchanges[0].toToken?.logoUrl
      }
    ],
    [null, null],
    [
      {
        type: 'node',
        shape: 'circle',
        bigNode: true,
        textA: destinationToken.symbol,
        textB: destinationToken.amount,
        logoImg: destinationToken.logoUrl
      },
      {
        type: 'node',
        shape: 'rect',
        dexInfo: {
          logo: exchanges[1].logoUrl,
          fee: exchanges[1].fee,
          link: 'http://foo.bar',
          name: exchanges[1].name
        },

        connectors: [
          { direction: 'left', withArrow: true },
          { direction: 'up', longerConnector: true }
        ]
      }
    ]
  ]
}

export const generateThreeHopTemplate = (data: RouteTemplateProps): GridDefinition => {
  const { sourceToken, destinationToken, exchanges } = data

  return [
    [
      {
        type: 'node',
        shape: 'circle',
        bigNode: true,
        textA: sourceToken.symbol,
        textB: sourceToken.amount,
        logoImg: sourceToken.logoUrl
      },

      {
        type: 'node',
        shape: 'rect',
        dexInfo: {
          logo: exchanges[0].logoUrl,
          fee: exchanges[0].fee,
          link: 'http://foo.bar',
          name: exchanges[0].name
        },

        connectors: [{ direction: 'down', withArrow: true }, { direction: 'left' }]
      }
    ],
    [
      null,
      {
        type: 'node',
        shape: 'circle',
        labelPos: 'right',
        textA: exchanges[0].toToken?.symbol,
        textB: exchanges[0].toToken?.amount,
        logoImg: exchanges[0].toToken?.logoUrl
      }
    ],
    [
      null,
      {
        type: 'node',
        shape: 'rect',
        dexInfo: {
          logo: exchanges[1].logoUrl,
          fee: exchanges[1].fee,
          link: 'http://foo.bar',
          name: exchanges[1].name
        },

        connectors: [{ direction: 'down', withArrow: true }, { direction: 'up' }]
      }
    ],
    [
      null,
      {
        type: 'node',
        shape: 'circle',
        labelPos: 'right',
        textA: exchanges[1].toToken?.symbol,
        textB: exchanges[1].toToken?.amount,
        logoImg: exchanges[1].toToken?.logoUrl
      }
    ],
    [
      {
        type: 'node',
        shape: 'circle',
        bigNode: true,
        textA: destinationToken.symbol,
        textB: destinationToken.amount,
        logoImg: destinationToken.logoUrl
      },
      {
        type: 'node',
        shape: 'rect',
        dexInfo: {
          logo: exchanges[2].logoUrl,
          fee: exchanges[2].fee,
          link: 'http://foo.bar',
          name: exchanges[2].name
        },

        connectors: [{ direction: 'up' }, { direction: 'left', withArrow: true }]
      }
    ]
  ]
}

export const generateFourHopTemplate = (data: RouteTemplateProps): GridDefinition => {
  const { sourceToken, destinationToken, exchanges } = data

  return [
    [
      {
        type: 'node',
        shape: 'circle',
        bigNode: true,
        textA: sourceToken.symbol,
        textB: sourceToken.amount,
        logoImg: sourceToken.logoUrl
      },
      {
        type: 'node',
        shape: 'rect',
        dexInfo: {
          logo: exchanges[0].logoUrl,
          fee: exchanges[0].fee,
          link: 'http://foo.bar',
          name: exchanges[0].name
        },

        connectors: [{ direction: 'right' }, { direction: 'left' }]
      },
      {
        type: 'node',
        shape: 'circle',
        labelPos: 'right',
        textA: exchanges[0].toToken?.symbol,
        textB: exchanges[0].toToken?.amount,
        connectors: [],
        logoImg: exchanges[0].toToken?.logoUrl
      }
    ],
    [
      null,
      null,
      {
        type: 'node',
        shape: 'rect',
        dexInfo: {
          logo: exchanges[1].logoUrl,
          fee: exchanges[1].fee,
          link: 'http://foo.bar',
          name: exchanges[1].name
        },

        connectors: [{ direction: 'up' }, { direction: 'down', withArrow: true }]
      }
    ],
    [
      null,
      null,
      {
        type: 'node',
        shape: 'circle',
        labelPos: 'right',
        textA: exchanges[1].toToken?.symbol,
        textB: exchanges[1].toToken?.amount,
        connectors: [],
        logoImg: exchanges[1].toToken?.logoUrl
      }
    ],
    [
      null,
      null,
      {
        type: 'node',
        shape: 'rect',

        dexInfo: {
          logo: exchanges[2].logoUrl,
          fee: exchanges[2].fee,
          link: 'http://foo.bar',
          name: exchanges[2].name
        },

        connectors: [{ direction: 'up' }, { direction: 'down', withArrow: true }]
      }
    ],
    [
      {
        type: 'node',
        shape: 'circle',
        bigNode: true,
        textA: destinationToken.symbol,
        textB: destinationToken.amount,
        logoImg: destinationToken.logoUrl
      },

      {
        type: 'node',
        shape: 'rect',

        dexInfo: {
          logo: exchanges[3].logoUrl,
          fee: exchanges[3].fee,
          link: 'http://foo.bar',
          name: exchanges[3].name
        },
        connectors: [{ direction: 'right' }, { direction: 'left', withArrow: true }]
      },
      {
        type: 'node',
        shape: 'circle',
        textA: exchanges[2].toToken?.symbol,
        textB: exchanges[2].toToken?.amount,
        connectors: [],
        logoImg: exchanges[2].toToken?.logoUrl
      }
    ]
  ]
}
