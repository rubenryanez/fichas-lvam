# /generar-ficha

Genera la página completa de una ficha institucional LVAM.

## Uso
/generar-ficha ahorro-a-plazo
/generar-ficha "Ahorro UF"

## Flujo
1. Recibir nombre o _id del fondo como argumento
2. Buscar en src/data/FONDOS_LVAM.json
3. Determinar paleta desde campo _paleta
4. Aplicar skill generar-ficha
5. Crear src/app/fondo/[_id]/page.tsx con los 7 tabs
6. Ejecutar npm run build para verificar sin errores
7. Reportar: URL generada (/fondo/[_id]), campos null encontrados, paleta aplicada
