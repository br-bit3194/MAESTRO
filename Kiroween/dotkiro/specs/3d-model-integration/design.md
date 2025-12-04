# Design Document: 3D Model Integration

## Overview

This design implements interactive 3D model visualization on the MAESTRO landing page using React Three Fiber and Three.js. The solution will load GLB format 3D models from the `3d_model` directory and render them with interactive controls, proper lighting, and responsive behavior across devices. The implementation prioritizes seamless integration with the existing Next.js architecture, Halloween theme aesthetics, and accessibility standards.

## Architecture

### Component Hierarchy

```
page.tsx (Landing Page)
├── Model3DViewer (New Component)
│   ├── Canvas (from @react-three/fiber)
│   │   ├── Scene3D (Internal Component)
│   │   │   ├── Model (GLB Loader)
│   │   │   ├── Lighting Setup
│   │   │   └── Camera Controls
│   │   └── Suspense Boundary
│   └── LoadingFallback
```

### Technology Stack

- **React Three Fiber (@react-three/fiber)**: React renderer for Three.js, providing declarative 3D scene composition
- **Three.js**: Core 3D rendering engine
- **@react-three/drei**: Helper components for common 3D patterns (OrbitControls, useGLTF, etc.)
- **Next.js 16**: Existing framework with client-side rendering support
- **Framer Motion**: For entrance animations (already in use)

### File Structure

```
frontend/
├── public/
│   └── models/              # New directory
│       ├── base_basic_pbr.glb
│       └── base_basic_shaded.glb
├── src/
│   └── components/
│       └── Model3DViewer.tsx  # New component
```

## Components and Interfaces

### Model3DViewer Component

**Purpose**: Main component that renders the 3D model with controls and loading states.

**Props Interface**:
```typescript
interface Model3DViewerProps {
  modelPath: string;           // Path to GLB file
  className?: string;          // Optional Tailwind classes
  autoRotate?: boolean;        // Enable auto-rotation
  enableZoom?: boolean;        // Enable zoom controls
  position?: [number, number, number]; // Model position [x, y, z]
  scale?: number;              // Model scale factor
}
```

**Key Features**:
- Client-side only rendering (uses "use client" directive)
- Suspense boundary for loading states
- Error boundary for graceful failure handling
- Responsive canvas sizing
- Touch and mouse interaction support

### Scene3D Internal Component

**Purpose**: Manages the 3D scene setup including model, lighting, and camera.

**Responsibilities**:
- Load GLB model using useGLTF hook
- Configure lighting (ambient + directional for Halloween mood)
- Set up OrbitControls for user interaction
- Apply Halloween-themed lighting colors

## Data Models

### Model Configuration

```typescript
type ModelType = 'pbr' | 'shaded';

interface ModelConfig {
  type: ModelType;
  path: string;
  scale: number;
  position: [number, number, number];
  rotation: [number, number, number];
}

const MODEL_CONFIGS: Record<ModelType, ModelConfig> = {
  pbr: {
    type: 'pbr',
    path: '/models/base_basic_pbr.glb',
    scale: 1.0,
    position: [0, 0, 0],
    rotation: [0, 0, 0]
  },
  shaded: {
    type: 'shaded',
    path: '/models/base_basic_shaded.glb',
    scale: 1.0,
    position: [0, 0, 0],
    rotation: [0, 0, 0]
  }
};
```

### Lighting Configuration

