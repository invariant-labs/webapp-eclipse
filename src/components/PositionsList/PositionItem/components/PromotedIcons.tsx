import PromotedPoolPopover from '@components/Modals/PromotedPoolPopover/PromotedPoolPopover'
import { BN } from '@coral-xyz/anchor'
import { Tooltip } from '@mui/material'
import icons from '@static/icons'

interface IPromotedIconProps {
  isPromoted: boolean
  isActive: boolean
  pointsPerSecond: string
  estimated24hPoints: BN
  onOpenChange: (isOpen: boolean) => void
  isOpen: boolean
  iconRef: React.RefObject<HTMLElement>
  isDesktop?: boolean
}

export const PromotedIcon: React.FC<IPromotedIconProps> = ({
  isPromoted,
  isActive,
  pointsPerSecond,
  estimated24hPoints,
  onOpenChange,
  isOpen,
  iconRef,
  isDesktop
}) => {
  if (!isPromoted || !isActive) {
    return (
      <Tooltip
        enterTouchDelay={0}
        leaveTouchDelay={Number.MAX_SAFE_INTEGER}
        onClick={e => e.stopPropagation()}
        title={
          !isActive ? (
            <p>
              This position <b>isn't</b> earning points, even though the pool is generating them.
              Your position's liquidity remains <b>inactive</b> and <b>won't</b> earn points as long
              as the current price is outside its specified price range.
            </p>
          ) : !isPromoted ? (
            <p>
              This position <b>isn't</b> earning points because it was opened on a pool that
              <b> doesn't</b> generate them.
            </p>
          ) : null
        }
        placement='top'>
        <img
          src={icons.airdropRainbow}
          alt={'Airdrop'}
          style={{
            height: '32px',
            marginRight: isDesktop ? '16px' : '0',
            opacity: 0.3,
            filter: 'grayscale(1)'
          }}
        />
      </Tooltip>
    )
  }

  return (
    <>
      <div
        onClick={e => e.stopPropagation()}
        onPointerLeave={() => onOpenChange(false)}
        onPointerEnter={() => onOpenChange(true)}>
        <img
          src={icons.airdropRainbow}
          alt={'Airdrop'}
          style={{
            height: '32px',
            marginRight: isDesktop ? '16px' : '0'
          }}
        />
      </div>
      <PromotedPoolPopover
        showEstPointsFirst
        anchorEl={iconRef.current}
        open={isOpen}
        onClose={() => onOpenChange(false)}
        headerText={
          <>
            This position is currently <b>earning points</b>
          </>
        }
        pointsLabel={'Total points distributed across the pool per 24H:'}
        estPoints={estimated24hPoints}
        points={new BN(pointsPerSecond, 'hex').muln(24).muln(60).muln(60)}
      />
    </>
  )
}
