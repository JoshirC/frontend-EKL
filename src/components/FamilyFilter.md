# Componente FamilyFilter

Este componente proporciona un sistema completo de filtros con buscador integrado y filtro desplegable multiselectivo para familias, completamente optimizado para dispositivos móviles y tablets.

## Características

### Buscador integrado

- **Búsqueda por código o descripción**: Campo de búsqueda principal con icono
- **Botón de limpiar**: Aparece automáticamente cuando hay texto para limpiar la búsqueda
- **Iconos intuitivos**: Icono de lupa para búsqueda y X para limpiar
- **Placeholder personalizable**: Texto de ayuda configurable

### Filtro de familias

- **Filtro multiselectivo**: Permite seleccionar múltiples familias para filtrar
- **Búsqueda interna**: Barra de búsqueda dentro del dropdown para encontrar familias específicas
- **Selección masiva**: Botones para "Seleccionar Todo" y "Limpiar" selecciones
- **Indicadores visuales**: Muestra el número de familias seleccionadas con badges

### Características generales

- **Estado disabled**: Puede deshabilitarse cuando hay operaciones en curso
- **Completamente responsive**: Funciona perfecto en móviles, tablets y desktop
- **Click fuera para cerrar**: Se cierra automáticamente al hacer click fuera del dropdown
- **Interfaz intuitiva**: Texto dinámico que se adapta según las selecciones

## Props

| Prop                | Tipo                           | Requerido | Descripción                                                                      |
| ------------------- | ------------------------------ | --------- | -------------------------------------------------------------------------------- |
| `familyGroups`      | `string[]`                     | ✅        | Array de nombres de familias disponibles                                         |
| `selectedFamilies`  | `string[]`                     | ✅        | Array de familias actualmente seleccionadas                                      |
| `onFamilyChange`    | `(families: string[]) => void` | ✅        | Callback cuando cambian las familias seleccionadas                               |
| `disabled`          | `boolean`                      | ❌        | Si debe deshabilitarse el componente (default: false)                            |
| `placeholder`       | `string`                       | ❌        | Texto placeholder para selector de familias (default: "Seleccionar familias...") |
| `searchTerm`        | `string`                       | ❌        | Valor actual del buscador principal (default: "")                                |
| `onSearchChange`    | `(term: string) => void`       | ❌        | Callback cuando cambia el término de búsqueda                                    |
| `searchPlaceholder` | `string`                       | ❌        | Placeholder del buscador (default: "Buscar por código o descripción...")         |
| `showSearch`        | `boolean`                      | ❌        | Si mostrar el buscador principal (default: true)                                 |

## Ejemplo de uso

### Uso completo (con buscador)

```tsx
import FamilyFilter from "@/components/FamilyPagination";

const MiComponente = () => {
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState([]); // Tus datos

  // Extraer familias únicas de tus datos
  const familyGroups = Array.from(
    new Set(data.map((item) => item.familia))
  ).sort();

  return (
    <div>
      <FamilyFilter
        familyGroups={familyGroups}
        selectedFamilies={selectedFamilies}
        onFamilyChange={setSelectedFamilies}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar productos por código o nombre..."
        placeholder="Filtrar por categorías..."
      />

      {/* Resto de tu componente */}
    </div>
  );
};
```

### Uso solo como filtro de familias (sin buscador)

```tsx
<FamilyFilter
  familyGroups={familyGroups}
  selectedFamilies={selectedFamilies}
  onFamilyChange={setSelectedFamilies}
  showSearch={false}
/>
```

### Uso con placeholders personalizados

```tsx
<FamilyFilter
  familyGroups={familyGroups}
  selectedFamilies={selectedFamilies}
  onFamilyChange={setSelectedFamilies}
  searchTerm={searchTerm}
  onSearchChange={setSearchTerm}
  placeholder="Elige las categorías a mostrar..."
  searchPlaceholder="Buscar por SKU o descripción..."
/>
```

### Uso con estado de carga

```tsx
<FamilyFilter
  familyGroups={familyGroups}
  selectedFamilies={selectedFamilies}
  onFamilyChange={setSelectedFamilies}
  searchTerm={searchTerm}
  onSearchChange={setSearchTerm}
  disabled={isLoading}
/>
```

## Integración con filtros

Para usar este componente como filtro, típicamente lo combinarías con `useEffect`:

```tsx
const [filteredData, setFilteredData] = useState([]);

useEffect(() => {
  if (data) {
    const filtered = data.filter((item) => {
      const matchesFamily =
        selectedFamilies.length === 0 ||
        selectedFamilies.includes(item.familia);
      // Agregar otros filtros aquí si es necesario
      return matchesFamily;
    });
    setFilteredData(filtered);
  }
}, [data, selectedFamilies]);
```

## Estados del componente

### Texto dinámico

- **Sin selecciones**: Muestra el placeholder
- **Una selección**: Muestra el nombre de la familia seleccionada
- **Múltiples selecciones**: "X familias seleccionadas"
- **Todas seleccionadas**: "Todas las familias"

### Indicadores visuales

- **Badge naranja**: Muestra el número de familias seleccionadas
- **Iconos**: Checkbox para cada familia
- **Hover effects**: Resalta las opciones al pasar el mouse

## Funcionalidades del dropdown

### Barra de búsqueda

- Filtra familias en tiempo real
- Búsqueda insensible a mayúsculas/minúsculas
- Se mantiene la selección al buscar

### Botones de acción

- **"Seleccionar Todo"**: Selecciona todas las familias disponibles
- **"Deseleccionar Todo"**: Aparece cuando todas están seleccionadas
- **"Limpiar"**: Quita todas las selecciones

### Footer informativo

- Muestra "X de Y familias seleccionadas"
- Solo aparece cuando hay selecciones

## Notas importantes

1. **Arrays inmutables**: Siempre devuelve un nuevo array en `onFamilyChange`
2. **Orden preservado**: Mantiene el orden original del array `familyGroups`
3. **Performance**: Optimizado para listas grandes de familias
4. **Accesibilidad**: Usa elementos semánticos (labels, checkboxes)
5. **Responsive**: Ancho fijo en desktop (320px), full width en móviles

## Estilos

El componente usa Tailwind CSS y mantiene consistencia con el diseño existente:

- **Colores**: Esquema naranja para elementos activos
- **Sombras**: Box shadow para el dropdown
- **Bordes**: Rounded corners y borders sutiles
- **Tipografía**: Tamaños de texto responsive
- **Z-index**: Z-50 para que el dropdown aparezca sobre otros elementos

## Compatibilidad

- ✅ **Móviles**: Funciona perfectamente con touch
- ✅ **Tablets**: Diseño optimizado para pantallas medianas
- ✅ **Desktop**: Hover states y click interactions
- ✅ **Teclado**: Navegación accesible con tab y enter
- ✅ **Screen readers**: Labels apropiados para accesibilidad
