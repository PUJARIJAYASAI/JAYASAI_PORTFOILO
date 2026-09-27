/**
 * RISO DITHER WEBGL BACKGROUND ENGINE
 * Real-time procedural flow field quantized through a Bayer matrix
 * into a risograph halftone ink palette with drifting luminous core.
 */

export function initRisoDither(canvasId = 'riso-dither-canvas') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    const gl = canvas.getContext('webgl', {
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: 'low-power'
    });

    if (!gl) {
        console.warn('WebGL not supported for riso dither canvas.');
        return null;
    }

    // Vertex Shader: Fullscreen Quad
    const vsSource = `
        attribute vec2 a_position;
        varying vec2 v_uv;
        void main() {
            v_uv = (a_position + 1.0) * 0.5;
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
    `;

    // Fragment Shader: Flow Field + Bayer Matrix Dither + Risograph Ink Ramp
    const fsSource = `
        precision highp float;
        varying vec2 v_uv;

        uniform vec2 u_resolution;
        uniform float u_time;
        uniform float u_pixel_size;
        uniform float u_scale;
        uniform float u_contrast;
        uniform float u_flow_angle;
        uniform float u_detail;
        uniform float u_glow;
        uniform float u_levels;
        uniform float u_is_light;

        // 4x4 Bayer Matrix
        float getBayer4(vec2 p) {
            vec2 m = mod(p, 4.0);
            int x = int(m.x);
            int y = int(m.y);
            if (y == 0) {
                if (x == 0) return 0.0 / 16.0;
                if (x == 1) return 8.0 / 16.0;
                if (x == 2) return 2.0 / 16.0;
                return 10.0 / 16.0;
            } else if (y == 1) {
                if (x == 0) return 12.0 / 16.0;
                if (x == 1) return 4.0 / 16.0;
                if (x == 2) return 14.0 / 16.0;
                return 6.0 / 16.0;
            } else if (y == 2) {
                if (x == 0) return 3.0 / 16.0;
                if (x == 1) return 11.0 / 16.0;
                if (x == 2) return 1.0 / 16.0;
                return 9.0 / 16.0;
            } else {
                if (x == 0) return 15.0 / 16.0;
                if (x == 1) return 7.0 / 16.0;
                if (x == 2) return 13.0 / 16.0;
                return 5.0 / 16.0;
            }
        }

        // Fast Procedural Pseudo-Noise
        vec2 hash2(vec2 p) {
            p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
            return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
        }

        float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(
                mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
                    dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
                mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
                    dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
                u.y
            );
        }

        // Flow Field with Octaves
        float flowField(vec2 p, vec2 dir, float t) {
            vec2 p1 = p + dir * t * 0.12;
            float n1 = noise(p1);
            
            vec2 p2 = p * 2.1 - dir * t * 0.18 + vec2(n1 * 0.8, -n1 * 0.8);
            float n2 = noise(p2) * u_detail;

            vec2 p3 = p * 4.3 + dir * t * 0.25;
            float n3 = noise(p3) * (u_detail * 0.5);

            return (n1 + n2 + n3) * 0.5 + 0.5;
        }

        void main() {
            // Quantize to Chunky Pixels
            vec2 pixelCoord = floor(gl_FragCoord.xy / u_pixel_size);
            vec2 normCoord = (pixelCoord * u_pixel_size) / u_resolution.xy;
            normCoord.y = 1.0 - normCoord.y; // Correct WebGL coordinate orientation

            // Aspect ratio correction
            float aspect = u_resolution.x / u_resolution.y;
            vec2 uv = normCoord;
            uv.x *= aspect;

            // Flow Direction Angle
            float rad = radians(u_flow_angle);
            vec2 dir = vec2(cos(rad), sin(rad));

            // Flow Field Density
            float field = flowField(uv * u_scale, dir, u_time);

            // Drifting Luminous Core
            vec2 corePos = vec2(
                aspect * (0.55 + 0.25 * sin(u_time * 0.15)),
                0.45 + 0.2 * cos(u_time * 0.18)
            );
            float dist = length(uv - corePos);
            float core = exp(-dist * 2.2) * u_glow;

            // Composite raw value
            float val = field * 0.65 + core * 0.55;

            // Editorial Contrast Curve
            val = clamp((val - 0.5) * u_contrast + 0.5, 0.0, 1.0);

            // Bayer Dither Quantization
            float bayer = getBayer4(pixelCoord);
            float ditherVal = val + (bayer - 0.5) / u_levels;
            float quantized = floor(clamp(ditherVal, 0.0, 1.0) * u_levels) / u_levels;

            // Multi-Ink Risograph Palette Ramp
            vec4 col;
            if (u_is_light > 0.5) {
                // Light Theme: Clean paper base to soft cyan/emerald inks
                vec3 ink0 = vec3(0.97, 0.97, 0.98); // Paper
                vec3 ink1 = vec3(0.82, 0.92, 0.88); // Pale Seafoam
                vec3 ink2 = vec3(0.02, 0.65, 0.45); // Emerald Midtone
                vec3 ink3 = vec3(0.00, 0.35, 0.25); // Deep Teal Ink

                if (quantized < 0.33) {
                    col = vec4(mix(ink0, ink1, quantized / 0.33), quantized * 0.6);
                } else if (quantized < 0.66) {
                    col = vec4(mix(ink1, ink2, (quantized - 0.33) / 0.33), 0.75);
                } else {
                    col = vec4(mix(ink2, ink3, (quantized - 0.66) / 0.34), 0.9);
                }
            } else {
                // Dark Theme (Default): Deep obsidian to neon cyber green highlight
                vec3 ink0 = vec3(0.03, 0.03, 0.04); // Deep Obsidian
                vec3 ink1 = vec3(0.02, 0.16, 0.08); // Dark Emerald Shadow
                vec3 ink2 = vec3(0.00, 0.85, 0.38); // Vibrant Risograph Green
                vec3 ink3 = vec3(0.40, 1.00, 0.72); // Luminous Lime Core

                if (quantized < 0.25) {
                    col = vec4(ink0, quantized * 0.4);
                } else if (quantized < 0.6) {
                    col = vec4(mix(ink1, ink2, (quantized - 0.25) / 0.35), 0.7);
                } else {
                    col = vec4(mix(ink2, ink3, (quantized - 0.6) / 0.4), 0.88);
                }
            }

            gl_FragColor = col;
        }
    `;

    // Shader Compiler Helper
    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return null;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        return null;
    }

    // Quad Buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1
    ]), gl.STATIC_DRAW);

    const posAttr = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    // Uniform Locations
    const uRes = gl.getUniformLocation(program, 'u_resolution');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uPixelSize = gl.getUniformLocation(program, 'u_pixel_size');
    const uScale = gl.getUniformLocation(program, 'u_scale');
    const uContrast = gl.getUniformLocation(program, 'u_contrast');
    const uFlowAngle = gl.getUniformLocation(program, 'u_flow_angle');
    const uDetail = gl.getUniformLocation(program, 'u_detail');
    const uGlow = gl.getUniformLocation(program, 'u_glow');
    const uLevels = gl.getUniformLocation(program, 'u_levels');
    const uIsLight = gl.getUniformLocation(program, 'u_is_light');

    // Tuned Design Parameters (Matching Specification)
    const config = {
        pixelSize: 3.0,     // Crisp chunky halftone dither cells
        speed: 0.22,        // Glacial elegant ambient drift
        scale: 1.1,         // Balanced wind-swept ribbons
        contrast: 1.5,      // Bold editorial separation
        flowAngle: 35.0,    // 35° dynamic wind angle
        detail: 0.42,       // Subtle atmospheric cloud grain
        glow: 0.75,         // Luminous drifting focal core
        levels: 6.0         // 6-level risograph posterized ink ramp
    };

    let width = 0;
    let height = 0;

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const newW = Math.floor(window.innerWidth * dpr);
        const newH = Math.floor(window.innerHeight * dpr);

        if (width !== newW || height !== newH) {
            width = newW;
            height = newH;
            canvas.width = width;
            canvas.height = height;
            gl.viewport(0, 0, width, height);
        }
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();

    // Render Loop & Performance Throttling
    let animationFrameId = null;
    let startTime = performance.now();
    let isRunning = true;

    function render(now) {
        if (!isRunning) return;

        const elapsed = (now - startTime) * 0.001;
        const isLight = document.documentElement.getAttribute('data-theme') === 'light' ? 1.0 : 0.0;

        gl.useProgram(program);
        gl.uniform2f(uRes, width, height);
        gl.uniform1f(uTime, elapsed * config.speed);
        gl.uniform1f(uPixelSize, config.pixelSize);
        gl.uniform1f(uScale, config.scale);
        gl.uniform1f(uContrast, config.contrast);
        gl.uniform1f(uFlowAngle, config.flowAngle);
        gl.uniform1f(uDetail, config.detail);
        gl.uniform1f(uGlow, config.glow);
        gl.uniform1f(uLevels, config.levels);
        gl.uniform1f(uIsLight, isLight);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        animationFrameId = requestAnimationFrame(render);
    }

    // Lifecycle: Pause when tab is inactive or document hidden to preserve 100% battery
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            isRunning = false;
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        } else {
            if (!isRunning) {
                isRunning = true;
                startTime = performance.now();
                animationFrameId = requestAnimationFrame(render);
            }
        }
    });

    animationFrameId = requestAnimationFrame(render);

    return {
        canvas,
        config,
        setParam(key, val) {
            if (key in config) config[key] = val;
        }
    };
}
