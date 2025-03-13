import { RouteTemplateProps } from '@components/TransactionRoute/TransactionRoute'

export type Direction = 'right' | 'left' | 'down' | 'up' | 'right-down' | 'down-right'

export interface NodeConnectorProps {
  direction?: Direction
  withArrow?: boolean
  shape?: 'circle' | 'rect'
  longerConnector?: boolean
}

export interface DexInfo {
  name: string
  fee: number
  logo?: string
  link: string
}

export interface Connector {
  direction: Direction
  longerConnector?: boolean
  withArrow?: boolean
}

export interface FlowNodeProps {
  shape?: 'circle' | 'rect'
  textA?: string
  textB?: string
  dexInfo?: DexInfo
  bigNode?: boolean
  connectors: Connector[]
  logoImg?: string
  labelPos?: 'bottom' | 'right'
}

export interface GridCellProps {
  children?: React.ReactNode
  colSpan?: number
  rowSpan?: number
}

export interface CellDefinition {
  type?: 'node'
  shape?: 'circle' | 'rect'
  bigNode?: boolean
  textA?: string
  textB?: string
  logoImg?: string
  dexInfo?: DexInfo
  labelPos?: 'bottom' | 'right'
  connectors?: Connector[]
  colSpan?: number
  rowSpan?: number
}

export interface FlowChartGridProps {
  gridDefinition: (CellDefinition | null)[][]
  cellSize?: number
}

export interface FlowChartProps {
  routeData?: RouteTemplateProps
  isLoading?: boolean
  showCloseButton?: boolean
  handleClose?: () => void
}

export interface TokenInfo {
  symbol: string
  logoUrl: string
  amount: number
}

export interface ExchangeInfo {
  name: string
  logoUrl: string
  fee: number
  toToken?: TokenInfo
}

export interface RouteData {
  sourceToken: TokenInfo
  destinationToken: TokenInfo
  exchanges: ExchangeInfo[]
}

export interface TransactionRouteProps {
  hopCount: number
  routeData: RouteData
}
