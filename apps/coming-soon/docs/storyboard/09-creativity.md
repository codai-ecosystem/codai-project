# Chapter 9: CREATIVITY - AI Muse

## Overview
**Duration:** 60 seconds of scroll  
**Purpose:** Showcase creative AI applications and artistic intelligence  
**Emotional Journey:** Wonder → Inspiration  
**Theme Colors:** Creative Rainbow (`--creativity-*`)  
**Projects:** 8 creativity-focused projects (Art AI, Music generation, Writing, Design, etc.)

---

## Visual Concept

### Creative Studio Metaphor
- **Visual Theme:** Artist studio, digital canvas, creative tools, inspirational workspace
- **Color Palette:** Vibrant rainbow spectrum, artistic purples, creative magentas, inspiring golds
- **Iconography:** Brushes, musical notes, writing quills, design tools, palette colors
- **Motion Language:** Artistic flourishes, paint splashes, musical waves, creative sparks

### Layout Design
```
┌─────────────────────────────────────┐
│         "AI Muse"                  │
├─────────────────────────────────────┤
│    [Creative Canvas Interface]      │ ← Digital art studio aesthetic
├─────┬─────┬─────┬─────┬─────────────┤
│Art  │Music│Write│Design│             │ ← Creative applications as
│ AI  │ AI  │ AI  │ AI   │  Creative   │   artist tools on easel
├─────┼─────┼─────┼─────┤  Gallery    │
│Photo│Video│3D   │Game │  Showcase   │
│ AI  │ AI  │Model│ AI  │             │
└─────┴─────┴─────┴─────┴─────────────┘
```

### Creative Process Visualization
- **Digital Canvas:** Interactive art creation in real-time
- **Creative Tools Palette:** AI applications as artistic instruments
- **Inspiration Feed:** Live stream of AI-generated creative content
- **Collaboration Studio:** Human-AI creative partnerships

---

## Scroll Choreography

### ScrollTrigger Configuration
```javascript
ScrollTrigger.create({
  trigger: ".creativity-chapter",
  start: "top bottom",
  end: "bottom top",
  scrub: 1,
  onEnter: () => {
    activateChapterTheme('creativity');
    startCreativeStudio();
  },
  onLeave: () => {
    pauseCreativeStudio();
  },
  onUpdate: (self) => updateCreativityProgress(self.progress)
});
```

