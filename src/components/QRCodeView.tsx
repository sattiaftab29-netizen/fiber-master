import React from 'react';
import { generateQrMatrix } from '../utils/qrCode';

interface QRCodeViewProps {
  value: string;
  size?: number;
  className?: string;
  label?: string;
}

export const QRCodeView: React.FC<QRCodeViewProps> = ({
  value,
  size = 110,
  className = '',
  label,
}) => {
  const matrix = React.useMemo(() => generateQrMatrix(value), [value]);
  const matrixSize = matrix.length;
  const cellSize = size / matrixSize;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm inline-block">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="block"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width={size} height={size} fill="#ffffff" />
          {matrix.map((row, r) =>
            row.map((filled, c) =>
              filled ? (
                <rect
                  key={`${r}-${c}`}
                  x={c * cellSize}
                  y={r * cellSize}
                  width={cellSize + 0.2}
                  height={cellSize + 0.2}
                  fill="#0f172a"
                />
              ) : null
            )
          )}
        </svg>
      </div>
      {label && (
        <span className="text-[10px] text-slate-500 font-mono mt-1 text-center font-medium tracking-tight">
          {label}
        </span>
      )}
    </div>
  );
};
