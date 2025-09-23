import React from 'react'

export const PlusIconDisabled: React.FC<React.SVGProps<SVGSVGElement>> = props => (
  <svg
    width='32'
    height='32'
    viewBox='0 0 32 32'
    aria-hidden='true'
    focusable='false'
    xmlns='http://www.w3.org/2000/svg'
    {...props}>
    <path
      fill='#3A466B'
      d='M10,0h12c5.5,0,10,4.5,10,10v12c0,5.5-4.5,10-10,10H10C4.5,32,0,27.5,0,22V10C0,4.5,4.5,0,10,0z'
    />
    <path
      fill='#A9B6BF'
      d='M16.8,8.8C16.8,8.3,16.4,8,16,8s-0.8,0.3-0.8,0.8v6.5H8.8C8.3,15.2,8,15.6,8,16s0.3,0.8,0.8,0.8h6.5v6.5
         c0,0.4,0.3,0.8,0.8,0.8s0.8-0.3,0.8-0.8v-6.5h6.5c0.4,0,0.8-0.3,0.8-0.8s-0.3-0.8-0.8-0.8h-6.5V8.8z'
    />
  </svg>
)
