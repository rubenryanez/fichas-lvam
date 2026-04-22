# Sistema de Diseño — Portal LVAM

## Tipografía
- Body / labels: Nunito Sans
- Números y datos financieros: Nunito
- Títulos hero de fondo: Playfair Display

## Paletas por categoría

### verde — Renta Fija UF
--forest: #1A3D2B
--grove: #2D6A4F
--leaf: #40916C
--mint: #74C69D
--pale: #D8F3DC

### azul — Renta Fija CLP y USD
--forest: #1A3D5C
--grove: #1D4E89
--leaf: #2E86C1
--mint: #7FB3D3
--pale: #D6EAF8

### indigo — Renta Variable
--forest: #2D1A5C
--grove: #4A3080
--leaf: #7B5EA7
--mint: #A89CC8
--pale: #E8E4F3

### teal — Balanceados y Mixtos
--forest: #1A3D3D
--grove: #2D6A6A
--leaf: #40918C
--mint: #74C6C3
--pale: #D8F3F2

### gris — Money Market y Monetarios
--forest: #2C3E50
--grove: #4A5568
--leaf: #718096
--mint: #A0AEC0
--pale: #EDF2F7

### ambar — Fondos de Inversión Alternativos
--forest: #78350F
--grove: #92400E
--leaf: #B45309
--mint: #D97706
--pale: #FEF3C7

## Tokens base compartidos por todos los fondos
--ink: #111827
--steel: #374151
--mist: #6B7280
--fog: #9CA3AF
--line: #E5E7EB
--line2: #F3F4F6
--snow: #F9FAFB
--white: #FFFFFF
--red: #B91C1C
--red-bg: #FEF2F2
--amber: #B45309
--amber-bg: #FFFBEB

## Convenciones visuales
- Valores positivos: color var(--forest)
- Valores negativos: color var(--red)
- Header tabla mensual: background var(--forest), texto blanco
- Último año tabla: background var(--pale)
- Escala de riesgo: 1-7, segmentos activos en var(--grove), actual en var(--forest)
- Chips de categoría: background var(--pale), borde rgba(grove, .3), texto var(--forest)
- Cards: border 1px var(--line), border-radius 10px, box-shadow leve
- Nav activa: border-bottom 2px var(--forest), color var(--forest)
