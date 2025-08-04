# Componente FamilyPagination

Este componente proporciona una paginación reutilizable para filtrar elementos por familia, completamente optimizado para dispositivos móviles y tablets.

## Características

- **Navegación por familias**: Botones "Anterior" y "Siguiente" para navegar entre familias
- **Vista deslizante**: Muestra un número adaptativo de familias según el dispositivo (2 en móvil, 3 en tablet, 5 en desktop)
- **Opción "Todas"**: Permite mostrar todos los elementos sin filtrar (configurable)
- **Estado disabled**: Puede deshabilitarse cuando hay operaciones en curso
- **Completamente responsive**:
  - En móviles: Muestra 2 familias, botones compactos con iconos
  - En tablets: Muestra 3 familias, tamaño intermedio
  - En desktop: Muestra 5 familias, tamaño completo
- **Scroll horizontal oculto**: Permite deslizar horizontalmente sin mostrar barra de scroll
- **Texto truncado inteligente**: Ajusta el ancho máximo del texto según el dispositivo

## Props

| Prop             | Tipo                               | Requerido | Descripción                                                  |
| ---------------- | ---------------------------------- | --------- | ------------------------------------------------------------ |
| `familyGroups`   | `string[]`                         | ✅        | Array de nombres de familias disponibles                     |
| `currentFamily`  | `string \| null`                   | ✅        | Familia actualmente seleccionada (null = todas)              |
| `onFamilyChange` | `(family: string \| null) => void` | ✅        | Callback cuando cambia la familia seleccionada               |
| `disabled`       | `boolean`                          | ❌        | Si debe deshabilitarse la navegación (default: false)        |
| `showAllOption`  | `boolean`                          | ❌        | Si mostrar opción "Todas las familias" (default: true)       |
| `allOptionText`  | `string`                           | ❌        | Texto para la opción "Todas" (default: "Todas las familias") |

## Ejemplo de uso

### Uso básico

```tsx
import FamilyPagination from "@/components/FamilyPagination";

const MiComponente = () => {
  const [currentFamily, setCurrentFamily] = useState<string | null>(null);
  const [data, setData] = useState([]); // Tus datos

  // Extraer familias únicas de tus datos
  const familyGroups = Array.from(
    new Set(data.map((item) => item.familia))
  ).sort();

  return (
    <div>
      <FamilyPagination
        familyGroups={familyGroups}
        currentFamily={currentFamily}
        onFamilyChange={setCurrentFamily}
      />

      {/* Resto de tu componente */}
    </div>
  );
};
```

### Uso sin opción "Todas"

```tsx
<FamilyPagination
  familyGroups={familyGroups}
  currentFamily={currentFamily}
  onFamilyChange={setCurrentFamily}
  showAllOption={false}
/>
```

### Uso con estado de carga

```tsx
<FamilyPagination
  familyGroups={familyGroups}
  currentFamily={currentFamily}
  onFamilyChange={setCurrentFamily}
  disabled={isLoading}
/>
```

### Uso con texto personalizado

```tsx
<FamilyPagination
  familyGroups={familyGroups}
  currentFamily={currentFamily}
  onFamilyChange={setCurrentFamily}
  allOptionText="Ver todas las categorías"
/>
```

## Integración con filtros

Para usar este componente como filtro, típicamente lo combinarías con `useEffect`:

```tsx
const [filteredData, setFilteredData] = useState([]);

useEffect(() => {
  if (data) {
    const filtered = data.filter((item) => {
      const matchesFamily = !currentFamily || item.familia === currentFamily;
      // Agregar otros filtros aquí si es necesario
      return matchesFamily;
    });
    setFilteredData(filtered);
  }
}, [data, currentFamily]);
```

## Notas importantes

1. **Orden de familias**: El componente mantiene el orden del array `familyGroups` que le pases
2. **Estado null**: `currentFamily` puede ser `null` cuando se usa `showAllOption={true}`
3. **Navegación circular**: Cuando llegas al final, no vuelve al inicio automáticamente
4. **Breakpoints responsive**:
   - `sm` (< 640px): 2 familias visibles, botones con iconos
   - `md` (640px - 1024px): 3 familias visibles, tamaño intermedio
   - `lg` (≥ 1024px): 5 familias visibles, tamaño completo
5. **Auto-detección de pantalla**: Usa `useEffect` y `addEventListener` para detectar cambios de tamaño
6. **Optimización de rendimiento**: Solo re-renderiza cuando cambia el tamaño de categoría de pantalla

## Estilos

El componente usa Tailwind CSS y mantiene consistencia con el diseño existente:

- Botones naranjas para navegación activa
- Botones grises para elementos seleccionados o deshabilitados
- Texto truncado progresivo: 60px → 80px → 120px → 150px según el dispositivo
- Espaciado adaptativo para todos los dispositivos
- Scroll horizontal sin barra visible (compatible con todos los navegadores)

## Optimizaciones móviles

- **Botones compactos**: Usa iconos ‹ › en lugar de texto completo en móviles
- **Gaps reducidos**: Menor espacio entre elementos en pantallas pequeñas
- **Padding adaptativo**: `p-2` en móvil, `p-3` en desktop
- **Overflow inteligente**: Permite scroll horizontal cuando es necesario
- **Flex layout**: Se adapta automáticamente a orientación vertical u horizontal
