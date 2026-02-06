interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

export function Logo({ size = 'md', showIcon = true }: LogoProps) {
  const sizes = {
    sm: { text: 'text-lg', icon: 'w-6 h-6 text-sm' },
    md: { text: 'text-2xl', icon: 'w-8 h-8 text-base' },
    lg: { text: 'text-4xl', icon: 'w-12 h-12 text-xl' },
  }

  return (
    <div className="flex items-center gap-3">
      {showIcon && (
        <div className={`${sizes[size].icon} rounded-full bg-[#87A98F] flex items-center justify-center text-white font-semibold`}>
          &
        </div>
      )}
      <span className={`${sizes[size].text} font-medium text-[#2C3E2D]`}>
        Wed <span className="text-[#87A98F] font-semibold">&</span> Gather
      </span>
    </div>
  )
}

export function LogoIcon({ size = 32 }: { size?: number }) {
  return (
    <div 
      className="rounded-full bg-[#87A98F] flex items-center justify-center text-white font-semibold"
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      &
    </div>
  )
}
