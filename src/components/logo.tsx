import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

export function Logo({ size = 'md', showIcon = true }: LogoProps) {
  const sizes = {
    sm: { text: 'text-lg', icon: 24 },
    md: { text: 'text-xl', icon: 32 },
    lg: { text: 'text-2xl', icon: 48 },
  }

  return (
    <div className="flex items-center gap-3">
      {showIcon && (
        <Image 
          src="/logo-icon.png" 
          alt="Wedding Vendor HQ" 
          width={sizes[size].icon} 
          height={sizes[size].icon}
          className="rounded-full"
        />
      )}
      <span className={`${sizes[size].text} font-medium text-[#2C3E2D]`}>
        Wedding Vendor <span className="text-[#87A98F] font-semibold">HQ</span>
      </span>
    </div>
  )
}

export function LogoIcon({ size = 32 }: { size?: number }) {
  return (
    <Image 
      src="/logo-icon.png" 
      alt="Wedding Vendor HQ" 
      width={size} 
      height={size}
      className="rounded-full"
    />
  )
}