```typescript
interface LightingConfig {
  ambient: {
    color: string;
    intensity: number;
  };
  directional: {
    color: string;
    intensity: number;
    position: [number, number, number];
  };
  spotlight?: {
    color: string;
    intensity: number;
    position: [number, number, number];
    angle: number;
  };
}

const HALLOWEEN_LIGHTING: LightingConfig = {
  ambient: {
    color: '#ff7518',  // Pumpkin orange ambient
    intensity: 0.4
  },
  directional: {
    color: '#9d4edd',  // Phantom purple
    intensity: 0.8,
    position: [5, 5, 5]
  }
};
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Model rendering on page load

*For any* valid landing page load, the 3D viewer component should render a canvas element containing 3D scene content.

**Validates: Requirements 1.1**

### Property 2: Lighting configuration applied

*For any* rendered 3D scene, the scene should contain ambient and directional light objects with the configured Halloween-themed color values and intensity levels.

**Validates: Requirements 1.2, 3.2**

### Property 3: Interactive rotation enabled

*For any* user interaction event (mouse drag or touch gesture) on the 3D viewer, the camera position or model rotation should change in response to the input.

**Validates: Requirements 1.3**

### Property 4: Responsive canvas sizing

*For any* viewport size change, the 3D canvas dimensions should adjust to fit the container while maintaining aspect ratio.

**Validates: Requirements 3.4**

### Property 5: Accessibility attributes present

*For any* rendered 3D viewer component, the DOM should contain appropriate ARIA attributes (aria-label, aria-hidden, or role) for accessibility.

**Validates: Requirements 4.1**

### Property 6: Focus trap prevention

*For any* keyboard navigation sequence through the page, focus should not become trapped within the 3D viewer component and should continue to subsequent focusable elements.

**Validates: Requirements 4.3**

### Property 7: Existing accessibility preserved

*For any* landing page render with the 3D viewer, all existing accessibility features (skip links, ARIA labels, semantic HTML) should remain functional and present.

**Validates: Requirements 4.5**

### Property 8: Model selection by configuration

*For any* valid model type ('pbr' or 'shaded') passed as a prop, the component should load the corresponding GLB file from the correct path.

**Validates: Requirements 5.1, 5.2**

### Property 9: Error handling for invalid paths

*For any* invalid model file path, the component should catch the error, prevent crashes, and display a fallback state instead of the 3D model.

**Validates: Requirements 5.3**

### Property 10: Model switching via props

*For any* change to the model type prop, the component should unload the previous model and load the new model corresponding to the updated prop value.

**Validates: Requirements 5.5**

## Error Handling

### Model Loading Errors

**Strategy**: Implement error boundaries and try-catch blocks around GLB loading operations.

**Error Types**:
1. **File Not Found (404)**: Model file doesn't exist at specified path
2. **Invalid GLB Format**: File exists but is corrupted or not a valid GLB
3. **Network Errors**: File fails to load due to network issues
4. **WebGL Not Supported**: Browser doesn't support WebGL rendering

**Handling Approach**:
```typescript
// Error boundary component
class Model3DErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      return <FallbackUI message="Unable to load 3D model" />;
    }
    return this.props.children;
  }
}

