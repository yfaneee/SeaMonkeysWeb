# SeaMonkeys 3D Scanning Documentation
A comprehensive web-based resource documenting photogrammetry and Gaussian splatting workflows for virtual production environments. This project showcases practical research, methodologies, and real-world scan examples for transforming physical spaces into digital 3D assets.

## Project Overview
SeaMonkeys is a documentation platform focused on 3D scanning techniques suitable for virtual production pipelines, particularly for use in Unreal Engine. The site provides technical guides, comparative research, and a gallery of completed scans demonstrating both traditional mesh-based photogrammetry and modern Gaussian splatting approaches.
Features
Interactive 3D Viewer: Real-time Gaussian splat visualization using Three.js and Gaussian Splats 3D library
Research Documentation: In-depth guides covering capture techniques, lighting considerations, and processing workflows
Scan Gallery: Filterable collection of mesh and Gaussian splat models with detailed metadata
Technical Guides: Step-by-step instructions for Linux-based Gaussian splatting setup and processing
Comparative Analysis: Format comparisons (OBJ vs FBX vs glTF) and method evaluations (Photogrammetry vs NeRF vs Gaussian Splatting)

## Technology Stack
HTML5, CSS3, JavaScript (ES6 modules)
Three.js (v0.152.0) for 3D rendering
Gaussian Splats 3D library (v0.4.7) for point cloud visualization
COLMAP for structure-from-motion processing
Meshroom for traditional photogrammetry workflows

## Documentation Sections
Research
Literature Studies
Gaussian Splatting fundamentals and workflow
Photogrammetry capture best practices
Orbital capture method analysis
Scanning Tests
Natural light vs LED light comparison
Workflow optimization and first tests
Real-world auditorium scan reports
Guides
Linux-based Gaussian splatting installation
Simplified workflow for beginners
Advisory report for virtual production environments
Scans
The gallery includes multiple location scans from Eindhoven:
Achteroom Corner (Gaussian splat and mesh versions)
St. Catherine's Church (Gaussian splat and mesh versions)
Effenaar venue
Kladinsky Wall
All scans include processing metadata, image counts, and total processing times.

## Project Structure
```
seamonke/
├── index.html              # Landing page with hero 3D model
├── research.html           # Documentation and guides
├── scans.html             # Gallery of completed scans
├── about.html             # Studio information
└── static/
    ├── styling.css        # Main stylesheet
    ├── dither.css         # Dither background effect
    ├── dither.js          # Dither effect implementation
    ├── documentation/     # Research images and diagrams
    ├── fonts/            # Custom web fonts
    ├── gsplat/           # Gaussian splat .ply files
    ├── images/           # UI assets and logos
    ├── model/            # 3D models (GLB format)
    ├── scans/            # Gallery preview images
    └── scansimages/      # Detailed scan documentation images
```

## Usage 
This is a static website with no build process required. Simply serve the files through any web server or open index.html in a modern browser. Use a live-server for visualising the Gsplat viewer.

## Credits
Developed by SeaMonkeys Design Studio. All scans were captured in Eindhoven, Netherlands.

## License
Copyright 2026 SeaMonkeys. All rights reserved.