### Master Timeline
```javascript
const creativityTimeline = gsap.timeline({
  scrollTrigger: {
    trigger: ".creativity-chapter",
    start: "top center+=100",
    end: "bottom center-=100",
    scrub: 1
  }
});

// Chapter title with rainbow shimmer (0-0.1)
creativityTimeline
  .fromTo(".creativity-title", {
    y: -100,
    opacity: 0,
    backgroundPosition: "-300% 0"
  }, {
    y: 0,
    opacity: 1,
    backgroundPosition: "300% 0",
    duration: 0.1,
    ease: "power3.out"
  })
  .fromTo(".creativity-subtitle", {
    y: -50,
    opacity: 0,
    filter: "hue-rotate(0deg)"
  }, {
    y: 0,
    opacity: 1,
    filter: "hue-rotate(360deg)",
    duration: 0.08,
    ease: "power2.out"
  }, 0.03)
  .fromTo(".muse-icon", {
    scale: 0,
    rotation: -180,
    filter: "brightness(0)"
  }, {
    scale: 1,
    rotation: 0,
    filter: "brightness(1)",
    duration: 0.1,
    ease: "back.out(2)"
  }, 0.05);

// Creative canvas setup (0.1-0.3)
creativityTimeline
  .fromTo(".creative-canvas", {
    scale: 0.7,
    opacity: 0,
    rotationY: -45
  }, {
    scale: 1,
    opacity: 1,
    rotationY: 0,
    duration: 0.15,
    ease: "power3.out"
  }, 0.1)
  .fromTo(".canvas-frame", {
    strokeDasharray: function() {
      return this.getTotalLength() + " " + this.getTotalLength();
    },
    strokeDashoffset: function() {
      return this.getTotalLength();
    }
  }, {
    strokeDashoffset: 0,
    duration: 0.1,
    ease: "power2.out"
  }, 0.15)
  .fromTo(".creative-tools-palette", {
    x: -100,
    opacity: 0,
    rotationZ: -20
  }, {
    x: 0,
    opacity: 1,
    rotationZ: 0,
    duration: 0.12,
    ease: "back.out(1.7)"
  }, 0.2);

// Creative applications reveal (0.25-0.7)
const creativeApps = [
  { selector: '.creativity-art-ai', delay: 0, tool: 'paintbrush', color: '#ef4444' },
  { selector: '.creativity-music-ai', delay: 0.05, tool: 'musical-note', color: '#f97316' },
  { selector: '.creativity-writing-ai', delay: 0.1, tool: 'pen', color: '#eab308' },
  { selector: '.creativity-design-ai', delay: 0.15, tool: 'ruler', color: '#22c55e' },
  { selector: '.creativity-photo-ai', delay: 0.2, tool: 'camera', color: '#06b6d4' },
  { selector: '.creativity-video-ai', delay: 0.25, tool: 'video', color: '#3b82f6' },
  { selector: '.creativity-3d-ai', delay: 0.3, tool: '3d-cube', color: '#8b5cf6' },
  { selector: '.creativity-game-ai', delay: 0.35, tool: 'gamepad', color: '#ec4899' }
];

creativeApps.forEach((app) => {
  creativityTimeline
    .fromTo(app.selector, {
      scale: 0,
      opacity: 0,
      rotation: Math.random() * 720 - 360,
      x: (Math.random() - 0.5) * 400,
      y: (Math.random() - 0.5) * 400
    }, {
      scale: 1,
      opacity: 1,
      rotation: 0,
      x: 0,
      y: 0,
      duration: 0.2,
      ease: "back.out(2)"
    }, 0.25 + app.delay)
    .fromTo(app.selector + " .creative-aura", {
      opacity: 0,
      scale: 0,
      filter: `hue-rotate(0deg)`
    }, {
      opacity: 0.7,
      scale: 1,
      filter: `hue-rotate(${Math.random() * 360}deg)`,
      duration: 0.15,
      ease: "power2.out"
    }, 0.35 + app.delay);
});

// Live creative process (0.5-0.8)
creativityTimeline
  .fromTo(".live-creation", {
    opacity: 0,
    scale: 0.8
  }, {
    opacity: 1,
    scale: 1,
    duration: 0.2,
    ease: "power3.out"
  }, 0.5)
  .fromTo(".creation-strokes", {
    pathLength: 0,
    opacity: 0
  }, {
    pathLength: 1,
    opacity: 1,
    duration: 0.25,
    ease: "power2.inOut",
    stagger: 0.02
  }, 0.55);

// Creative gallery showcase (0.6-1.0)
creativityTimeline
  .fromTo(".creative-gallery", {
    x: 200,
    opacity: 0,
    rotationY: 30
  }, {
    x: 0,
    opacity: 1,
    rotationY: 0,
    duration: 0.3,
    ease: "power3.out"
  }, 0.6)
  .fromTo(".gallery-piece", {
    scale: 0.6,
    opacity: 0,
    rotationZ: function() {
      return Math.random() * 40 - 20;
    }
  }, {
    scale: 1,
    opacity: 1,
    rotationZ: 0,
    duration: 0.25,
    ease: "elastic.out(1, 0.7)",
    stagger: {
      each: 0.05,
      from: "random"
    }
  }, 0.7);
```