// Fallback UI component
const FallbackUI = ({ message }) => (
  <div className="flex items-center justify-center h-full">
    <p className="text-cobweb-gray">{message}</p>
  </div>
);
```

### Resource Cleanup

**Strategy**: Use React useEffect cleanup functions to dispose of Three.js resources.

```typescript
useEffect(() => {
  // Load model
  return () => {
    // Cleanup: dispose geometries, materials, textures
    scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(m => m.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
  };
}, [modelPath]);
```

### Performance Degradation

**Strategy**: Detect low frame rates and automatically reduce quality.

**Approach**:
- Monitor FPS using requestAnimationFrame
- If FPS drops below 30 for sustained period, disable auto-rotation
- On mobile devices, use lower-quality shaded model by default
- Provide manual quality toggle for users

## Testing Strategy

### Unit Testing

**Framework**: Jest + React Testing Library

**Test Cases**:
1. **Component Rendering**: Verify Model3DViewer renders without crashing
2. **Props Handling**: Test that props are correctly passed and applied
3. **Loading States**: Verify loading indicator appears during model load
4. **Error States**: Test fallback UI appears on loading errors
5. **Accessibility**: Verify ARIA attributes are present
6. **Model Path Resolution**: Test correct paths are generated for different model types

**Example Test**:
```typescript
describe('Model3DViewer', () => {
  it('should render loading state initially', () => {
    render(<Model3DViewer modelPath="/models/test.glb" />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
  
  it('should have aria-hidden attribute when decorative', () => {
    const { container } = render(
      <Model3DViewer modelPath="/models/test.glb" />
    );
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });
});
```

### Property-Based Testing

**Framework**: fast-check (JavaScript property-based testing library)

**Configuration**: Each property test should run a minimum of 100 iterations.

**Test Properties**:

1. **Model Loading Property**: For any valid model path, the component should successfully load and render
2. **Lighting Consistency Property**: For any lighting configuration, all specified lights should be present in the scene
3. **Responsive Sizing Property**: For any viewport dimensions, the canvas should fit within its container
4. **Accessibility Property**: For any component render, required ARIA attributes should be present
5. **Error Recovery Property**: For any invalid model path, the component should render fallback UI without crashing

**Example Property Test**:
```typescript
import fc from 'fast-check';

describe('Model3DViewer Properties', () => {
  it('should handle any viewport size', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 3840 }), // width
        fc.integer({ min: 240, max: 2160 }), // height
        (width, height) => {
          // **Feature: 3d-model-integration, Property 4: Responsive canvas sizing**
          const { container } = render(
            <div style={{ width, height }}>
              <Model3DViewer modelPath="/models/test.glb" />
            </div>
          );
          const canvas = container.querySelector('canvas');
          expect(canvas.width).toBeLessThanOrEqual(width);
          expect(canvas.height).toBeLessThanOrEqual(height);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Testing

**Scope**: Test Model3DViewer integration with landing page

**Test Cases**:
1. **Page Layout**: Verify 3D model doesn't break existing layout
2. **Z-Index Layering**: Ensure model appears behind/in front of correct elements
3. **Animation Coordination**: Test that Framer Motion animations work alongside 3D rendering
4. **Performance**: Verify page load time remains acceptable with 3D model

### Visual Regression Testing

**Tool**: Playwright or Chromatic

**Test Cases**:
1. Capture screenshots of landing page with 3D model on desktop
2. Capture screenshots on mobile viewport
3. Compare against baseline to detect unintended visual changes

## Implementation Plan

### Phase 1: Setup and Dependencies

1. Install required packages:
   - `@react-three/fiber`
   - `@react-three/drei`
   - `three` (peer dependency)

2. Copy GLB files to `frontend/public/models/` directory

3. Configure Next.js to handle GLB files (if needed)

### Phase 2: Core Component Development

1. Create `Model3DViewer.tsx` component with basic structure
2. Implement GLB loading using useGLTF hook
3. Set up Canvas and Scene3D components
4. Add OrbitControls for interaction
5. Configure lighting setup

### Phase 3: Integration and Styling

1. Import Model3DViewer into landing page
2. Position component in hero section or as background element
3. Apply Tailwind styling for responsive behavior
4. Integrate with Framer Motion for entrance animations
5. Adjust z-index and positioning to fit design

### Phase 4: Error Handling and Polish

1. Implement error boundary
2. Create fallback UI component
3. Add loading indicator
4. Implement resource cleanup
5. Add performance monitoring

### Phase 5: Testing and Optimization

1. Write unit tests for component
2. Write property-based tests
3. Perform accessibility audit
4. Test on multiple devices and browsers
5. Optimize model loading (lazy loading, compression)
6. Performance profiling and optimization

## Deployment Considerations

### Asset Optimization

- **Model Compression**: Use glTF-Transform or similar tools to compress GLB files
- **Lazy Loading**: Load 3D model only when visible in viewport
- **Progressive Enhancement**: Show static image placeholder on low-end devices

### Browser Compatibility

- **WebGL Support**: Detect WebGL availability and show fallback for unsupported browsers
- **Mobile Performance**: Use shaded model on mobile by default
- **Safari Considerations**: Test thoroughly on iOS Safari (known WebGL quirks)

### Monitoring

- **Error Tracking**: Log 3D loading errors to monitoring service
- **Performance Metrics**: Track 3D render time and FPS
- **User Analytics**: Monitor interaction rates with 3D model

## Recommended Model for Production

**Recommendation**: Use `base_basic_shaded.glb` for production deployment.

**Rationale**:
- Better performance on mobile devices and lower-end hardware
- Faster loading time due to simpler materials
- Sufficient visual quality for decorative purposes
- Lower bandwidth consumption

**PBR Model Use Case**: Reserve `base_basic_pbr.glb` for high-end desktop experiences or as an optional "high quality" mode that users can enable.

## Future Enhancements

1. **Model Variants**: Support multiple 3D models that change based on time of day or user interaction
2. **Animation**: Add skeletal animations if models support them
3. **Interaction Effects**: Trigger particle effects or sounds on model interaction
4. **AR Support**: Enable AR viewing on compatible mobile devices
5. **Model Customization**: Allow users to change model colors or accessories
