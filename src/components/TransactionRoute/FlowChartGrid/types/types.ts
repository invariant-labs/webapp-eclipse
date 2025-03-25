import { RouteTemplateProps } from '@components/TransactionRoute/TransactionRoute'

export type Direction = 'right' | 'left' | 'down' | 'up' | 'right-down' | 'down-right'

export interface NodeConnectorProps {
  direction?: Direction
  withArrow?: boolean
  shape?: 'circle' | 'rect' | 'corner'
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
export enum CornerPosition {
  TopLeft = 'top-left',
  TopRight = 'top-right',
  BottomLeft = 'bottom-left',
  BottomRight = 'bottom-right'
}

export interface FlowNodeProps {
  shape?: 'circle' | 'rect' | 'corner'
  showTriangleArrow?: boolean
  arrowDirection?: 'up' | 'down' | 'left' | 'right'
  textA?: string
  textB?: string
  dexInfo?: DexInfo
  cornerPosition?: CornerPosition
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
  shape?: 'circle' | 'rect' | 'corner'
  arrowDirection?: 'up' | 'down' | 'left' | 'right'
  cornerPosition?: CornerPosition
  bigNode?: boolean
  showTriangleArrow?: boolean
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
