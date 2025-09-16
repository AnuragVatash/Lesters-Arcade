'use client';

// Advanced Rendering System for Lester's Arcade
// This file contains comprehensive 2D and 3D rendering capabilities

export interface Vector2D {
  x: number;
  y: number;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Circle {
  x: number;
  y: number;
  radius: number;
}

export interface Line {
  start: Vector2D;
  end: Vector2D;
  width: number;
  color: Color;
}

export interface Triangle {
  p1: Vector2D;
  p2: Vector2D;
  p3: Vector2D;
  color: Color;
}

export interface Polygon {
  points: Vector2D[];
  color: Color;
  strokeColor?: Color;
  strokeWidth?: number;
}

export interface Sprite {
  id: string;
  image: HTMLImageElement;
  position: Vector2D;
  size: Vector2D;
  rotation: number;
  scale: Vector2D;
  opacity: number;
  visible: boolean;
  sourceRect?: Rectangle;
  flipX: boolean;
  flipY: boolean;
  tint: Color;
  blendMode: GlobalCompositeOperation;
  layer: number;
  zIndex: number;
}

export interface Text {
  id: string;
  text: string;
  position: Vector2D;
  font: string;
  size: number;
  color: Color;
  alignment: TextAlignment;
  baseline: TextBaseline;
  maxWidth?: number;
  visible: boolean;
  layer: number;
  zIndex: number;
  shadow?: TextShadow;
  stroke?: TextStroke;
}

export interface TextAlignment {
  horizontal: 'left' | 'center' | 'right';
  vertical: 'top' | 'middle' | 'bottom';
}

export interface TextBaseline {
  type: 'alphabetic' | 'top' | 'hanging' | 'middle' | 'ideographic' | 'bottom';
}

export interface TextShadow {
  offset: Vector2D;
  blur: number;
  color: Color;
}

export interface TextStroke {
  width: number;
  color: Color;
}

export interface Particle {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
  size: number;
  color: Color;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  scale: number;
  scaleSpeed: number;
  life: number;
  maxLife: number;
  visible: boolean;
  layer: number;
  zIndex: number;
}

export interface Light {
  id: string;
  position: Vector2D;
  color: Color;
  intensity: number;
  range: number;
  type: LightType;
  enabled: boolean;
  layer: number;
  zIndex: number;
}

export enum LightType {
  POINT = 'point',
  DIRECTIONAL = 'directional',
  SPOT = 'spot',
  AMBIENT = 'ambient'
}

export interface Camera {
  position: Vector2D;
  zoom: number;
  rotation: number;
  bounds: Rectangle;
  followTarget?: string;
  followSpeed: number;
  shake: {
    intensity: number;
    duration: number;
    timer: number;
  };
  effects: CameraEffect[];
}

export interface CameraEffect {
  type: 'fade' | 'shake' | 'zoom' | 'pan' | 'rotate';
  duration: number;
  startTime: number;
  endTime: number;
  startValue: number | Vector2D;
  endValue: number | Vector2D;
  easing: EasingFunction;
  enabled: boolean;
}

export type EasingFunction = (t: number) => number;

export interface RenderLayer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  blendMode: GlobalCompositeOperation;
  sprites: Map<string, Sprite>;
  texts: Map<string, Text>;
  particles: Map<string, Particle>;
  lights: Map<string, Light>;
  zIndex: number;
  order: number;
}

export interface RenderTarget {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
  clearColor: Color;
  enabled: boolean;
}

export interface PostProcessingEffect {
  name: string;
  enabled: boolean;
  parameters: Map<string, number>;
  apply(context: CanvasRenderingContext2D, sourceCanvas: HTMLCanvasElement, targetCanvas: HTMLCanvasElement): void;
}

export interface Renderer {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
  layers: Map<string, RenderLayer>;
  camera: Camera;
  renderTargets: Map<string, RenderTarget>;
  postProcessing: PostProcessingEffect[];
  clearColor: Color;
  enabled: boolean;
  