### Live Creative Generation
```javascript
// Real-time creative AI demonstration
function startCreativeStudio() {
  // Start art generation
  startArtGeneration();
  
  // Start music composition
  startMusicComposition();
  
  // Start writing assistance
  startWritingDemo();
  
  // Start design creation
  startDesignDemo();
  
  // Start creative gallery updates
  startCreativeGallery();
}

function startArtGeneration() {
  const artCanvas = document.querySelector('.art-generation-canvas');
  const ctx = artCanvas.getContext('2d');
  
  // Initialize canvas
  artCanvas.width = artCanvas.clientWidth;
  artCanvas.height = artCanvas.clientHeight;
  
  let currentStroke = [];
  let isDrawing = false;
  
  // Simulate AI painting
  setInterval(() => {
    if (!isDrawing) {
      startNewStroke();
    }
  }, 3000 + Math.random() * 2000);
  
  function startNewStroke() {
    isDrawing = true;
    currentStroke = [];
    
    // Random artistic stroke
    const startX = Math.random() * artCanvas.width;
    const startY = Math.random() * artCanvas.height;
    const strokeLength = 20 + Math.random() * 100;
    const strokeAngle = Math.random() * Math.PI * 2;
    
    const color = getRandomArtisticColor();
    const brushSize = 2 + Math.random() * 8;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Animate stroke
    gsap.to({ progress: 0 }, {
      progress: 1,
      duration: 1 + Math.random(),
      ease: "power2.out",
      onUpdate: function() {
        const progress = this.targets()[0].progress;
        const x = startX + Math.cos(strokeAngle) * strokeLength * progress;
        const y = startY + Math.sin(strokeAngle) * strokeLength * progress + 
                  Math.sin(progress * Math.PI * 4) * 10; // Add artistic curve
        
        if (currentStroke.length === 0) {
          ctx.beginPath();
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
          ctx.stroke();
        }
        
        currentStroke.push({ x, y });
      },
      onComplete: () => {
        isDrawing = false;
        
        // Add creative sparkle effect
        createArtisticSparkles(
          currentStroke[currentStroke.length - 1].x,
          currentStroke[currentStroke.length - 1].y
        );
      }
    });
  }
  
  function getRandomArtisticColor() {
    const artisticColors = [
      '#ef4444', '#f97316', '#eab308', '#22c55e',
      '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
    ];
    return artisticColors[Math.floor(Math.random() * artisticColors.length)];
  }
  
  function createArtisticSparkles(x, y) {
    for (let i = 0; i < 5; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'artistic-sparkle';
      sparkle.style.position = 'absolute';
      sparkle.style.left = x + 'px';
      sparkle.style.top = y + 'px';
      
      artCanvas.parentElement.appendChild(sparkle);
      
      gsap.fromTo(sparkle, {
        scale: 0,
        rotation: 0,
        x: 0,
        y: 0,
        opacity: 1
      }, {
        scale: 1,
        rotation: 360,
        x: (Math.random() - 0.5) * 30,
        y: (Math.random() - 0.5) * 30,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        onComplete: () => sparkle.remove()
      });
    }
  }
}

function startMusicComposition() {
  const musicVisualizer = document.querySelector('.music-visualizer');
  const musicBars = musicVisualizer.querySelectorAll('.music-bar');
  
  // Simulate AI music composition
  setInterval(() => {
    // Create musical phrase
    const phraseLength = 8 + Math.floor(Math.random() * 8);
    
    for (let i = 0; i < phraseLength; i++) {
      setTimeout(() => {
        const randomBar = musicBars[Math.floor(Math.random() * musicBars.length)];
        const intensity = 0.3 + Math.random() * 0.7;
        
        gsap.to(randomBar, {
          scaleY: intensity,
          duration: 0.2,
          ease: "power2.out",
          yoyo: true,
          repeat: 1
        });
        
        // Visual music note
        createMusicNote(randomBar);
        
      }, i * 200);
    }
    
  }, 4000 + Math.random() * 3000);
}

function createMusicNote(bar) {
  const note = document.createElement('div');
  note.className = 'music-note';
  note.textContent = ['♪', '♫', '♬', '♭', '♮', '♯'][Math.floor(Math.random() * 6)];
  
  const rect = bar.getBoundingClientRect();
  note.style.position = 'absolute';
  note.style.left = rect.left + rect.width / 2 + 'px';
  note.style.top = rect.top + 'px';
  
  document.body.appendChild(note);
  
  gsap.fromTo(note, {
    y: 0,
    opacity: 1,
    scale: 0
  }, {
    y: -50,
    opacity: 0,
    scale: 1,
    duration: 1.5,
    ease: "power2.out",
    onComplete: () => note.remove()
  });
}

function startWritingDemo() {
  const writingDemo = document.querySelector('.writing-demo');
  const typewriter = writingDemo.querySelector('.typewriter-text');
  
  const creativeTexts = [
    "In the realm where silicon dreams meet human imagination...",
    "The canvas breathes with digital life, each pixel a story waiting...",
    "Music flows through neural networks, harmonies born of code...",
    "Words dance across the screen, each sentence a bridge between worlds...",
    "Design emerges from the void, geometry kissed by artificial intuition..."
  ];
  
  let currentTextIndex = 0;
  
  setInterval(() => {
    const text = creativeTexts[currentTextIndex];
    typewriter.textContent = '';
    
    // Typewriter effect
    gsap.to({ chars: 0 }, {
      chars: text.length,
      duration: 2,
      ease: "none",
      onUpdate: function() {
        const charCount = Math.floor(this.targets()[0].chars);
        typewriter.textContent = text.substring(0, charCount);
      },
      onComplete: () => {
        // Pause before next text
        setTimeout(() => {
          gsap.to(typewriter, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
              currentTextIndex = (currentTextIndex + 1) % creativeTexts.length;
              typewriter.style.opacity = 1;
            }
          });
        }, 2000);
      }
    });
    
  }, 8000);
}

function startDesignDemo() {
  const designCanvas = document.querySelector('.design-demo-canvas');
  const shapes = ['circle', 'square', 'triangle', 'hexagon'];
  
  setInterval(() => {
    // Create design element
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const element = document.createElement('div');
    element.className = `design-shape design-${shape}`;
    
    // Random position and properties
    const x = Math.random() * (designCanvas.clientWidth - 50);
    const y = Math.random() * (designCanvas.clientHeight - 50);
    const size = 20 + Math.random() * 40;
    const color = getRandomDesignColor();
    
    gsap.set(element, {
      x: x,
      y: y,
      width: size,
      height: size,
      backgroundColor: color,
      borderRadius: shape === 'circle' ? '50%' : shape === 'triangle' ? '0' : '8px'
    });
    
    designCanvas.appendChild(element);
    
    // Animate appearance
    gsap.fromTo(element, {
      scale: 0,
      rotation: -180,
      opacity: 0
    }, {
      scale: 1,
      rotation: 0,
      opacity: 0.8,
      duration: 0.8,
      ease: "back.out(1.7)"
    });
    
    // Remove after animation
    setTimeout(() => {
      gsap.to(element, {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        onComplete: () => element.remove()
      });
    }, 5000);
    
  }, 1500 + Math.random() * 1000);
}

function getRandomDesignColor() {
  const designColors = [
    '#ef444480', '#f9731680', '#eab30880', '#22c55e80',
    '#06b6d480', '#3b82f680', '#8b5cf680', '#ec489980'
  ];
  return designColors[Math.floor(Math.random() * designColors.length)];
}

function startCreativeGallery() {
  const galleryContainer = document.querySelector('.creative-gallery');
  const galleryPieces = [
    { type: 'digital-art', title: 'Neural Landscape', medium: 'AI Generated Art' },
    { type: 'ai-music', title: 'Synthetic Symphony #42', medium: 'AI Composition' },
    { type: 'generated-poem', title: 'Silicon Dreams', medium: 'AI Poetry' },
    { type: 'ai-design', title: 'Geometric Harmony', medium: 'AI Design' },
    { type: 'ai-photo', title: 'Impossible Architecture', medium: 'AI Photography' },
    { type: 'ai-video', title: 'Digital Ballet', medium: 'AI Animation' }
  ];
  
  let currentPieceIndex = 0;
  
  setInterval(() => {
    const piece = galleryPieces[currentPieceIndex];
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-piece';
    galleryItem.innerHTML = `
      <div class="piece-preview ${piece.type}"></div>
      <div class="piece-info">
        <h4 class="piece-title">${piece.title}</h4>
        <p class="piece-medium">${piece.medium}</p>
      </div>
    `;
    
    // Position new piece
    gsap.set(galleryItem, {
      x: galleryContainer.clientWidth,
      opacity: 0
    });
    
    galleryContainer.appendChild(galleryItem);
    
    // Animate in
    gsap.to(galleryItem, {
      x: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power3.out"
    });
    
    // Remove old pieces if too many
    const allPieces = galleryContainer.querySelectorAll('.gallery-piece');
    if (allPieces.length > 6) {
      const oldPiece = allPieces[0];
      gsap.to(oldPiece, {
        x: -oldPiece.clientWidth,
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => oldPiece.remove()
      });
    }
    
    currentPieceIndex = (currentPieceIndex + 1) % galleryPieces.length;
    
  }, 6000 + Math.random() * 4000);
}
```

