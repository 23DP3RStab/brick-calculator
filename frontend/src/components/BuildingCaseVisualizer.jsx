import React from 'react';

const BuildingCaseVisualizer = ({ data }) => {
  const { 
    sienasPlatumsMm, sienasAugstumsMm, 
    blokaAugstumsMm, blokaGarumsMm, blokaPlatumsMm, 
    blokaSuvesNobideMm 
  } = data;

  if (!sienasPlatumsMm || !sienasAugstumsMm) return null;

  const rows = [];
  const numRows = Math.ceil(sienasAugstumsMm / blokaAugstumsMm);

  for (let r = 0; r < numRows; r++) {
    const yPos = sienasAugstumsMm - (r + 1) * blokaAugstumsMm;
    const rowBlocks = [];
    let xPos = 0;

    if (r === 0) {
      rowBlocks.push({ x: 0, y: yPos, w: blokaPlatumsMm, h: blokaAugstumsMm });
      xPos = blokaPlatumsMm;
      const stopAt = sienasPlatumsMm - blokaPlatumsMm;
      while (xPos < stopAt) {
        const w = Math.min(blokaGarumsMm, stopAt - xPos);
        rowBlocks.push({ x: xPos, y: yPos, w: w, h: blokaAugstumsMm });
        xPos += w;
      }
      if (xPos < sienasPlatumsMm) {
        rowBlocks.push({ x: xPos, y: yPos, w: sienasPlatumsMm - xPos, h: blokaAugstumsMm });
      }
    } 
    else if (r % 2 === 0) {
      const startWidth = Math.min(blokaSuvesNobideMm, sienasPlatumsMm);
      rowBlocks.push({ x: 0, y: yPos, w: startWidth, h: blokaAugstumsMm });
      xPos = startWidth;
      while (xPos < sienasPlatumsMm) {
        const w = Math.min(blokaGarumsMm, sienasPlatumsMm - xPos);
        rowBlocks.push({ x: xPos, y: yPos, w: w, h: blokaAugstumsMm });
        xPos += w;
      }
    } 
    else {
      while (xPos < sienasPlatumsMm) {
        const w = Math.min(blokaGarumsMm, sienasPlatumsMm - xPos);
        rowBlocks.push({ x: xPos, y: yPos, w: w, h: blokaAugstumsMm });
        xPos += w;
      }
    }
    rows.push(...rowBlocks);
  }

  const dynamicStroke = Math.max(sienasPlatumsMm / 1000, 2);

  return (
    <div style={{ border: '1px solid #000', backgroundColor: '#fff', overflow: 'hidden' }}>
      <svg 
        viewBox={`0 0 ${sienasPlatumsMm} ${sienasAugstumsMm}`} 
        width="100%" 
        height="auto"
        style={{ display: 'block' }}
      >
        {rows.map((rect, i) => (
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
      </svg>
    </div>
  );
};

export default BuildingCaseVisualizer;