'use client'

interface Props {
  min: number
  max: number
  onChange: (min: number, max: number) => void
}

const MIN_AGE = 18
const MAX_AGE = 65

export function AgeRangeSlider({ min, max, onChange }: Props) {
  const minPct = ((min - MIN_AGE) / (MAX_AGE - MIN_AGE)) * 100
  const maxPct = ((max - MIN_AGE) / (MAX_AGE - MIN_AGE)) * 100

  function handleMin(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Math.min(parseInt(e.target.value), max - 1)
    onChange(val, max)
  }

  function handleMax(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Math.max(parseInt(e.target.value), min + 1)
    onChange(min, val)
  }

  return (
    <div className="space-y-3">
      {/* Labels */}
      <div className="flex justify-between text-xs font-body text-muted">
        <span>{min}</span>
        <span>{max === MAX_AGE ? '65+' : max}</span>
      </div>

      {/* Track + thumbs */}
      <div className="relative h-5 flex items-center">
        {/* Background track */}
        <div className="absolute w-full h-1 rounded-full bg-rim" />

        {/* Active range highlight */}
        <div
          className="absolute h-1 rounded-full bg-accent"
          style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }}
        />

        {/* Min thumb input */}
        <input
          type="range"
          min={MIN_AGE}
          max={MAX_AGE}
          step={1}
          value={min}
          onChange={handleMin}
          className="absolute w-full h-1 appearance-none bg-transparent cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-accent
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-bg
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-accent
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-bg
            [&::-moz-range-thumb]:cursor-pointer"
          style={{ zIndex: min >= MAX_AGE - 2 ? 5 : 3 }}
        />

        {/* Max thumb input */}
        <input
          type="range"
          min={MIN_AGE}
          max={MAX_AGE}
          step={1}
          value={max}
          onChange={handleMax}
          className="absolute w-full h-1 appearance-none bg-transparent cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-accent
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-bg
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-accent
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-bg
            [&::-moz-range-thumb]:cursor-pointer"
          style={{ zIndex: 4 }}
        />
      </div>

      {/* Axis labels */}
      <div className="flex justify-between text-[10px] font-body text-muted/60">
        <span>18</span>
        <span>65+</span>
      </div>
    </div>
  )
}