---

## Content Scripts

### English Version
```json
{
  "creativity": {
    "title": "AI Muse",
    "subtitle": "Where artificial intelligence meets human creativity",
    "description": "Revolutionary creative AI applications that don't just generate content – they collaborate, inspire, and push the boundaries of artistic expression alongside human creators.",
    "studio_status": {
      "status": "Creative Studio Active",
      "projects": "12,847 projects in progress",
      "collaborations": "AI-human partnerships worldwide",
      "creations": "2.3M+ artworks generated today"
    },
    "applications": {
      "art_ai": {
        "name": "ArtAI",
        "tagline": "Digital Artistic Intelligence",
        "description": "AI-powered art creation and artistic collaboration",
        "features": [
          "Style transfer and synthesis",
          "Original artwork generation",
          "Artistic technique analysis",
          "Creative process guidance"
        ],
        "metrics": {
          "artworks_created": "2.3M+ original artworks",
          "styles_mastered": "500+ artistic styles",
          "artist_collaborations": "15K+ artist partnerships"
        }
      },
      "music_ai": {
        "name": "MusicAI",
        "tagline": "Compositional Intelligence",
        "description": "AI music composition and audio creativity",
        "features": [
          "Original music composition",
          "Harmony and melody generation",
          "Instrument synthesis",
          "Audio production assistance"
        ],
        "metrics": {
          "compositions": "850K+ original compositions",
          "genres": "200+ musical genres",
          "musician_collaborations": "25K+ musician partnerships"
        }
      },
      "writing_ai": {
        "name": "WritingAI",
        "tagline": "Literary Intelligence",
        "description": "AI writing assistance and creative storytelling",
        "features": [
          "Creative writing support",
          "Story structure guidance",
          "Character development",
          "Poetry and prose generation"
        ],
        "metrics": {
          "words_written": "1.2B+ words assisted",
          "stories": "500K+ stories crafted",
          "author_partnerships": "75K+ writer collaborations"
        }
      },
      "design_ai": {
        "name": "DesignAI",
        "tagline": "Visual Design Intelligence",
        "description": "AI graphic design and visual creativity",
        "features": [
          "Logo and brand design",
          "Layout optimization",
          "Color palette generation",
          "Typography recommendations"
        ],
        "metrics": {
          "designs_created": "3.2M+ designs generated",
          "brands": "50K+ brands designed",
          "designer_partnerships": "40K+ designer collaborations"
        }
      },
      "photo_ai": {
        "name": "PhotoAI",
        "tagline": "Photographic Intelligence",
        "description": "AI photography enhancement and creation",
        "features": [
          "Photo enhancement and restoration",
          "Synthetic photography",
          "Composition analysis",
          "Style adaptation"
        ],
        "metrics": {
          "photos_enhanced": "15M+ photos improved",
          "synthetic_images": "5M+ photorealistic images",
          "photographer_partnerships": "30K+ photographer collaborations"
        }
      },
      "video_ai": {
        "name": "VideoAI",
        "tagline": "Motion Picture Intelligence",
        "description": "AI video creation and animation",
        "features": [
          "Video synthesis and editing",
          "Animation generation",
          "Scene composition",
          "Visual effects creation"
        ],
        "metrics": {
          "videos_created": "250K+ video projects",
          "animation_hours": "100K+ hours of animation",
          "filmmaker_partnerships": "12K+ filmmaker collaborations"
        }
      },
      "3d_ai": {
        "name": "3D ModelAI",
        "tagline": "Dimensional Creation Intelligence",
        "description": "AI 3D modeling and spatial design",
        "features": [
          "3D model generation",
          "Texture synthesis",
          "Spatial design optimization",
          "Virtual environment creation"
        ],
        "metrics": {
          "models_created": "800K+ 3D models generated",
          "environments": "50K+ virtual environments",
          "3d_artist_partnerships": "18K+ 3D artist collaborations"
        }
      },
      "game_ai": {
        "name": "GameAI",
        "tagline": "Interactive Entertainment Intelligence",
        "description": "AI game design and interactive experiences",
        "features": [
          "Game mechanics generation",
          "Level design assistance",
          "Character behavior creation",
          "Narrative branching"
        ],
        "metrics": {
          "games_designed": "25K+ game concepts",
          "levels_created": "500K+ game levels",
          "game_dev_partnerships": "8K+ game developer collaborations"
        }
      }
    },
    "creative_metrics": {
      "total_creations": "10M+ creative works generated",
      "active_creators": "150K+ active creators",
      "collaboration_hours": "2M+ human-AI collaboration hours",
      "innovation_score": "98% creative innovation rating"
    }
  }
}
```