  init(canvas: HTMLCanvasElement): void;
  resize(width: number, height: number): void;
  clear(): void;
  render(): void;
  
  // Layer management
  createLayer(id: string, name: string, zIndex?: number): RenderLayer;
  removeLayer(id: string): void;
  getLayer(id: string): RenderLayer | undefined;
  setLayerVisible(id: string, visible: boolean): void;
  setLayerOpacity(id: string, opacity: number): void;
  setLayerBlendMode(id: string, blendMode: GlobalCompositeOperation): void;
  
  // Sprite management
  addSprite(sprite: Sprite, layerId?: string): void;
  removeSprite(id: string, layerId?: string): void;
  getSprite(id: string, layerId?: string): Sprite | undefined;
  updateSprite(id: string, updates: Partial<Sprite>, layerId?: string): void;
  
  // Text management
  addText(text: Text, layerId?: string): void;
  removeText(id: string, layerId?: string): void;
  getText(id: string, layerId?: string): Text | undefined;
  updateText(id: string, updates: Partial<Text>, layerId?: string): void;
  
  // Particle management
  addParticle(particle: Particle, layerId?: string): void;
  removeParticle(id: string, layerId?: string): void;
  getParticle(id: string, layerId?: string): Particle | undefined;
  updateParticle(id: string, updates: Partial<Particle>, layerId?: string): void;
  
  // Light management
  addLight(light: Light, layerId?: string): void;
  removeLight(id: string, layerId?: string): void;
  getLight(id: string, layerId?: string): Light | undefined;
  updateLight(id: string, updates: Partial<Light>, layerId?: string): void;
  
  // Camera management
  setCamera(camera: Camera): void;
  updateCamera(deltaTime: number): void;
  worldToScreen(worldPos: Vector2D): Vector2D;
  screenToWorld(screenPos: Vector2D): Vector2D;
  
  // Rendering primitives
  drawRectangle(rect: Rectangle, color: Color, layerId?: string): void;
  drawCircle(circle: Circle, color: Color, layerId?: string): void;
  drawLine(line: Line, layerId?: string): void;
  drawTriangle(triangle: Triangle, layerId?: string): void;
  drawPolygon(polygon: Polygon, layerId?: string): void;
  
  // Post-processing
  addPostProcessingEffect(effect: PostProcessingEffect): void;
  removePostProcessingEffect(name: string): void;
  getPostProcessingEffect(name: string): PostProcessingEffect | undefined;
  
  // Render targets
  createRenderTarget(id: string, width: number, height: number): RenderTarget;
  removeRenderTarget(id: string): void;
  getRenderTarget(id: string): RenderTarget | undefined;
  setRenderTarget(id: string): void;
  clearRenderTarget(id: string): void;
  
  // Utility functions
  setClearColor(color: Color): void;
  setBlendMode(blendMode: GlobalCompositeOperation): void;
  save(): void;
  restore(): void;
  translate(x: number, y: number): void;
  rotate(angle: number): void;
  scale(x: number, y: number): void;
  
  destroy(): void;
}

// Renderer Implementation
export class RendererImpl implements Renderer {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
  layers: Map<string, RenderLayer>;
  camera: Camera;
  renderTargets: Map<string, RenderTarget>;
  postProcessing: PostProcessingEffect[];
  clearColor: Color;
  enabled: boolean;

  private currentRenderTarget: RenderTarget | null;
  private layerOrder: string[];

  constructor() {
    this.canvas = null as unknown as HTMLCanvasElement;
    this.context = null as unknown as CanvasRenderingContext2D;
    this.width = 0;
    this.height = 0;
    this.layers = new Map();
    this.camera = {
      position: { x: 0, y: 0 },
      zoom: 1,
      rotation: 0,
      bounds: { x: 0, y: 0, width: 0, height: 0 },
      followSpeed: 1,
      shake: { intensity: 0, duration: 0, timer: 0 },
      effects: []
    };
    this.renderTargets = new Map();
    this.postProcessing = [];
    this.clearColor = { r: 0, g: 0, b: 0, a: 1 };
    this.enabled = true;
    this.currentRenderTarget = null;
    this.layerOrder = [];
  }

