import { BN } from '@coral-xyz/anchor'

export type Direction = 'right' | 'left' | 'down' | 'up'
export type Shape = 'circle' | 'rect'
export type LabelPos = 'bottom' | 'right'

export enum CornerPosition {
  TopLeft = 'top-left',
  TopRight = 'top-right',
  BottomLeft = 'bottom-left',
  BottomRight = 'bottom-right'
}

interface BaseNodeProps {
  shape: Shape
  cornerPosition?: CornerPosition
  bigNode?: boolean
  labelPos?: LabelPos
  textA?: string
  textB?: string
}

interface BaseConnectorProps {
  direction: Direction
  longerConnector?: boolean
  withArrow?: boolean
}

export interface NodeConnectorProps extends BaseConnectorProps {
  shape: Shape
}

export interface Connector extends BaseConnectorProps {}

export interface DexInfo {
  name: string
  fee: number
  logo?: string
  link: string
}

export interface FlowNodeProps extends BaseNodeProps {
  showTriangleArrow?: boolean
  arrowDirection?: Direction
  dexInfo?: DexInfo
  connectors: Connector[]
  logoImg?: string
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

export interface GridCellProps {
  children?: React.ReactNode
  colSpan?: number
  rowSpan?: number
}

export interface CellDefinition extends BaseNodeProps, GridCellProps {
  type?: 'node'
  arrowDirection?: Direction
  showTriangleArrow?: boolean
  logoImg?: string
  dexInfo?: DexInfo
  connectors?: Connector[]
}

export interface FlowChartGridProps {
  gridDefinition: (CellDefinition | null)[][]
  cellSize?: number
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

export interface FlowChartTokenNode {
  symbol: string
  logoUrl: string
  amount: BN
}

export interface RouteTemplateProps {
  sourceToken: FlowChartTokenNode
  exchanges: Array<{
    name: string
    logoUrl: string
    fee: number
    toToken?: FlowChartTokenNode
  }>
  destinationToken: FlowChartTokenNode
}

export interface FlowChartProps {
  routeData?: RouteTemplateProps
  isLoading?: boolean
  errorMessage?: string
  showCloseButton?: boolean
  handleClose?: () => void
}

export type GridCell = CellDefinition | null
export type GridDefinition = GridCell[][]
