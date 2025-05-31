import React from 'react';
import { colors } from '@static/theme';
import { Box } from '@mui/material';

interface ArcProps {
    color?: string;
    width?: number;
    height?: number;
    glowColor?: string;
    glowIntensity?: number;
}

const hexToRgb = (hex: string) => {
    const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;

    if (!/^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(cleanHex)) {
        return { r: 0.18, g: 0.88, b: 0.6 };
    }

    const r = parseInt(cleanHex.slice(0, 2), 16) / 255;
    const g = parseInt(cleanHex.slice(2, 4), 16) / 255;
    const b = parseInt(cleanHex.slice(4, 6), 16) / 255;

    return { r, g, b };
};

export const TokenomicsArc: React.FC<ArcProps> = ({
    color = colors.invariant.green,
    width = 65,
    height = 98,
    glowColor = colors.invariant.green,
}) => {
    const safeColor = color.startsWith('#') ? color : '#2EE09A';
    const safeGlowColor = glowColor.startsWith('#') ? glowColor : '#2EE09A';
    const rgb = hexToRgb(safeGlowColor);

    console.log(`Using glow color: ${safeGlowColor}, RGB: ${rgb.r}, ${rgb.g}, ${rgb.b}`);

    return (
        <Box sx={{ width, height }}>
            <svg
                width={width}
                height={height}
                viewBox="0 0 65 98"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <g filter={`url(#filter0_d_arc)`}>
                    <mask id="path-1-inside-1_arc" fill="white">
                        <path d="M16.5 81.5C25.1195 81.5 33.386 78.0759 39.481 71.981C45.5759 65.886 49 57.6195 49 49C49 40.3805 45.5759 32.114 39.481 26.019C33.386 19.9241 25.1195 16.5 16.5 16.5L16.5 29.5C21.6717 29.5 26.6316 31.5545 30.2886 35.2114C33.9455 38.8684 36 43.8283 36 49C36 54.1717 33.9455 59.1316 30.2886 62.7886C26.6316 66.4455 21.6717 68.5 16.5 68.5L16.5 81.5Z" />
                    </mask>
                    <path
                        d="M16.5 81.5C25.1195 81.5 33.386 78.0759 39.481 71.981C45.5759 65.886 49 57.6195 49 49C49 40.3805 45.5759 32.114 39.481 26.019C33.386 19.9241 25.1195 16.5 16.5 16.5L16.5 29.5C21.6717 29.5 26.6316 31.5545 30.2886 35.2114C33.9455 38.8684 36 43.8283 36 49C36 54.1717 33.9455 59.1316 30.2886 62.7886C26.6316 66.4455 21.6717 68.5 16.5 68.5L16.5 81.5Z"
                        stroke={safeColor}
                        strokeWidth="144"
                        shapeRendering="crispEdges"
                        mask="url(#path-1-inside-1_arc)"
                    />
                </g>
                <defs>
                    <filter
                        id="filter0_d_arc"
                        x="0.5"
                        y="0.5"
                        width="64.5"
                        height="97"
                        filterUnits="userSpaceOnUse"
                        colorInterpolationFilters="sRGB"
                    >
                        <feFlood floodOpacity="0" result="BackgroundImageFix" />
                        <feColorMatrix
                            in="SourceAlpha"
                            type="matrix"
                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                            result="hardAlpha"
                        />
                        <feOffset />
                        <feComposite in2="hardAlpha" operator="out" />

                        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_arc" />
                        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_arc" result="shape" />
                    </filter>
                </defs>
            </svg>
        </Box>
    );
};