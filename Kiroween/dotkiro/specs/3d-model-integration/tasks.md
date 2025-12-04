# Implementation Plan

- [x] 1. Install dependencies and setup project structure


  - Install @react-three/fiber, @react-three/drei, and three packages
  - Create frontend/public/models directory
  - Copy GLB files from 3d_model to frontend/public/models
  - Verify Next.js configuration handles static assets correctly
  - _Requirements: 2.1, 2.2, 5.2_



- [ ] 2. Create Model3DViewer component with basic 3D rendering
  - Create frontend/src/components/Model3DViewer.tsx with "use client" directive
  - Implement component props interface (modelPath, className, autoRotate, enableZoom, position, scale)
  - Set up Canvas component from @react-three/fiber
  - Implement basic Scene3D internal component
  - Add Suspense boundary for loading states


  - _Requirements: 2.3, 2.4, 1.1_



- [ ] 2.1 Write property test for model rendering
  - **Property 1: Model rendering on page load**
  - **Validates: Requirements 1.1**

- [ ] 3. Implement GLB model loading and display
  - Use useGLTF hook from @react-three/drei to load GLB files


  - Create model configuration constants for PBR and shaded models
  - Implement model positioning and scaling logic


  - Add primitive mesh to render loaded model


  - Handle model disposal in cleanup function
  - _Requirements: 5.1, 5.2, 5.5_

- [ ] 3.1 Write property test for model selection
  - **Property 8: Model selection by configuration**
  - **Validates: Requirements 5.1, 5.2**



- [x] 3.2 Write property test for model switching


  - **Property 10: Model switching via props**
  - **Validates: Requirements 5.5**

- [ ] 4. Configure lighting setup with Halloween theme
  - Create HALLOWEEN_LIGHTING configuration constant
  - Add ambientLight with pumpkin orange color (#ff7518, intensity 0.4)
  - Add directionalLight with phantom purple color (#9d4edd, intensity 0.8)


  - Position directional light at [5, 5, 5]


  - Test lighting appearance with both model types
  - _Requirements: 1.2, 3.2_

- [ ] 4.1 Write property test for lighting configuration
  - **Property 2: Lighting configuration applied**
  - **Validates: Requirements 1.2, 3.2**



- [x] 5. Add interactive controls for user interaction


  - Import OrbitControls from @react-three/drei
  - Configure OrbitControls with enableZoom, enablePan, and autoRotate props
  - Set up touch gesture support for mobile devices
  - Configure rotation damping for smooth interaction
  - Test mouse drag and touch interactions
  - _Requirements: 1.3, 1.4_



- [x] 5.1 Write property test for interactive rotation


  - **Property 3: Interactive rotation enabled**
  - **Validates: Requirements 1.3**

- [ ] 6. Implement loading states and error handling
  - Create LoadingFallback component with spinner or skeleton
  - Implement Model3DErrorBoundary class component
  - Create FallbackUI component for error states


  - Add error handling for file not found, invalid GLB, and network errors
  - Test error scenarios with invalid model paths


  - _Requirements: 1.5, 5.3_



- [ ] 6.1 Write property test for error handling
  - **Property 9: Error handling for invalid paths**
  - **Validates: Requirements 5.3**

- [x] 7. Implement responsive behavior and mobile optimization


  - Configure Canvas to be responsive with percentage-based sizing
  - Add viewport size detection for mobile vs desktop
  - Set default model to shaded version on mobile devices
  - Implement canvas resize handling
  - Test on various viewport sizes (320px to 3840px width)
  - _Requirements: 1.4, 3.4_



- [ ] 7.1 Write property test for responsive sizing
  - **Property 4: Responsive canvas sizing**


  - **Validates: Requirements 3.4**

- [ ] 8. Add accessibility features
  - Add aria-hidden="true" to Model3DViewer container (decorative element)


  - Ensure component doesn't trap keyboard focus
  - Add aria-label to Canvas if semantically meaningful
  - Test keyboard navigation through landing page
  - Verify screen reader compatibility
  - _Requirements: 4.1, 4.2, 4.3, 4.4_



- [ ] 8.1 Write property test for accessibility attributes
  - **Property 5: Accessibility attributes present**
  - **Validates: Requirements 4.1**

- [ ] 8.2 Write property test for focus trap prevention
  - **Property 6: Focus trap prevention**



  - **Validates: Requirements 4.3**

- [ ] 9. Integrate Model3DViewer into landing page
  - Import Model3DViewer component in frontend/src/app/page.tsx
  - Position 3D viewer in hero section (behind or beside title)
  - Configure z-index to ensure proper layering with existing effects
  - Set appropriate dimensions and positioning (absolute or relative)
  - Choose initial model (recommend shaded for performance)
  - _Requirements: 3.1, 3.3_

- [ ] 10. Add entrance animations and visual polish
  - Wrap Model3DViewer with Framer Motion for fade-in animation
  - Coordinate animation timing with existing hero section animations
  - Configure autoRotate for subtle continuous rotation
  - Adjust camera position and field of view for optimal viewing
  - Fine-tune lighting intensity and colors to match theme
  - _Requirements: 3.2, 3.5_

- [ ] 10.1 Write property test for existing accessibility preservation
  - **Property 7: Existing accessibility preserved**
  - **Validates: Requirements 4.5**

- [ ] 10.2 Write unit tests for landing page integration
  - Test that 3D viewer doesn't break existing layout
  - Verify z-index layering is correct
  - Test that skip-to-main link still works
  - Verify all existing ARIA labels remain present
  - _Requirements: 4.5_

- [ ] 11. Performance optimization and resource cleanup
  - Implement useEffect cleanup to dispose Three.js resources
  - Add lazy loading to defer 3D model load until viewport visible
  - Optimize GLB files using glTF-Transform (if needed)
  - Add FPS monitoring for performance degradation detection
  - Test memory usage and check for leaks
  - _Requirements: 2.5_

- [ ] 12. Cross-browser and device testing
  - Test on Chrome, Firefox, Safari, and Edge
  - Test on iOS Safari (WebGL compatibility)
  - Test on Android Chrome
  - Verify WebGL support detection and fallback
  - Test on low-end mobile devices for performance
  - _Requirements: 1.4_

- [ ] 13. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