  init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.context = canvas.getContext('2d')!;
    this.width = canvas.width;
    this.height = canvas.height;
    this.camera.bounds = { x: 0, y: 0, width: this.width, height: this.height };
    
    // Create default layer
    this.createLayer('default', 'Default Layer', 0);
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
    this.camera.bounds = { x: 0, y: 0, width, height };
  }

  clear(): void {
    this.context.clearRect(0, 0, this.width, this.height);
    this.context.fillStyle = `rgba(${this.clearColor.r}, ${this.clearColor.g}, ${this.clearColor.b}, ${this.clearColor.a})`;
    this.context.fillRect(0, 0, this.width, this.height);
  }

  render(): void {
    if (!this.enabled) return;

    this.clear();
    this.updateCamera(0.016); // Assume 60fps

    // Sort layers by order
    const sortedLayers = Array.from(this.layers.values())
      .sort((a, b) => a.order - b.order);

    // Render each layer
    for (const layer of sortedLayers) {
      if (!layer.visible) continue;

      this.context.save();
      this.context.globalAlpha = layer.opacity;
      this.context.globalCompositeOperation = layer.blendMode;

      // Apply camera transform
      this.applyCameraTransform();

      // Render sprites
      for (const sprite of layer.sprites.values()) {
        if (sprite.visible) {
          this.renderSprite(sprite);
        }
      }

      // Render particles
      for (const particle of layer.particles.values()) {
        if (particle.visible) {
          this.renderParticle(particle);
        }
      }

      // Render lights
      for (const light of layer.lights.values()) {
        if (light.enabled) {
          this.renderLight(light);
        }
      }

      // Render texts
      for (const text of layer.texts.values()) {
        if (text.visible) {
          this.renderText(text);
        }
      }

      this.context.restore();
    }

    // Apply post-processing effects
    this.applyPostProcessing();
  }

  private applyCameraTransform(): void {
    const centerX = this.width / 2;
    const centerY = this.height / 2;

    this.context.translate(centerX, centerY);
    this.context.scale(this.camera.zoom, this.camera.zoom);
    this.context.rotate(this.camera.rotation);
    this.context.translate(-this.camera.position.x, -this.camera.position.y);

    // Apply camera shake
    if (this.camera.shake.timer > 0) {
      const shakeX = (Math.random() - 0.5) * this.camera.shake.intensity;
      const shakeY = (Math.random() - 0.5) * this.camera.shake.intensity;
      this.context.translate(shakeX, shakeY);
    }
  }

  private renderSprite(sprite: Sprite): void {
    this.context.save();
    this.context.globalAlpha = sprite.opacity;
    this.context.globalCompositeOperation = sprite.blendMode;

    this.context.translate(sprite.position.x, sprite.position.y);
    this.context.rotate(sprite.rotation);
    this.context.scale(sprite.scale.x, sprite.scale.y);

    if (sprite.flipX || sprite.flipY) {
      this.context.scale(sprite.flipX ? -1 : 1, sprite.flipY ? -1 : 1);
    }

    // Apply tint
    if (sprite.tint.a > 0) {
      this.context.globalCompositeOperation = 'multiply';
      this.context.fillStyle = `rgba(${sprite.tint.r}, ${sprite.tint.g}, ${sprite.tint.b}, ${sprite.tint.a})`;
      this.context.fillRect(-sprite.size.x / 2, -sprite.size.y / 2, sprite.size.x, sprite.size.y);
    }

    // Draw sprite
    if (sprite.sourceRect) {
      this.context.drawImage(
        sprite.image,
        sprite.sourceRect.x, sprite.sourceRect.y, sprite.sourceRect.width, sprite.sourceRect.height,
        -sprite.size.x / 2, -sprite.size.y / 2, sprite.size.x, sprite.size.y
      );
    } else {
      this.context.drawImage(
        sprite.image,
        -sprite.size.x / 2, -sprite.size.y / 2, sprite.size.x, sprite.size.y
      );
    }

    this.context.restore();
  }

  private renderParticle(particle: Particle): void {
    this.context.save();
    this.context.globalAlpha = particle.opacity;

    this.context.translate(particle.position.x, particle.position.y);
    this.context.rotate(particle.rotation);
    this.context.scale(particle.scale, particle.scale);

    this.context.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${particle.color.a})`;
    this.context.beginPath();
    this.context.arc(0, 0, particle.size, 0, Math.PI * 2);
    this.context.fill();

    this.context.restore();
  }

  private renderLight(light: Light): void {
    if (light.type === LightType.AMBIENT) return;

    this.context.save();
    this.context.globalCompositeOperation = 'screen';

    const gradient = this.context.createRadialGradient(
      light.position.x, light.position.y, 0,
      light.position.x, light.position.y, light.range
    );

    gradient.addColorStop(0, `rgba(${light.color.r}, ${light.color.g}, ${light.color.b}, ${light.intensity})`);
    gradient.addColorStop(1, `rgba(${light.color.r}, ${light.color.g}, ${light.color.b}, 0)`);

    this.context.fillStyle = gradient;
    this.context.fillRect(
      light.position.x - light.range,
      light.position.y - light.range,
      light.range * 2,
      light.range * 2
    );

    this.context.restore();
  }

  private renderText(text: Text): void {
    this.context.save();
    this.context.globalAlpha = text.color.a;

    this.context.font = `${text.size}px ${text.font}`;
    this.context.fillStyle = `rgba(${text.color.r}, ${text.color.g}, ${text.color.b}, ${text.color.a})`;
    this.context.textAlign = text.alignment.horizontal as CanvasTextAlign;
    this.context.textBaseline = text.baseline.type;

    // Apply shadow
    if (text.shadow) {
      this.context.shadowOffsetX = text.shadow.offset.x;
      this.context.shadowOffsetY = text.shadow.offset.y;
      this.context.shadowBlur = text.shadow.blur;
      this.context.shadowColor = `rgba(${text.shadow.color.r}, ${text.shadow.color.g}, ${text.shadow.color.b}, ${text.shadow.color.a})`;
    }

    // Apply stroke
    if (text.stroke) {
      this.context.strokeStyle = `rgba(${text.stroke.color.r}, ${text.stroke.color.g}, ${text.stroke.color.b}, ${text.stroke.color.a})`;
      this.context.lineWidth = text.stroke.width;
      this.context.strokeText(text.text, text.position.x, text.position.y);
    }

    this.context.fillText(text.text, text.position.x, text.position.y);

    this.context.restore();
  }

  private applyPostProcessing(): void {
    for (const effect of this.postProcessing) {
      if (effect.enabled) {
        effect.apply(this.context, this.canvas, this.canvas);
      }
    }
  }

  // Layer management
  createLayer(id: string, name: string, zIndex: number = 0): RenderLayer {
    const layer: RenderLayer = {
      id,
      name,
      visible: true,
      opacity: 1,
      blendMode: 'source-over',
      sprites: new Map(),
      texts: new Map(),
      particles: new Map(),
      lights: new Map(),
      zIndex,
      order: this.layerOrder.length
    };

    this.layers.set(id, layer);
    this.layerOrder.push(id);
    return layer;
  }

  removeLayer(id: string): void {
    this.layers.delete(id);
    const index = this.layerOrder.indexOf(id);
    if (index > -1) {
      this.layerOrder.splice(index, 1);
    }
  }

  getLayer(id: string): RenderLayer | undefined {
    return this.layers.get(id);
  }

  setLayerVisible(id: string, visible: boolean): void {
    const layer = this.layers.get(id);
    if (layer) {
      layer.visible = visible;
    }
  }

  setLayerOpacity(id: string, opacity: number): void {
    const layer = this.layers.get(id);
    if (layer) {
      layer.opacity = Math.max(0, Math.min(1, opacity));
    }
  }

  setLayerBlendMode(id: string, blendMode: GlobalCompositeOperation): void {
    const layer = this.layers.get(id);
    if (layer) {
      layer.blendMode = blendMode;
    }
  }

  // Sprite management
  addSprite(sprite: Sprite, layerId: string = 'default'): void {
    const layer = this.layers.get(layerId);
    if (layer) {
      layer.sprites.set(sprite.id, sprite);
    }
  }

  removeSprite(id: string, layerId: string = 'default'): void {
    const layer = this.layers.get(layerId);
    if (layer) {
      layer.sprites.delete(id);
    }
  }

  getSprite(id: string, layerId: string = 'default'): Sprite | undefined {
    const layer = this.layers.get(layerId);
    return layer?.sprites.get(id);
  }

  updateSprite(id: string, updates: Partial<Sprite>, layerId: string = 'default'): void {
    const sprite = this.getSprite(id, layerId);
    if (sprite) {
      Object.assign(sprite, updates);
    }
  }

  // Text management
  addText(text: Text, layerId: string = 'default'): void {
    const layer = this.layers.get(layerId);
    if (layer) {
      layer.texts.set(text.id, text);
    }
  }

  removeText(id: string, layerId: string = 'default'): void {
    const layer = this.layers.get(layerId);
    if (layer) {
      layer.texts.delete(id);
    }
  }

  getText(id: string, layerId: string = 'default'): Text | undefined {
    const layer = this.layers.get(layerId);
    return layer?.texts.get(id);
  }

  updateText(id: string, updates: Partial<Text>, layerId: string = 'default'): void {
    const text = this.getText(id, layerId);
    if (text) {
      Object.assign(text, updates);
    }
  }

  // Particle management
  addParticle(particle: Particle, layerId: string = 'default'): void {
    const layer = this.layers.get(layerId);
    if (layer) {
      layer.particles.set(particle.id, particle);
    }
  }

  removeParticle(id: string, layerId: string = 'default'): void {
    const layer = this.layers.get(layerId);
    if (layer) {
      layer.particles.delete(id);
    }
  }

  getParticle(id: string, layerId: string = 'default'): Particle | undefined {
    const layer = this.layers.get(layerId);
    return layer?.particles.get(id);
  }

  updateParticle(id: string, updates: Partial<Particle>, layerId: string = 'default'): void {
    const particle = this.getParticle(id, layerId);
    if (particle) {
      Object.assign(particle, updates);
    }
  }

  // Light management
  addLight(light: Light, layerId: string = 'default'): void {
    const layer = this.layers.get(layerId);
    if (layer) {
      layer.lights.set(light.id, light);
    }
  }

  removeLight(id: string, layerId: string = 'default'): void {
    const layer = this.layers.get(layerId);
    if (layer) {
      layer.lights.delete(id);
    }
  }

  getLight(id: string, layerId: string = 'default'): Light | undefined {
    const layer = this.layers.get(layerId);
    return layer?.lights.get(id);
  }

  updateLight(id: string, updates: Partial<Light>, layerId: string = 'default'): void {
    const light = this.getLight(id, layerId);
    if (light) {
      Object.assign(light, updates);
    }
  }

  // Camera management
  setCamera(camera: Camera): void {
    this.camera = camera;
  }

  updateCamera(deltaTime: number): void {
    // Update camera shake
    if (this.camera.shake.timer > 0) {
      this.camera.shake.timer -= deltaTime;
    }

    // Update camera effects
    this.camera.effects = this.camera.effects.filter(effect => {
      if (!effect.enabled) return false;

      const currentTime = Date.now();
      const progress = Math.min(1, (currentTime - effect.startTime) / (effect.endTime - effect.startTime));
      const easedProgress = effect.easing(progress);

      // Apply effect based on type
      switch (effect.type) {
        case 'fade': {
          // Reserved for future use (e.g., overlay alpha)
          break;
        }
        case 'shake': {
          const start = typeof effect.startValue === 'number' ? effect.startValue : 0;
          const end = typeof effect.endValue === 'number' ? effect.endValue : 0;
          this.camera.shake.intensity = start + (end - start) * easedProgress;
          break;
        }
        case 'zoom': {
          const start = typeof effect.startValue === 'number' ? effect.startValue : this.camera.zoom;
          const end = typeof effect.endValue === 'number' ? effect.endValue : this.camera.zoom;
          this.camera.zoom = start + (end - start) * easedProgress;
          break;
        }
        case 'pan': {
          const start = (effect.startValue as Vector2D) || this.camera.position;
          const end = (effect.endValue as Vector2D) || this.camera.position;
          this.camera.position.x = start.x + (end.x - start.x) * easedProgress;
          this.camera.position.y = start.y + (end.y - start.y) * easedProgress;
          break;
        }
        case 'rotate': {
          const start = typeof effect.startValue === 'number' ? effect.startValue : this.camera.rotation;
          const end = typeof effect.endValue === 'number' ? effect.endValue : this.camera.rotation;
          this.camera.rotation = start + (end - start) * easedProgress;
          break;
        }
      }

      return progress < 1;
    });
  }

  worldToScreen(worldPos: Vector2D): Vector2D {
    const centerX = this.width / 2;
    const centerY = this.height / 2;

    return {
      x: (worldPos.x - this.camera.position.x) * this.camera.zoom + centerX,
      y: (worldPos.y - this.camera.position.y) * this.camera.zoom + centerY
    };
  }

  screenToWorld(screenPos: Vector2D): Vector2D {
    const centerX = this.width / 2;
    const centerY = this.height / 2;

    return {
      x: (screenPos.x - centerX) / this.camera.zoom + this.camera.position.x,
      y: (screenPos.y - centerY) / this.camera.zoom + this.camera.position.y
    };
  }

  // Rendering primitives
  drawRectangle(rect: Rectangle, color: Color, layerId: string = 'default'): void {
    const layer = this.layers.get(layerId);
    if (!layer) return;

    this.context.save();
    this.context.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    this.context.fillRect(rect.x, rect.y, rect.width, rect.height);
    this.context.restore();
  }

  drawCircle(circle: Circle, color: Color, layerId: string = 'default'): void {
    const layer = this.layers.get(layerId);
    if (!layer) return;

    this.context.save();
    this.context.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    this.context.beginPath();
    this.context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
    this.context.fill();
    this.context.restore();
  }

  drawLine(line: Line, layerId: string = 'default'): void {
    const layer = this.layers.get(layerId);
    if (!layer) return;

    this.context.save();
    this.context.strokeStyle = `rgba(${line.color.r}, ${line.color.g}, ${line.color.b}, ${line.color.a})`;
    this.context.lineWidth = line.width;
    this.context.beginPath();
    this.context.moveTo(line.start.x, line.start.y);
    this.context.lineTo(line.end.x, line.end.y);
    this.context.stroke();
    this.context.restore();
  }

  drawTriangle(triangle: Triangle, layerId: string = 'default'): void {
    const layer = this.layers.get(layerId);
    if (!layer) return;

    this.context.save();
    this.context.fillStyle = `rgba(${triangle.color.r}, ${triangle.color.g}, ${triangle.color.b}, ${triangle.color.a})`;
    this.context.beginPath();
    this.context.moveTo(triangle.p1.x, triangle.p1.y);
    this.context.lineTo(triangle.p2.x, triangle.p2.y);
    this.context.lineTo(triangle.p3.x, triangle.p3.y);
    this.context.closePath();
    this.context.fill();
    this.context.restore();
  }

  drawPolygon(polygon: Polygon, layerId: string = 'default'): void {
    const layer = this.layers.get(layerId);
    if (!layer) return;

    this.context.save();
    this.context.fillStyle = `rgba(${polygon.color.r}, ${polygon.color.g}, ${polygon.color.b}, ${polygon.color.a})`;
    this.context.beginPath();
    this.context.moveTo(polygon.points[0].x, polygon.points[0].y);
    for (let i = 1; i < polygon.points.length; i++) {
      this.context.lineTo(polygon.points[i].x, polygon.points[i].y);
    }
    this.context.closePath();
    this.context.fill();

    if (polygon.strokeColor && polygon.strokeWidth) {
      this.context.strokeStyle = `rgba(${polygon.strokeColor.r}, ${polygon.strokeColor.g}, ${polygon.strokeColor.b}, ${polygon.strokeColor.a})`;
      this.context.lineWidth = polygon.strokeWidth;
      this.context.stroke();
    }

    this.context.restore();
  }

  // Post-processing
  addPostProcessingEffect(effect: PostProcessingEffect): void {
    this.postProcessing.push(effect);
  }

  removePostProcessingEffect(name: string): void {
    this.postProcessing = this.postProcessing.filter(effect => effect.name !== name);
  }

  getPostProcessingEffect(name: string): PostProcessingEffect | undefined {
    return this.postProcessing.find(effect => effect.name === name);
  }

  // Render targets
  createRenderTarget(id: string, width: number, height: number): RenderTarget {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d')!;

    const target: RenderTarget = {
      canvas,
      context,
      width,
      height,
      clearColor: { r: 0, g: 0, b: 0, a: 0 },
      enabled: true
    };

    this.renderTargets.set(id, target);
    return target;
  }

  removeRenderTarget(id: string): void {
    this.renderTargets.delete(id);
  }

  getRenderTarget(id: string): RenderTarget | undefined {
    return this.renderTargets.get(id);
  }

  setRenderTarget(id: string): void {
    const target = this.renderTargets.get(id);
    if (target) {
      this.currentRenderTarget = target;
    }
  }

  clearRenderTarget(id: string): void {
    const target = this.renderTargets.get(id);
    if (target) {
      target.context.clearRect(0, 0, target.width, target.height);
    }
  }

  // Utility functions
  setClearColor(color: Color): void {
    this.clearColor = color;
  }

  setBlendMode(blendMode: GlobalCompositeOperation): void {
    this.context.globalCompositeOperation = blendMode;
  }

  save(): void {
    this.context.save();
  }

  restore(): void {
    this.context.restore();
  }

  translate(x: number, y: number): void {
    this.context.translate(x, y);
  }

  rotate(angle: number): void {
    this.context.rotate(angle);
  }

  scale(x: number, y: number): void {
    this.context.scale(x, y);
  }

  destroy(): void {
    this.layers.clear();
    this.renderTargets.clear();
    this.postProcessing = [];
    this.layerOrder = [];
    this.currentRenderTarget = null;
  }
}

// Easing Functions
export const EasingFunctions = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => (--t) * t * t + 1,
  easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInSine: (t: number) => 1 - Math.cos(t * Math.PI / 2),
  easeOutSine: (t: number) => Math.sin(t * Math.PI / 2),
  easeInOutSine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
  easeInExpo: (t: number) => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
  easeOutExpo: (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  easeInOutExpo: (t: number) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2;
    return (2 - Math.pow(2, -20 * t + 10)) / 2;
  },
  easeInBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  easeOutBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeInOutBack: (t: number) => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },
  easeInElastic: (t: number) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    const c4 = (2 * Math.PI) / 3;
    return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  },
  easeOutElastic: (t: number) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    const c4 = (2 * Math.PI) / 3;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  easeInOutElastic: (t: number) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    const c5 = (2 * Math.PI) / 4.5;
    return t < 0.5
      ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
      : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
  },
  easeInBounce: (t: number) => 1 - EasingFunctions.easeOutBounce(1 - t),
  easeOutBounce: (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },
  easeInOutBounce: (t: number) => {
    return t < 0.5
      ? (1 - EasingFunctions.easeOutBounce(1 - 2 * t)) / 2
      : (1 + EasingFunctions.easeOutBounce(2 * t - 1)) / 2;
  }
};

// Export the main Renderer class
export const Renderer = RendererImpl;
export default RendererImpl;
