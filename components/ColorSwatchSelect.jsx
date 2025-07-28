import { useState } from 'react'

const COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Red', hex: '#ff0000' },
  { name: 'Blue', hex: '#0000ff' },
  { name: 'Green', hex: '#00ff00' },
]

export default function ColorSwatchSelect({
  selectedColors,
  setSelectedColors,
}) {
  const toggleColor = (colorName) => {
    if (selectedColors.includes(colorName)) {
      setSelectedColors(selectedColors.filter((c) => c !== colorName))
    } else {
      setSelectedColors([...selectedColors, colorName])
    }
  }

  return (
    <div className='flex gap-4 my-4 flex-wrap'>
      {COLORS.map((color) => (
        <div
          key={color.name}
          className={`w-8 h-8 rounded-full cursor-pointer border-2 transition ${
            selectedColors.includes(color.name)
              ? 'ring-2 ring-black'
              : 'border-gray-300'
          }`}
          style={{ backgroundColor: color.hex }}
          onClick={() => toggleColor(color.name)}
          title={color.name}
        ></div>
      ))}
    </div>
  )
}