### Romanian Version
```json
{
  "creativity": {
    "title": "Muza AI",
    "subtitle": "Unde inteligența artificială întâlnește creativitatea umană",
    "description": "Aplicații AI creative revoluționare care nu doar generează conținut – colaborează, inspiră și împing limitele expresiei artistice alături de creatorii umani.",
    "studio_status": {
      "status": "Studio Creativ Activ",
      "projects": "12,847 proiecte în desfășurare",
      "collaborations": "Parteneriate AI-uman la nivel mondial",
      "creations": "2.3M+ opere de artă generate astăzi"
    }
    // Additional Romanian translations...
  }
}
```

---

## Interactions

### Creative Tool Interactions
```javascript
// Interactive creative studio
function initializeCreativeStudio() {
  const creativeTools = document.querySelectorAll('.creative-tool');
  const artCanvas = document.querySelector('.interactive-canvas');
  
  // Creative tool interactions
  creativeTools.forEach(tool => {
    tool.addEventListener('mouseenter', (e) => {
      const toolType = e.target.dataset.toolType;
      
      // Highlight tool
      gsap.to(e.target, {
        scale: 1.2,
        filter: "brightness(1.3) saturate(1.5)",
        duration: 0.3,
        ease: "back.out(1.7)"
      });
      
      // Show tool preview
      showToolPreview(toolType);
      
      // Activate tool cursor
      activateCreativeCursor(toolType);
    });
    
    tool.addEventListener('mouseleave', (e) => {
      // Reset tool
      gsap.to(e.target, {
        scale: 1,
        filter: "brightness(1) saturate(1)",
        duration: 0.3,
        ease: "power2.out"
      });
      
      // Hide tool preview
      hideToolPreview();
      
      // Reset cursor
      resetCreativeCursor();
    });
    
    // Tool selection
    tool.addEventListener('click', (e) => {
      const toolType = e.target.dataset.toolType;
      selectCreativeTool(toolType);
    });
  });
  
  // Canvas interactions
  if (artCanvas) {
    initializeInteractiveCanvas(artCanvas);
  }
  
  // Creative app showcases
  const creativeApps = document.querySelectorAll('.creativity-app');
  creativeApps.forEach(app => {
    app.addEventListener('mouseenter', (e) => {
      const appType = e.target.dataset.appType;
      startCreativeDemo(appType);
    });
    
    app.addEventListener('mouseleave', (e) => {
      const appType = e.target.dataset.appType;
      stopCreativeDemo(appType);
    });
    
    app.addEventListener('click', (e) => {
      const appType = e.target.dataset.appType;
      showCreativeDetails(appType);
    });
  });
}

function initializeInteractiveCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  let isDrawing = false;
  let currentTool = 'brush';
  let currentColor = '#ef4444';
  
  canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    startDrawing(x, y);
  });
  
  canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    continueDrawing(x, y);
  });
  
  canvas.addEventListener('mouseup', () => {
    if (isDrawing) {
      isDrawing = false;
      finishDrawing();
    }
  });
  
  function startDrawing(x, y) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    // Apply current tool properties
    applyToolProperties();
  }
  
  function continueDrawing(x, y) {
    ctx.lineTo(x, y);
    ctx.stroke();
    
    // Create creative particles
    if (Math.random() > 0.7) {
      createCreativeParticle(x, y);
    }
  }
  
  function finishDrawing() {
    // Add creative flourish
    createDrawingFinishEffect();
  }
  
  function applyToolProperties() {
    switch(currentTool) {
      case 'brush':
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        break;
      case 'pencil':
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        break;
      case 'marker':
        ctx.strokeStyle = currentColor + '80'; // Semi-transparent
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        break;
    }
  }
  
  function createCreativeParticle(x, y) {
    const particle = document.createElement('div');
    particle.className = 'creative-particle';
    particle.style.backgroundColor = currentColor;
    
    gsap.set(particle, {
      position: 'absolute',
      left: x + canvas.offsetLeft,
      top: y + canvas.offsetTop,
      width: '4px',
      height: '4px',
      borderRadius: '50%',
      pointerEvents: 'none'
    });
    
    document.body.appendChild(particle);
    
    gsap.to(particle, {
      x: (Math.random() - 0.5) * 20,
      y: -20 - Math.random() * 10,
      opacity: 0,
      duration: 1,
      ease: "power2.out",
      onComplete: () => particle.remove()
    });
  }
}

function selectCreativeTool(toolType) {
  const tools = document.querySelectorAll('.creative-tool');
  
  // Update active tool
  tools.forEach(tool => {
    tool.classList.toggle('active', tool.dataset.toolType === toolType);
  });
  
  // Update canvas tool
  currentTool = toolType;
  
  // Show tool selection feedback
  showToolSelectionFeedback(toolType);
}

function showToolSelectionFeedback(toolType) {
  const feedback = document.createElement('div');
  feedback.className = 'tool-feedback';
  feedback.textContent = `${toolType} selected`;
  
  document.body.appendChild(feedback);
  
  gsap.fromTo(feedback, {
    opacity: 0,
    y: 20,
    scale: 0.8
  }, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.3,
    ease: "back.out(1.7)",
    onComplete: () => {
      gsap.to(feedback, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        delay: 1,
        onComplete: () => feedback.remove()
      });
    }
  });
}

function startCreativeDemo(appType) {
  const demoContainer = document.querySelector(`[data-app-type="${appType}"] .demo-container`);
  
  switch(appType) {
    case 'art-ai':
      startArtDemo(demoContainer);
      break;
    case 'music-ai':
      startMusicDemo(demoContainer);
      break;
    case 'writing-ai':
      startWritingDemo(demoContainer);
      break;
    case 'design-ai':
      startDesignDemo(demoContainer);
      break;
  }
}

function startArtDemo(container) {
  // Show AI art generation process
  const artPreviews = container.querySelectorAll('.art-preview');
  
  artPreviews.forEach((preview, index) => {
    gsap.fromTo(preview, {
      opacity: 0,
      scale: 0.8,
      filter: "blur(10px)"
    }, {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      duration: 0.8,
      ease: "power3.out",
      delay: index * 0.2
    });
  });
}

function startMusicDemo(container) {
  // Show AI music composition
  const musicNotes = container.querySelectorAll('.music-note');
  
  musicNotes.forEach((note, index) => {
    gsap.fromTo(note, {
      opacity: 0,
      y: 20,
      scale: 0
    }, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.5,
      ease: "back.out(2)",
      delay: index * 0.1,
      repeat: -1,
      repeatDelay: 2,
      yoyo: true
    });
  });
}

function showCreativeDetails(appType) {
  const modal = document.createElement('div');
  modal.className = 'creative-details-modal';
  
  const appData = getCreativeAppData(appType);
  
  modal.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-content">
      <button class="modal-close" aria-label="Close creative details">&times;</button>
      <div class="creative-details">
        <h3>${appData.name}</h3>
        <p class="tagline">${appData.tagline}</p>
        <p class="description">${appData.description}</p>
        
        <div class="features-grid">
          ${appData.features.map(feature => `
            <div class="feature-item">${feature}</div>
          `).join('')}
        </div>
        
        <div class="metrics-showcase">
          ${Object.entries(appData.metrics).map(([key, value]) => `
            <div class="metric">
              <span class="metric-value">${value}</span>
              <span class="metric-label">${key.replace('_', ' ')}</span>
            </div>
          `).join('')}
        </div>
        
        <div class="demo-section">
          <h4>Live Demo</h4>
          <div class="interactive-demo" data-demo-type="${appType}">
            <!-- Demo content will be generated here -->
          </div>
        </div>
        
        <div class="action-buttons">
          <button class="try-now-button">Try Now</button>
          <button class="learn-more-button">Learn More</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Animate modal
  gsap.fromTo(modal.querySelector('.modal-content'), {
    scale: 0.8,
    opacity: 0,
    rotationY: -30
  }, {
    scale: 1,
    opacity: 1,
    rotationY: 0,
    duration: 0.5,
    ease: "back.out(1.7)"
  });
  
  // Initialize demo
  initializeCreativeDemo(modal.querySelector('.interactive-demo'), appType);
  
  // Close handlers
  const closeModal = () => {
    gsap.to(modal, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => modal.remove()
    });
  };
  
  modal.querySelector('.modal-close').addEventListener('click', closeModal);
  modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);
}

function initializeCreativeDemo(container, appType) {
  switch(appType) {
    case 'art-ai':
      createInteractiveArtDemo(container);
      break;
    case 'music-ai':
      createInteractiveMusicDemo(container);
      break;
    case 'writing-ai':
      createInteractiveWritingDemo(container);
      break;
    case 'design-ai':
      createInteractiveDesignDemo(container);
      break;
  }
}

function createInteractiveArtDemo(container) {
  container.innerHTML = `
    <div class="art-demo-canvas-container">
      <canvas class="art-demo-canvas" width="400" height="300"></canvas>
      <div class="art-controls">
        <button class="generate-art-button">Generate Art</button>
        <select class="style-selector">
          <option value="abstract">Abstract</option>
          <option value="impressionist">Impressionist</option>
          <option value="cyberpunk">Cyberpunk</option>
          <option value="minimalist">Minimalist</option>
        </select>
      </div>
    </div>
  `;
  
  const generateButton = container.querySelector('.generate-art-button');
  const styleSelector = container.querySelector('.style-selector');
  const canvas = container.querySelector('.art-demo-canvas');
  
  generateButton.addEventListener('click', () => {
    const style = styleSelector.value;
    generateAIArt(canvas, style);
  });
}

function generateAIArt(canvas, style) {
  const ctx = canvas.getContext('2d');
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Generate art based on style
  const colors = getStyleColors(style);
  const patterns = getStylePatterns(style);
  
  // Animate art generation
  gsap.to({ progress: 0 }, {
    progress: 1,
    duration: 3,
    ease: "power2.out",
    onUpdate: function() {
      const progress = this.targets()[0].progress;
      drawArtProgress(ctx, colors, patterns, progress);
    }
  });
}

function getStyleColors(style) {
  const styleColors = {
    abstract: ['#ef4444', '#f97316', '#eab308', '#22c55e'],
    impressionist: ['#fbbf24', '#a78bfa', '#f472b6', '#60a5fa'],
    cyberpunk: ['#00ff88', '#ff0080', '#0080ff', '#ffff00'],
    minimalist: ['#000000', '#ffffff', '#gray-500', '#gray-300']
  };
  return styleColors[style] || styleColors.abstract;
}
```

This comprehensive Creativity chapter creates an immersive artistic experience that showcases CODAI's creative AI applications while encouraging interaction and inspiration. The chapter demonstrates the collaborative nature of AI-human creativity and provides engaging visual demonstrations of each creative tool.

Would you like me to continue with the remaining chapters (Lifestyle, Constellation, Future) to complete all 12 storyboards?
