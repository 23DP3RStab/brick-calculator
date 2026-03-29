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
      rowBlocks.push({ x: 0, y: yPos, w: blokaPlatumsMm, h: blokaAugstumsMm, type: 'edge' });
      xPos = blokaPlatumsMm;

      const middleSpace = sienasPlatumsMm - (blokaPlatumsMm * 2);
      while (xPos < sienasPlatumsMm - blokaPlatumsMm) {
        const remaining = (sienasPlatumsMm - blokaPlatumsMm) - xPos;
        const width = Math.min(blokaGarumsMm, remaining);
        rowBlocks.push({ x: xPos, y: yPos, w: width, h: blokaAugstumsMm, type: 'standard' });
        xPos += width;
      }

      rowBlocks.push({ x: sienasPlatumsMm - blokaPlatumsMm, y: yPos, w: blokaPlatumsMm, h: blokaAugstumsMm, type: 'edge' });

    } else {
      if (r % 2 !== 0) {
        const firstBlockWidth = blokaSuvesNobideMm;
        rowBlocks.push({ x: 0, y: yPos, w: firstBlockWidth, h: blokaAugstumsMm, type: 'standard' });
        xPos = firstBlockWidth;
      }

      while (xPos < sienasPlatumsMm) {
        const width = Math.min(blokaGarumsMm, sienasPlatumsMm - xPos);
        rowBlocks.push({ x: xPos, y: yPos, w: width, h: blokaAugstumsMm, type: 'standard' });
        xPos += width;
      }
    }
    rows.push(...rowBlocks);
  }

  return (
    <div style={{ marginTop: '20px', border: '1px solid #ccc', backgroundColor: '#fff' }}>
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
            // fill={rect.type === 'edge' ? '#4a90e2' : '#d1d1d1'}
            fill={'#d1d1d1'}
            stroke="#fff"
            strokeWidth={5}
          />
        ))}
      </svg>
      <div style={{ padding: '5px', fontSize: '12px', color: '#666' }}>
        * Mērogs: {sienasPlatumsMm}mm x {sienasAugstumsMm}mm
      </div>
    </div>
  );
};

export default BuildingCaseVisualizer;