const CHALLENGE_LIBRARY = [
    {
        id: "EASY_01",
        title: "Stepped Mounting Block",
        difficulty: "easy",
        category: "Prismatic",
        unit: "g",
        material: "6061 Aluminum (2.70 g/cm³)",
        referenceMass: 189.54,
        tolerance: 0.5,
        description: "A rectangular block with a center step cut and two through-hole mounting points.",
        svgDrawing: `<svg width="100%" height="100%" viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
            <rect x="50" y="50" width="180" height="120" fill="none" stroke="#3aa3ff" stroke-width="2"/>
            <rect x="50" y="50" width="80" height="120" fill="none" stroke="#3aa3ff" stroke-width="1.5" stroke-dasharray="4"/>
            <circle cx="90" cy="110" r="15" fill="none" stroke="#3aa3ff" stroke-width="2"/>
            <circle cx="180" cy="110" r="15" fill="none" stroke="#3aa3ff" stroke-width="2"/>
            <text x="50" y="40" fill="#a4afc3" font-size="12">BASE: 100mm x 50mm x 20mm</text>
            <text x="50" y="200" fill="#a4afc3" font-size="12">HOLES: 2x Ø12mm THRU</text>
        </svg>`
    },
    {
        id: "MED_01",
        title: "Flanged Shaft Hub",
        difficulty: "medium",
        category: "Rotational",
        unit: "g",
        material: "6061 Aluminum (2.70 g/cm³)",
        referenceMass: 412.30,
        tolerance: 0.8,
        description: "Cylindrical shaft hub with a bolt circle pattern, central keyway bore, and outer step fillet.",
        svgDrawing: `<svg width="100%" height="100%" viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
            <circle cx="180" cy="150" r="90" fill="none" stroke="#3aa3ff" stroke-width="2"/>
            <circle cx="180" cy="150" r="40" fill="none" stroke="#3aa3ff" stroke-width="2"/>
            <circle cx="180" cy="150" r="20" fill="none" stroke="#3aa3ff" stroke-width="2"/>
            <text x="300" y="100" fill="#a4afc3" font-size="12">OUTER DIA: Ø120mm</text>
            <text x="300" y="130" fill="#a4afc3" font-size="12">BORE DIA: Ø25mm</text>
            <text x="300" y="160" fill="#a4afc3" font-size="12">BOLT CIRCLE: 4x Ø10mm on PCD 90mm</text>
        </svg>`
    },
    {
        id: "HARD_01",
        title: "Angle Bracket Support",
        difficulty: "hard",
        category: "Structural",
        unit: "g",
        material: "6061 Aluminum (2.70 g/cm³)",
        referenceMass: 624.85,
        tolerance: 1.0,
        description: "Complex structural bracket featuring angled ribbed cutouts, filleted pockets, and counterbored mounting holes.",
        svgDrawing: `<svg width="100%" height="100%" viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
            <path d="M 50 250 L 50 50 L 100 50 L 100 200 L 250 200 L 250 250 Z" fill="none" stroke="#3aa3ff" stroke-width="2"/>
            <text x="120" y="100" fill="#a4afc3" font-size="12">RIBS: 2x 8mm Thick Wall</text>
            <text x="120" y="140" fill="#a4afc3" font-size="12">POCKET: 15mm Depth Cut</text>
        </svg>`
    }
];

// Attach to global window object in browser
if (typeof window !== 'undefined') {
    window.CHALLENGE_LIBRARY = CHALLENGE_LIBRARY;
}

// Support Node.js require() in server.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CHALLENGE_LIBRARY;
}
