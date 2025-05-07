import { useState, useEffect } from 'react'

const useIsMobile = (onlyMobileDevices?: boolean) => {
  const [isMobile, setIsMobile] = useState(() => {
    const userAgent = navigator.userAgent.toLowerCase()

    if (onlyMobileDevices) {
      const isMobileUA = /android|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent)
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 1
      const isDesktopPlatform = /mac|win|linux/.test(navigator.platform.toLowerCase())

      return isMobileUA && isTouchDevice && !isDesktopPlatform
    } else {
      return /android|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent)
    }
  })

  useEffect(() => {
    if (onlyMobileDevices) return

    const handleScreenModeChange = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      setIsMobile(/android|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent))
    }

    window.addEventListener('resize', handleScreenModeChange)
    window.addEventListener('orientationchange', handleScreenModeChange)

    return () => {
      window.removeEventListener('resize', handleScreenModeChange)
      window.removeEventListener('orientationchange', handleScreenModeChange)
    }
  }, [onlyMobileDevices])

  return isMobile
}

export default useIsMobile
