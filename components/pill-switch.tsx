'use client'

interface PillSwitchProps {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
}

/**
 * Switch tipo pill: botón con esquinas muy redondeadas, texto centrado y un knob
 * blanco que se desliza de izquierda (off) a derecha (on).
 */
export function PillSwitch({ checked, onChange, label }: PillSwitchProps) {
  const knob = 22
  const gap = 3
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="relative flex h-11 w-full items-center justify-center rounded-[20px] px-8 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      style={{
        backgroundColor: checked ? 'var(--primary)' : 'var(--border)',
        color: checked ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
      }}
    >
      <span className="pointer-events-none">{label}</span>
      <span
        aria-hidden="true"
        className="absolute rounded-full bg-white shadow-sm transition-[left] duration-200 ease-out"
        style={{
          width: knob,
          height: knob,
          top: '50%',
          transform: 'translateY(-50%)',
          left: checked ? `calc(100% - ${knob + gap}px)` : `${gap}px`,
        }}
      />
    </button>
  )
}
