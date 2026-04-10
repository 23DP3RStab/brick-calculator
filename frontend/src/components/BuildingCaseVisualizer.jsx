import React from 'react';

const BuildingCaseVisualizer = ({ data, hoveredWindowIndex }) => {
  const {
    sienasPlatumsMm, sienasAugstumsMm, blokaAugstumsMm,
    blokaGarumsMm, blokaPlatumsMm, blokaSuvesNobideMm, windows = []
  } = data;

  if (!sienasPlatumsMm || !sienasAugstumsMm) return null;

  const rowRects = [];
  const numRows = Math.ceil(sienasAugstumsMm / blokaAugstumsMm);

  for (let r = 0; r < numRows; r++) {
    const yPos = sienasAugstumsMm - (r + 1) * blokaAugstumsMm;
    let xPos = 0;

    if (r === 0) {
      rowRects.push({ x: 0, y: yPos, w: blokaPlatumsMm, h: blokaAugstumsMm });
      xPos = blokaPlatumsMm;
      const stopAt = sienasPlatumsMm - blokaPlatumsMm;
      while (xPos < stopAt) {
        const w = Math.min(blokaGarumsMm, stopAt - xPos);
        rowRects.push({ x: xPos, y: yPos, w: w, h: blokaAugstumsMm });
        xPos += w;
      }
      if (xPos < sienasPlatumsMm) {
        rowRects.push({ x: xPos, y: yPos, w: sienasPlatumsMm - xPos, h: blokaAugstumsMm });
      }
    } 
    else if (r % 2 === 0) {
      const startWidth = Math.min(blokaSuvesNobideMm, sienasPlatumsMm);
      rowRects.push({ x: 0, y: yPos, w: startWidth, h: blokaAugstumsMm });
      xPos = startWidth;
      while (xPos < sienasPlatumsMm) {
        const w = Math.min(blokaGarumsMm, sienasPlatumsMm - xPos);
        rowRects.push({ x: xPos, y: yPos, w: w, h: blokaAugstumsMm });
        xPos += w;
      }
    } 
    else {
      while (xPos < sienasPlatumsMm) {
        const w = Math.min(blokaGarumsMm, sienasPlatumsMm - xPos);
        rowRects.push({ x: xPos, y: yPos, w: w, h: blokaAugstumsMm });
        xPos += w;
      }
    }
  }

  const dynamicStroke = Math.max(sienasPlatumsMm / 1200, 1.5);

  return (
    <div style={{ border: '1px solid #000', backgroundColor: '#fff', overflow: 'hidden' }}>
      <svg viewBox={`0 0 ${sienasPlatumsMm} ${sienasAugstumsMm}`} width="100%" height="auto">
        <defs>
          <mask id="windowMask">
            <rect width={sienasPlatumsMm} height={sienasAugstumsMm} fill="white" />
            {windows.map((w, i) => (
              <rect key={i} x={w.xMm} y={sienasAugstumsMm - w.yMm - w.heightMm} width={w.widthMm} height={w.heightMm} fill="black" />
            ))}
          </mask>
        </defs>

        <rect width={sienasPlatumsMm} height={sienasAugstumsMm} fill="#fff" />

        <g mask="url(#windowMask)">
          {rowRects.map((rect, i) => (
            <rect
              key={i}
              x={rect.x}
              y={rect.y}
              width={rect.w}
              height={rect.h}
              fill={'#d1d1d1cc'}
              stroke="#000"
              strokeWidth={dynamicStroke}
            />
          ))}
        </g>

        {windows.map((w, i) => (
          <rect 
            key={i} 
            x={w.xMm} 
            y={sienasAugstumsMm - w.yMm - w.heightMm} 
            width={w.widthMm} 
            height={w.heightMm}
            fill={hoveredWindowIndex === i ? "rgba(255, 255, 0, 0.5)" : "#add8e666"} 
            stroke={hoveredWindowIndex === i ? "red" : "#000"} 
            strokeWidth={dynamicStroke * 2}
          />
        ))}
      </svg>
    </div>
  );
};

export default BuildingCaseVisualizer;