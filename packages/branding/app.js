/**
 * GROW — Institutional Tech: Living Brand Canvas & Manual
 * v3.0.0 — Rebrander Engine · Voice Translator v2 · Contrast Matrix
 */

document.addEventListener('DOMContentLoaded', () => {
    // ─────────────────────────────────────────────────────
    // 1. STATE AND SELECTORS
    // ─────────────────────────────────────────────────────
    const state = {
        theme: 'light',
        activeTab: 'canvas-tab',
        chartRange: 'weekly',
        gridOverlay: false,
        lastTranslation: null,
        brandedHtml: null
    };

    const BRAND = {
        starkWhite: '#FFFFFF',
        alabaster: '#F8F9FA',
        charcoal: '#1A202C',
        indigo: '#4F46E5',
        indigoDeep: '#4338CA',
        slateText: '#4A5568'
    };

    const swatches = document.querySelectorAll('.color-swatch-item');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeStatusText = document.getElementById('theme-status-text');
    const fontSizeSlider = document.getElementById('font-size-slider');
    const fontSizeVal = document.getElementById('font-size-val');
    const fontFamilySelect = document.getElementById('font-family-select');
    const fontPreviewArea = document.getElementById('font-preview-area');
    const toggleGridBtn = document.getElementById('toggle-grid-overlay');

    let growthChartInstance = null;

    // ─────────────────────────────────────────────────────
    // 2. PREDICTIVE DATA VISUALIZATION (Chart.js)
    // ─────────────────────────────────────────────────────
    const initializeChart = (range) => {
        const ctx = document.getElementById('growthChart').getContext('2d');
        const gridColor = state.theme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(26, 32, 44, 0.04)';
        const textColor = state.theme === 'dark' ? 'rgba(248, 249, 250, 0.5)' : 'rgba(26, 32, 44, 0.6)';

        if (growthChartInstance) growthChartInstance.destroy();

        const chartData = {
            weekly: {
                labels: ['Mon 01', 'Tue 02', 'Wed 03', 'Thu 04', 'Fri 05', 'Sat 06', 'Sun 07'],
                data: [420, 580, 510, 740, 890, 810, 960],
                label: 'Compute Scale'
            },
            monthly: {
                labels: ['Week 01', 'Week 02', 'Week 03', 'Week 04', 'Week 05', 'Week 06'],
                data: [2200, 3100, 2900, 4800, 6200, 7100],
                label: 'Projected Volume'
            }
        };
        const activeData = chartData[range];

        const gradient = ctx.createLinearGradient(0, 0, 0, 240);
        gradient.addColorStop(0, 'rgba(79, 70, 229, 0.25)');
        gradient.addColorStop(1, 'rgba(79, 70, 229, 0.0)');

        growthChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: activeData.labels,
                datasets: [{
                    label: activeData.label,
                    data: activeData.data,
                    borderColor: BRAND.indigo,
                    borderWidth: 2,
                    pointBackgroundColor: BRAND.indigo,
                    pointBorderColor: '#FFFFFF',
                    pointBorderWidth: 1,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    backgroundColor: gradient,
                    tension: 0.15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: state.theme === 'dark' ? '#1A202C' : '#FFFFFF',
                        titleColor: state.theme === 'dark' ? '#FFFFFF' : '#1A202C',
                        bodyColor: state.theme === 'dark' ? '#F8F9FA' : '#1A202C',
                        borderColor: 'rgba(79, 70, 229, 0.3)',
                        borderWidth: 1,
                        titleFont: { family: 'Archivo', weight: 'bold' },
                        bodyFont: { family: 'Roboto Mono' },
                        callbacks: {
                            label: (context) => ` [VAL]: ${context.parsed.y} Mhz`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: gridColor, borderColor: gridColor },
                        ticks: { color: textColor, font: { family: 'Roboto Mono', size: 9 } }
                    },
                    y: {
                        grid: { color: gridColor, borderColor: gridColor },
                        ticks: { color: textColor, font: { family: 'Roboto Mono', size: 9 } }
                    }
                }
            }
        });
    };

    // ─────────────────────────────────────────────────────
    // 3. TAB CONTROLLER
    // ─────────────────────────────────────────────────────
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            tabPanels.forEach(panel => panel.classList.toggle('active', panel.id === targetTab));
            state.activeTab = targetTab;
            if (targetTab === 'canvas-tab') {
                setTimeout(() => initializeChart(state.chartRange), 50);
            }
        });
    });

    // ─────────────────────────────────────────────────────
    // 4. THEME CONTROLLER
    // ─────────────────────────────────────────────────────
    themeToggleBtn.addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark-theme');
        document.body.classList.toggle('dark-theme', !isDark);
        document.body.classList.toggle('light-theme', isDark);
        state.theme = isDark ? 'light' : 'dark';
        themeStatusText.textContent = isDark ? 'Light Mode' : 'Dark Mode';
        initializeChart(state.chartRange);
    });

    // ─────────────────────────────────────────────────────
    // 5. COLOR SWATCH COPIER
    // ─────────────────────────────────────────────────────
    swatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            const hexCode = swatch.getAttribute('data-hex');
            navigator.clipboard.writeText(hexCode).then(() => {
                swatch.classList.add('copy-success');
                const btn = swatch.querySelector('.copy-swatch-btn');
                const originalText = btn.textContent;
                btn.textContent = 'Copied!';
                setTimeout(() => {
                    swatch.classList.remove('copy-success');
                    btn.textContent = originalText;
                }, 1800);
            }).catch(err => console.error('Copy failure: ', err));
        });
    });

    // ─────────────────────────────────────────────────────
    // 6. CHART RANGE SWITCHING
    // ─────────────────────────────────────────────────────
    const rangeBtns = [document.getElementById('range-weekly'), document.getElementById('range-monthly')];
    rangeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            rangeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const range = btn.id.includes('weekly') ? 'weekly' : 'monthly';
            state.chartRange = range;
            document.getElementById('comp-depth-val').textContent = range === 'weekly' ? '1.2B' : '8.4B';
            initializeChart(range);
        });
    });

    // ─────────────────────────────────────────────────────
    // 7. GRID GUIDE OVERLAY
    // ─────────────────────────────────────────────────────
    toggleGridBtn.addEventListener('click', () => {
        state.gridOverlay = !state.gridOverlay;
        document.body.classList.toggle('show-grid-guides', state.gridOverlay);
        toggleGridBtn.textContent = state.gridOverlay ? 'Disable Grid Guide Overlay' : 'Toggle Grid Guide Overlay';
        toggleGridBtn.style.backgroundColor = state.gridOverlay ? 'var(--color-electric-indigo)' : 'transparent';
        toggleGridBtn.style.color = state.gridOverlay ? '#FFFFFF' : 'var(--color-electric-indigo)';
    });

    // ─────────────────────────────────────────────────────
    // 8. VOICE TRANSLATOR v2 — real rule engine
    //
    // Pipeline: phrase rewrites → lexicon swaps → hype strip →
    // de-exclamation → declarative casing → optional framing.
    // Every applied rule is logged to the transformation log,
    // and confidence reflects how much of the input was governed
    // by an explicit rule (no decorative filler appended).
    // ─────────────────────────────────────────────────────
    const PHRASE_RULES = [
        { from: /\bsuper fast\b/gi, to: 'at production frequency', tag: 'super fast → production frequency' },
        { from: /\beasy to use\b/gi, to: 'zero-friction by design', tag: 'easy to use → zero-friction' },
        { from: /\bsee what'?s happening\b/gi, to: 'maintain full operational visibility', tag: 'vague visual → operational visibility' },
        { from: /\bget started for free\b/gi, to: 'initialize at zero cost', tag: 'get started free → initialize' },
        { from: /\bmake your business better\b/gi, to: 'raise operating performance', tag: 'better business → operating performance' },
        { from: /\bgame.?changer\b/gi, to: 'structural shift', tag: 'game-changer → structural shift' },
        { from: /\bstate of the art\b/gi, to: 'production-grade', tag: 'state of the art → production-grade' },
        { from: /\bgrow (super )?fast\b/gi, to: 'compound at scale', tag: 'grow fast → compound at scale' },
        { from: /\bsaves? (you )?time( and money)?\b/gi, to: 'recovers operating capital', tag: 'saves time → recovers capital' },
        { from: /\ball in one( place)?\b/gi, to: 'in one coordinated system', tag: 'all in one → coordinated system' },
        { from: /\btake (your business|it) to the next level\b/gi, to: 'advance to the next operating tier', tag: 'next level → operating tier' }
    ];

    const LEXICON = [
        { from: /\bawesome\b/gi, to: 'engineered', tag: 'awesome → engineered' },
        { from: /\bamazing\b/gi, to: 'precise', tag: 'amazing → precise' },
        { from: /\bgreat\b/gi, to: 'high-resolution', tag: 'great → high-resolution' },
        { from: /\bbeautiful\b/gi, to: 'structured', tag: 'beautiful → structured' },
        { from: /\bcool\b/gi, to: 'rigorous', tag: 'cool → rigorous' },
        { from: /\bnice\b/gi, to: 'exact', tag: 'nice → exact' },
        { from: /\bpowerful\b/gi, to: 'industrial-grade', tag: 'powerful → industrial-grade' },
        { from: /\binnovative\b/gi, to: 'forward-modeled', tag: 'innovative → forward-modeled' },
        { from: /\bseamless(ly)?\b/gi, to: 'frictionless', tag: 'seamless → frictionless' },
        { from: /\beasily\b/gi, to: 'with zero friction', tag: 'easily → zero friction' },
        { from: /\beasy\b/gi, to: 'deterministic', tag: 'easy → deterministic' },
        { from: /\bfast\b/gi, to: 'at production frequency', tag: 'fast → production frequency' },
        { from: /\bquick(ly)?\b/gi, to: 'in bounded time', tag: 'quick → bounded time' },
        { from: /\bhelp(s|ing)?\b/gi, to: 'equip$1', tag: 'help → equip' },
        { from: /\bdashboard\b/gi, to: 'command surface', tag: 'dashboard → command surface' },
        { from: /\bgraphs?\b/gi, to: 'coordinate visualizations', tag: 'graphs → coordinate visualizations' },
        { from: /\btools?\b/gi, to: 'systems', tag: 'tools → systems' },
        { from: /\bbusiness(es)?\b/gi, to: 'operation$1', tag: 'business → operation' },
        { from: /\bcompan(y|ies)\b/gi, to: 'institution$1'.replace('$1', '$1' === 'y' ? '' : 's'), tag: 'company → institution' },
        { from: /\bcustomers?\b/gi, to: 'operators', tag: 'customers → operators' },
        { from: /\bproduct\b/gi, to: 'platform', tag: 'product → platform' },
        { from: /\bfeatures?\b/gi, to: 'capabilities', tag: 'features → capabilities' },
        { from: /\bgrow(th)?\b/gi, to: 'compounding', tag: 'grow → compounding' }
    ];

    // Hype that gets deleted outright — institutional voice does not plead.
    const HYPE_STRIP = [
        { from: /\b(very|really|truly|simply|just|literally|absolutely|incredibly|extremely|super)\s+/gi, tag: 'hype intensifier removed' },
        { from: /\b(world.?class|cutting.?edge|next.?gen(eration)?|revolutionary|disruptive)\s*/gi, tag: 'buzzword removed' },
        { from: /!+/g, to: '.', tag: 'exclamation neutralized' },
        { from: /\?!+/g, to: '.', tag: 'rhetorical mark neutralized' }
    ];

    // Fix the company→institution rule (regex group handling done cleanly here)
    LEXICON.find(r => r.tag === 'company → institution').from = /\bcompany\b/gi;
    LEXICON.find(r => r.tag === 'company → institution').to = 'institution';
    LEXICON.push({ from: /\bcompanies\b/gi, to: 'institutions', tag: 'companies → institutions' });

    const translatorInput = document.getElementById('input-copy-raw');
    const translatorOutput = document.getElementById('translator-output');
    const xformLog = document.getElementById('xform-log');
    const xformMeta = document.getElementById('xform-meta');
    const xformConfidence = document.getElementById('xform-confidence');
    const framingToggle = document.getElementById('framing-toggle-input');
    const copyTranslationBtn = document.getElementById('copy-translation');
    const presetButtons = document.querySelectorAll('.preset-btn');

    const sentenceCase = (text) => {
        // Lowercase shouting, then capitalize sentence starts. Preserve acronyms we introduced.
        let t = text.replace(/\s+/g, ' ').trim();
        t = t.charAt(0).toUpperCase() + t.slice(1);
        t = t.replace(/([.:;]\s+)([a-z])/g, (m, sep, ch) => sep + ch.toUpperCase());
        return t;
    };

    const translateVoice = (raw) => {
        let text = raw.trim();
        const applied = [];
        let hits = 0;

        const runRules = (rules) => {
            rules.forEach(rule => {
                if (rule.from.test(text)) {
                    const matches = text.match(rule.from)?.length ?? 1;
                    hits += matches;
                    text = text.replace(rule.from, rule.to ?? '');
                    applied.push(rule.tag);
                }
                rule.from.lastIndex = 0; // reset /g state
            });
        };

        runRules(PHRASE_RULES);
        runRules(LEXICON);
        runRules(HYPE_STRIP);

        // Declarative close: every statement terminates. No trailing softness.
        text = sentenceCase(text);
        if (!/[.!?]$/.test(text)) {
            text += '.';
            applied.push('declarative close added');
        }

        const words = Math.max(raw.trim().split(/\s+/).length, 1);
        const confidence = Math.min(0.55 + (hits / words) * 0.9, 0.99);

        return { text, applied, confidence };
    };

    const renderTranslation = () => {
        const raw = translatorInput.value.trim();
        if (raw === '') {
            translatorOutput.innerHTML = '<span class="placeholder-text">Translation will appear here in absolute facts...</span>';
            xformLog.innerHTML = '';
            xformMeta.hidden = true;
            state.lastTranslation = null;
            return;
        }

        const result = translateVoice(raw);
        state.lastTranslation = result;

        // Optional technical framing — honest values only (rule count + confidence),
        // not decorative filler.
        let output = result.text;
        if (framingToggle.checked) {
            output = `// VOICE: INSTITUTIONAL · RULES_APPLIED: ${result.applied.length} · CONFIDENCE: ${result.confidence.toFixed(2)}\n${output}`;
        }
        translatorOutput.textContent = output;

        xformMeta.hidden = false;
        xformConfidence.textContent = `REWRITE CONFIDENCE: ${(result.confidence * 100).toFixed(0)}%`;

        xformLog.innerHTML = '';
        if (result.applied.length === 0) {
            const chip = document.createElement('span');
            chip.className = 'xform-chip neutral';
            chip.textContent = 'no fluff detected — copy already compliant';
            xformLog.appendChild(chip);
        } else {
            [...new Set(result.applied)].forEach(tag => {
                const chip = document.createElement('span');
                chip.className = 'xform-chip';
                chip.textContent = tag;
                xformLog.appendChild(chip);
            });
        }
    };

    translatorInput.addEventListener('input', renderTranslation);
    framingToggle.addEventListener('change', renderTranslation);

    copyTranslationBtn.addEventListener('click', () => {
        if (!state.lastTranslation) return;
        navigator.clipboard.writeText(translatorOutput.textContent).then(() => {
            copyTranslationBtn.textContent = 'Copied!';
            setTimeout(() => { copyTranslationBtn.textContent = 'Copy'; }, 1500);
        });
    });

    const voicePresets = {
        '1': "We help companies connect their tools easily and grow super fast!",
        '2': "Our product has an awesome dashboard with great graphs so you see what's happening.",
        '3': "Get started for free today and make your business better!"
    };
    presetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const preset = voicePresets[btn.getAttribute('data-preset')];
            if (preset) {
                translatorInput.value = preset;
                renderTranslation();
            }
        });
    });

    // ─────────────────────────────────────────────────────
    // 9. REBRANDER ENGINE — unbranded HTML in, GROW system out
    //
    // Two passes:
    //   1) Color remap — every hex / rgb() literal in the document is
    //      classified by luminance + saturation and snapped to the
    //      nearest sanctioned palette role.
    //   2) Brand law stylesheet — typography, action elements, and
    //      surfaces are coerced to GROW tokens via an injected layer.
    // ─────────────────────────────────────────────────────
    const rbInput = document.getElementById('rb-input');
    const rbRun = document.getElementById('rb-run');
    const rbDownload = document.getElementById('rb-download');
    const rbLoadSample = document.getElementById('rb-load-sample');
    const rbUploadBtn = document.getElementById('rb-upload-btn');
    const rbFileInput = document.getElementById('rb-file-input');
    const rbCompare = document.getElementById('rb-compare');
    const rbBefore = document.getElementById('rb-before');
    const rbAfter = document.getElementById('rb-after');

    const hexToRgb = (hex) => {
        let h = hex.replace('#', '');
        if (h.length === 3) h = h.split('').map(c => c + c).join('');
        const n = parseInt(h, 16);
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };

    const classifyColor = (r, g, b) => {
        const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        const sat = max === 0 ? 0 : (max - min) / max;

        if (sat > 0.25) {
            // Chromatic → indigo family, split by brightness
            return lum > 0.62 ? BRAND.alabaster : lum > 0.34 ? BRAND.indigo : BRAND.indigoDeep;
        }
        // Achromatic → structural grays
        if (lum >= 0.93) return BRAND.starkWhite;
        if (lum >= 0.78) return BRAND.alabaster;
        if (lum >= 0.45) return BRAND.slateText;
        return BRAND.charcoal;
    };

    const remapColors = (html) => {
        let count = 0;
        // Hex literals
        html = html.replace(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g, (m) => {
            const [r, g, b] = hexToRgb(m);
            count++;
            return classifyColor(r, g, b);
        });
        // rgb()/rgba() literals — preserve alpha
        html = html.replace(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*([\d.]+)\s*)?\)/g,
            (m, r, g, b, a) => {
                const mapped = classifyColor(+r, +g, +b);
                count++;
                if (a !== undefined) {
                    const [mr, mg, mb] = hexToRgb(mapped);
                    return `rgba(${mr}, ${mg}, ${mb}, ${a})`;
                }
                return mapped;
            });
        return { html, count };
    };

    const BRAND_LAW_CSS = `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&family=Archivo:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style data-grow-rebrand>
      /* ── GROW BRAND LAW — injected by the Rebrander Engine ── */
      :root {
        --color-stark-white: ${BRAND.starkWhite};
        --color-alabaster: ${BRAND.alabaster};
        --color-charcoal-slate: ${BRAND.charcoal};
        --color-electric-indigo: ${BRAND.indigo};
      }
      body {
        background-color: ${BRAND.alabaster} !important;
        color: ${BRAND.charcoal} !important;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Archivo", "Helvetica Neue", sans-serif !important;
      }
      h1, h2, h3, h4, h5, h6 {
        font-family: "Neue Montreal", "Helvetica Now Display", "Archivo", "Helvetica Neue", sans-serif !important;
        color: ${BRAND.charcoal} !important;
        letter-spacing: -0.02em;
      }
      p, li, span, td, th, label { color: ${BRAND.charcoal}; }
      a { color: ${BRAND.indigo} !important; }
      button, .btn, [type="submit"], [type="button"], [class*="cta"], [class*="button"] {
        background: ${BRAND.indigo} !important;
        background-image: none !important;
        color: ${BRAND.starkWhite} !important;
        border: none !important;
        border-radius: 8px !important;
        font-family: "Archivo", "Helvetica Neue", sans-serif !important;
        font-weight: 700 !important;
        letter-spacing: 0.01em;
      }
      section, article, .card, [class*="card"], [class*="panel"], [class*="box"] {
        border-radius: 8px;
      }
      code, pre, kbd, samp, [class*="metric"], [class*="stat"] {
        font-family: "Roboto Mono", monospace !important;
      }
      img { filter: saturate(0.85); }
      hr { border-color: rgba(26, 32, 44, 0.08) !important; }
    </style>`;

    const rebrand = (html) => {
        const { html: remapped, count } = remapColors(html);
        let branded = remapped;
        if (/<\/head>/i.test(branded)) {
            branded = branded.replace(/<\/head>/i, `${BRAND_LAW_CSS}\n</head>`);
        } else if (/<html[^>]*>/i.test(branded)) {
            branded = branded.replace(/(<html[^>]*>)/i, `$1\n<head>${BRAND_LAW_CSS}</head>`);
        } else {
            branded = `${BRAND_LAW_CSS}\n${branded}`;
        }
        // Stamp of process
        branded = branded.replace(/<body([^>]*)>/i,
            `<body$1>\n<!-- REBRANDED BY GROW · ${count} color literals remapped to palette law -->`);
        return branded;
    };

    const runRebrand = () => {
        const raw = rbInput.value.trim();
        if (!raw) {
            rbInput.focus();
            rbInput.placeholder = 'Paste HTML first, or press Load Sample…';
            return;
        }
        const branded = rebrand(raw);
        state.brandedHtml = branded;
        rbBefore.srcdoc = raw;
        rbAfter.srcdoc = branded;
        rbCompare.hidden = false;
        rbDownload.disabled = false;
    };

    rbRun.addEventListener('click', runRebrand);

    rbLoadSample.addEventListener('click', async () => {
        try {
            const res = await fetch('sample-unbranded.html');
            rbInput.value = await res.text();
            runRebrand();
        } catch {
            rbInput.placeholder = 'Could not load sample file (sample-unbranded.html).';
        }
    });

    rbUploadBtn.addEventListener('click', () => rbFileInput.click());
    rbFileInput.addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        rbInput.value = await file.text();
        runRebrand();
    });

    rbDownload.addEventListener('click', () => {
        if (!state.brandedHtml) return;
        const blob = new Blob([state.brandedHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'grow-branded.html';
        a.click();
        URL.revokeObjectURL(url);
    });

    // ─────────────────────────────────────────────────────
    // 10. CONTRAST COMPLIANCE MATRIX (WCAG 2.1)
    // ─────────────────────────────────────────────────────
    const relLuminance = ([r, g, b]) => {
        const f = (v) => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const contrastRatio = (hexA, hexB) => {
        const L1 = relLuminance(hexToRgb(hexA));
        const L2 = relLuminance(hexToRgb(hexB));
        const [hi, lo] = L1 >= L2 ? [L1, L2] : [L2, L1];
        return (hi + 0.05) / (lo + 0.05);
    };

    const contrastTable = document.getElementById('contrast-table');
    const PAIRS = [
        { fg: BRAND.charcoal, bg: BRAND.starkWhite, label: 'Charcoal / White' },
        { fg: BRAND.charcoal, bg: BRAND.alabaster, label: 'Charcoal / Alabaster' },
        { fg: BRAND.starkWhite, bg: BRAND.indigo, label: 'White / Indigo' },
        { fg: BRAND.indigo, bg: BRAND.starkWhite, label: 'Indigo / White' },
        { fg: BRAND.indigo, bg: BRAND.alabaster, label: 'Indigo / Alabaster' },
        { fg: BRAND.starkWhite, bg: BRAND.charcoal, label: 'White / Charcoal' }
    ];
    if (contrastTable) {
        PAIRS.forEach(pair => {
            const ratio = contrastRatio(pair.fg, pair.bg);
            const badge = ratio >= 7 ? ['AAA', 'pass'] : ratio >= 4.5 ? ['AA', 'pass'] : ratio >= 3 ? ['AA-LARGE', 'large'] : ['FAIL', 'fail'];
            const cell = document.createElement('div');
            cell.className = 'contrast-cell';
            cell.innerHTML = `
                <span class="contrast-sample" style="color:${pair.fg};background:${pair.bg};border:1px solid var(--border-color)">Aa</span>
                <span class="contrast-score">${pair.label}<br>${ratio.toFixed(2)} : 1 <span class="contrast-badge ${badge[1]}">${badge[0]}</span></span>`;
            contrastTable.appendChild(cell);
        });
    }

    // ─────────────────────────────────────────────────────
    // 11. TYPOGRAPHY TESTER
    // ─────────────────────────────────────────────────────
    fontSizeSlider.addEventListener('input', (e) => {
        const scale = e.target.value;
        fontSizeVal.textContent = `${scale}x`;
        fontPreviewArea.querySelector('.tester-h').style.fontSize = `${2.0 * scale}rem`;
        fontPreviewArea.querySelector('.tester-p').style.fontSize = `${0.95 * scale}rem`;
        fontPreviewArea.querySelector('.tester-mono').style.fontSize = `${0.7 * scale}rem`;
    });

    fontFamilySelect.addEventListener('change', (e) => {
        fontPreviewArea.querySelector('.tester-h').style.fontFamily = e.target.value;
    });


    // ─────────────────────────────────────────────────────
    // 13. BRAND KIT — Dynamic Logo System
    // ─────────────────────────────────────────────────────
    const GMARK_PATHS = `
      <g stroke-width="5.5" stroke-linecap="square" fill="none">
        <path d="M 31,5 H 69 L 95,31 V 42 M 95,66 V 69 L 69,95 H 31 L 5,69 V 31 Z"/>
        <path d="M 35,15 H 65 L 85,35 V 42 M 85,66 V 65 L 65,85 H 35 L 15,65 V 35 Z"/>
        <path d="M 39,25 H 61 L 75,39 V 42 M 75,66 V 61 L 61,75 H 39 L 25,61 V 39 Z"/>
        <path d="M 97,46 H 50"/><path d="M 97,54 H 58"/><path d="M 97,62 H 66"/>
      </g>`;

    const LOGOS = {
        primary: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" stroke="${BRAND.indigo}">${GMARK_PATHS}</svg>`,
        lockup: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 100">
          <g stroke="${BRAND.indigo}" transform="scale(0.9) translate(5,5)">${GMARK_PATHS}</g>
          <text x="120" y="68" font-family="Archivo, 'Helvetica Neue', sans-serif" font-weight="800" font-size="52" letter-spacing="-2" fill="currentColor">GROW</text>
        </svg>`,
        mono: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" stroke="currentColor">${GMARK_PATHS}</svg>`
    };

    const logoSystem = document.getElementById('logo-system');
    if (logoSystem) {
        document.querySelectorAll('.logo-stage').forEach(stage => {
            stage.innerHTML = LOGOS[stage.dataset.logo] || '';
        });

        const envToggle = document.getElementById('logo-env-toggle');
        const envLabel = document.getElementById('logo-env-label');
        envToggle.addEventListener('change', () => {
            logoSystem.classList.toggle('env-dark', envToggle.checked);
            envLabel.textContent = envToggle.checked ? 'DARK ENV' : 'LIGHT ENV';
        });

        document.querySelectorAll('.copy-svg-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // Export with explicit charcoal where the preview used currentColor
                const svg = (LOGOS[btn.dataset.logo] || '').replace(/currentColor/g, BRAND.charcoal);
                navigator.clipboard.writeText(svg.trim()).then(() => {
                    btn.classList.add('copied');
                    const orig = btn.textContent;
                    btn.textContent = 'COPIED';
                    setTimeout(() => { btn.classList.remove('copied'); btn.textContent = orig; }, 1600);
                });
            });
        });
    }


    // Typography Deployment — live dual specimen
    const specInput = document.getElementById('type-specimen-input');
    const specHeader = document.getElementById('spec-header');
    const specMono = document.getElementById('spec-mono');
    if (specInput) {
        specInput.addEventListener('input', () => {
            const v = specInput.value || 'Clarity at Scale.';
            specHeader.textContent = v;
            specMono.textContent = v;
        });
    }

    // ─────────────────────────────────────────────────────
    // 14. BRAND KIT — download micro-readout + vanilla ZIP
    // ─────────────────────────────────────────────────────
    const downloadBlob = (blob, filename) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Monospace loading readout: [INITIATING...] → [PACKAGING_DATA] → [DOWNLOAD_SECURE]
    const runReadout = (el, steps, stepMs, done) => {
        const original = el.textContent;
        let i = 0;
        const tick = () => {
            if (i < steps.length) {
                el.textContent = steps[i++];
                setTimeout(tick, stepMs);
            } else {
                done(() => { el.textContent = original; });
            }
        };
        tick();
    };

    // Minimal ZIP writer — STORE method + CRC-32, zero dependencies.
    const CRC_TABLE = (() => {
        const t = new Uint32Array(256);
        for (let n = 0; n < 256; n++) {
            let c = n;
            for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
            t[n] = c >>> 0;
        }
        return t;
    })();
    const crc32 = (bytes) => {
        let c = 0xFFFFFFFF;
        for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
        return (c ^ 0xFFFFFFFF) >>> 0;
    };
    const makeZip = (entries) => {
        const enc = new TextEncoder();
        const chunks = [];
        const central = [];
        let offset = 0;
        entries.forEach(e => {
            const nameBytes = enc.encode(e.name);
            const data = e.data;
            const crc = crc32(data);
            const header = new DataView(new ArrayBuffer(30));
            header.setUint32(0, 0x04034b50, true);
            header.setUint16(4, 20, true);
            header.setUint32(14, crc, true);
            header.setUint32(18, data.length, true);
            header.setUint32(22, data.length, true);
            header.setUint16(26, nameBytes.length, true);
            chunks.push(new Uint8Array(header.buffer), nameBytes, data);

            const c = new DataView(new ArrayBuffer(46));
            c.setUint32(0, 0x02014b50, true);
            c.setUint16(4, 20, true);
            c.setUint16(6, 20, true);
            c.setUint32(16, crc, true);
            c.setUint32(20, data.length, true);
            c.setUint32(24, data.length, true);
            c.setUint16(28, nameBytes.length, true);
            c.setUint32(42, offset, true);
            central.push(new Uint8Array(c.buffer), nameBytes);
            offset += 30 + nameBytes.length + data.length;
        });
        let centralSize = 0;
        central.forEach(b => centralSize += b.length);
        const end = new DataView(new ArrayBuffer(22));
        end.setUint32(0, 0x06054b50, true);
        end.setUint16(8, entries.length, true);
        end.setUint16(10, entries.length, true);
        end.setUint32(12, centralSize, true);
        end.setUint32(16, offset, true);
        return new Blob([...chunks, ...central, new Uint8Array(end.buffer)], { type: 'application/zip' });
    };

    const BRAND_TOKENS_CSS = `:root {
  --color-stark-white: ${BRAND.starkWhite};
  --color-alabaster: ${BRAND.alabaster};
  --color-charcoal-slate: ${BRAND.charcoal};
  --color-electric-indigo: ${BRAND.indigo};
  --color-indigo-deep: ${BRAND.indigoDeep};
  --font-header: 'Neue Montreal', 'Helvetica Now Display', 'Archivo', 'Helvetica Neue', sans-serif;
  --font-body: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Archivo', sans-serif;
  --font-data: 'Roboto Mono', 'SF Mono', monospace;
  --radius-card: 8px;
  --grid-unit: 8px;
}`;

    const BRAND_TOKENS_JSON = JSON.stringify({
        name: 'GROW — Institutional Tech',
        version: '3.1.0',
        color: {
            'stark-white': { value: BRAND.starkWhite, role: 'Background Depth / Cards (light) · Highlights (dark)' },
            'alabaster': { value: BRAND.alabaster, role: 'Page Body Background (light) · Muted Text (dark)' },
            'charcoal-slate': { value: BRAND.charcoal, role: 'Headings & Borders (light) · Page BG / Dark Cards (dark)' },
            'electric-indigo': { value: BRAND.indigo, role: 'Data Viz / Actions / Gradients' },
            'indigo-deep': { value: BRAND.indigoDeep, role: 'Gradient tail / pressed states' },
            'slate-text': { value: BRAND.slateText, role: 'Secondary text' }
        },
        font: {
            header: { family: 'Neue Montreal / Helvetica Now → Archivo', weights: [600, 700, 800] },
            body: { family: 'SF Pro (system) → Archivo', weights: [400, 500] },
            data: { family: 'Roboto Mono', weights: [400, 500, 700] }
        },
        radius: { card: 8, pill: 999 },
        spacing: { unit: 8, cardGap: 16, cardPadding: 24 },
        rules: ['Bento-box isolation — no overlaps', '8px coordinate grid', 'Indigo strictly for data signals & interaction', 'Monospace for all metrics']
    }, null, 2);

    const VOICE_RULES_TXT = [
        'GROW VOICE — QUIETLY DOMINANT. HYPER-ORGANIZED. INTENSE & VISIONARY.',
        '',
        'Speak in absolute facts. Zero fluff. Zero pleading.',
        'Vocabulary: Infrastructure / Ecosystems / Predictive Modeling / Clarity at Scale.',
        '',
        'BANNED: very, really, super, world-class, cutting-edge, revolutionary, exclamation marks.',
        'SWAPS: awesome→engineered · easy→deterministic · fast→at production frequency ·',
        '        dashboard→command surface · tools→systems · business→operation.',
        'Every statement terminates with a period. Declarative, never rhetorical.'
    ].join('\n');

    const GUIDELINES_MD = `# GROW — Institutional Tech Brand Guidelines\n\n> Integrated Creative & Enterprise Infrastructure Operating as One.\n> Stripe meets McKinsey: hyper-clean, organized, quiet unquestionable authority.\n\n## Palette\n| Token | Hex | Light role | Dark role |\n|---|---|---|---|\n| Stark White | ${BRAND.starkWhite} | Cards / depth | Highlights |\n| Alabaster | ${BRAND.alabaster} | Page body | Muted text |\n| Charcoal Slate | ${BRAND.charcoal} | Headings & borders | Page bg / dark cards |\n| Electric Indigo | ${BRAND.indigo} | Data viz / actions | Accent glow |\n\n## Typography\n- Headers: Neue Montreal / Helvetica Now (web fallback: Archivo)\n- Body: SF Pro system stack\n- Space/Data: Roboto Mono — all metrics, file sizes, technical readouts\n\n## Pillars\n1. Bento-box isolation — every element inside a bordered coordinate.\n2. Stark negative space — breathing room is structure.\n3. Restrained chroma — indigo only for live data and interaction.\n4. Mesh grids + indigo fills + monospace labels in all data viz.\n`;

    const vaultBtn = document.getElementById('vault-download');
    const vaultLabel = document.getElementById('vault-btn-label');
    const vaultMetaEl = document.getElementById('vault-btn-meta');
    if (vaultBtn) {
        vaultBtn.addEventListener('click', () => {
            vaultBtn.classList.add('working');
            runReadout(vaultLabel, ['[INITIATING...]', '[PACKAGING_DATA]', '[CHECKSUMMING_CRC32]'], 420, async (restore) => {
                const enc = new TextEncoder();
                const entries = [
                    { name: 'GROW-BRAND-GUIDELINES.md', data: enc.encode(GUIDELINES_MD) },
                    { name: 'logos/grow-mark-primary.svg', data: enc.encode(LOGOS.primary) },
                    { name: 'logos/grow-lockup-secondary.svg', data: enc.encode(LOGOS.lockup.replace(/currentColor/g, BRAND.charcoal)) },
                    { name: 'logos/grow-mark-monotone.svg', data: enc.encode(LOGOS.mono.replace(/currentColor/g, BRAND.charcoal)) },
                    { name: 'tokens/brand-tokens.css', data: enc.encode(BRAND_TOKENS_CSS) },
                    { name: 'tokens/brand-tokens.figma.json', data: enc.encode(BRAND_TOKENS_JSON) },
                    { name: 'voice/voice-rules.txt', data: enc.encode(VOICE_RULES_TXT) }
                ];
                try {
                    const res = await fetch('logo.jpg');
                    if (res.ok) entries.push({ name: 'assets/grow-logo.jpg', data: new Uint8Array(await res.arrayBuffer()) });
                } catch { /* asset fetch unavailable — vault ships without the raster */ }

                const blob = makeZip(entries);
                const kb = blob.size / 1024;
                const sizeLabel = kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(1)} KB`;
                vaultLabel.textContent = '[DOWNLOAD_SECURE]';
                vaultMetaEl.textContent = `[.ZIP // ${sizeLabel} // ${entries.length} ASSETS // CRC-32 VERIFIED]`;
                downloadBlob(blob, 'grow-brand-vault.zip');
                setTimeout(() => { restore(); vaultBtn.classList.remove('working'); }, 1600);
            });
        });
    }

    // Figma tokens download
    const figmaBtn = document.getElementById('dl-figma-tokens');
    if (figmaBtn) {
        figmaBtn.addEventListener('click', () => {
            runReadout(figmaBtn, ['[INITIATING...]', '[PACKAGING_DATA]'], 350, (restore) => {
                figmaBtn.textContent = '[DOWNLOAD_SECURE]';
                downloadBlob(new Blob([BRAND_TOKENS_JSON], { type: 'application/json' }), 'brand-tokens.json');
                setTimeout(restore, 1200);
            });
        });
    }

    // ─────────────────────────────────────────────────────
    // 15. BRAND KIT — 3D tilt physics for template cards
    // ─────────────────────────────────────────────────────
    document.querySelectorAll('.tilt-card').forEach(card => {
        const MAX_TILT = 7;
        card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            card.classList.add('tilting');
            card.style.transform = `perspective(1000px) rotateX(${(-py * MAX_TILT).toFixed(2)}deg) rotateY(${(px * MAX_TILT).toFixed(2)}deg) translateZ(0)`;
        });
        card.addEventListener('mouseleave', () => {
            card.classList.remove('tilting');
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        });
    });

    // ─────────────────────────────────────────────────────
    // 16. DOCUMENT STUDIO — branded production documents
    // ─────────────────────────────────────────────────────
    const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const fmtMoney = (n) => '$' + (Number(n) || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });
    const todayISO = () => new Date().toISOString().slice(0, 10);
    const docRef = (prefix) => `${prefix}-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const lines = (txt) => String(txt || '').split('\n').map(l => l.trim()).filter(Boolean);

    const DOC_TYPES = {
        proposal: {
            label: 'Proposal', ref: 'GROW-PRP',
            fields: [
                { k: 'client', l: 'Client Contact', d: '', ph: 'Layla Mansour' },
                { k: 'company', l: 'Client Company', d: '', ph: 'NileWear Apparel' },
                { k: 'project', l: 'Project Title', d: '', ph: 'Integrated Growth Program', span: 2 },
                { k: 'date', l: 'Date', t: 'date', d: todayISO() },
                { k: 'validity', l: 'Valid For (days)', t: 'number', d: '30' },
                { k: 'summary', l: 'Executive Summary', t: 'textarea', d: '', ph: 'The engagement consolidates brand, media, and data infrastructure into one operating system…', span: 2 }
            ],
            items: { title: 'SCOPE & INVESTMENT', cols: ['Deliverable', 'Qty', 'Unit Price ($)'], totals: true,
                     seed: [['Diagnostic & growth architecture', 1, 8000], ['Performance media management (monthly)', 3, 4500], ['Content engine setup', 1, 6000]] }
        },
        invoice: {
            label: 'Invoice', ref: 'GROW-INV',
            fields: [
                { k: 'company', l: 'Bill To — Company', d: '', ph: 'Delta Logistics' },
                { k: 'client', l: 'Attention', d: '', ph: 'Omar El-Sayed' },
                { k: 'date', l: 'Issue Date', t: 'date', d: todayISO() },
                { k: 'due', l: 'Due Date', t: 'date', d: '' },
                { k: 'tax', l: 'Tax Rate (%)', t: 'number', d: '14' },
                { k: 'notes', l: 'Payment Notes', t: 'textarea', d: 'Bank transfer to the account on file. Reference the invoice number.', span: 2 }
            ],
            items: { title: 'BILLABLE ITEMS', cols: ['Description', 'Qty', 'Unit Price ($)'], totals: true,
                     seed: [['Phase 1 — Diagnostic & growth architecture', 1, 8000]] }
        },
        sow: {
            label: 'Scope of Work', ref: 'GROW-SOW',
            fields: [
                { k: 'company', l: 'Client Company', d: '', ph: 'Aurora Group' },
                { k: 'project', l: 'Project Title', d: '', ph: 'Content Engine Deployment' },
                { k: 'date', l: 'Date', t: 'date', d: todayISO() },
                { k: 'weeks', l: 'Timeline (weeks)', t: 'number', d: '8' },
                { k: 'objective', l: 'Objective', t: 'textarea', d: '', ph: 'Deploy an editorial system publishing across 4 markets with full attribution…', span: 2 },
                { k: 'deliverables', l: 'Deliverables (one per line)', t: 'textarea', d: 'Editorial calendar & governance model\nProduction pipeline with approval gates\nAttribution dashboard', span: 2 },
                { k: 'assumptions', l: 'Assumptions (one per line)', t: 'textarea', d: 'Client provides brand assets and platform access\nFeedback cycles within 3 business days', span: 2 },
                { k: 'acceptance', l: 'Acceptance Criteria (one per line)', t: 'textarea', d: 'All deliverables reviewed and signed off by client sponsor', span: 2 }
            ]
        },
        audit: {
            label: 'Growth Audit Report', ref: 'GROW-AUD',
            fields: [
                { k: 'company', l: 'Client Company', d: '', ph: 'Gulf Estates' },
                { k: 'date', l: 'Audit Date', t: 'date', d: todayISO() },
                { k: 's1', l: 'Score — Brand & Creative (0-100)', t: 'number', d: '62' },
                { k: 's2', l: 'Score — Media Efficiency (0-100)', t: 'number', d: '48' },
                { k: 's3', l: 'Score — Content Output (0-100)', t: 'number', d: '55' },
                { k: 's4', l: 'Score — Data Infrastructure (0-100)', t: 'number', d: '34' },
                { k: 'findings', l: 'Key Findings (one per line)', t: 'textarea', d: 'No unified attribution across Meta and GA4\nCAC rose 38% over two quarters with flat conversion\nContent cadence is ad-hoc with no measurable reach targets', span: 2 },
                { k: 'recs', l: 'Recommendations (one per line)', t: 'textarea', d: 'Deploy verified data layer before scaling spend\nRestructure funnel measurement around revenue events\nInstall content engine with weekly industrial cadence', span: 2 }
            ]
        },
        media: {
            label: 'Media Plan', ref: 'GROW-MED',
            fields: [
                { k: 'company', l: 'Client Company', d: '', ph: 'Cairo Bites' },
                { k: 'period', l: 'Flight Period', d: '', ph: 'Q3 2026 (Jul 1 — Sep 30)' },
                { k: 'date', l: 'Date', t: 'date', d: todayISO() },
                { k: 'objective', l: 'Campaign Objective', t: 'textarea', d: '', ph: 'Launch delivery app in 3 governorates; target CAC ≤ $4.20…', span: 2 }
            ],
            items: { title: 'CHANNEL ALLOCATION', cols: ['Channel', 'Budget ($)', 'KPI Target'], totals: 'budget',
                     seed: [['Meta (Feed + Reels)', 18000, 'CAC ≤ $4.20'], ['Google Search + PMax', 12000, 'ROAS ≥ 3.5'], ['TikTok Spark Ads', 8000, 'CPM ≤ $2.80'], ['Programmatic OOH', 5000, '2.1M impressions']] }
        },
        report: {
            label: 'Performance Report', ref: 'GROW-RPT',
            fields: [
                { k: 'company', l: 'Client Company', d: '', ph: 'NileWear Apparel' },
                { k: 'period', l: 'Reporting Period', d: '', ph: 'May 2026' },
                { k: 'date', l: 'Date', t: 'date', d: todayISO() },
                { k: 'k1', l: 'Revenue Influenced ($)', t: 'number', d: '412000' },
                { k: 'k2', l: 'Media Spend ($)', t: 'number', d: '46000' },
                { k: 'k3', l: 'ROAS', t: 'number', d: '8.9' },
                { k: 'k4', l: 'CAC ($)', t: 'number', d: '3.85' },
                { k: 'highlights', l: 'Highlights (one per line)', t: 'textarea', d: 'Creative test #418 reached significance; winner scaled to 100%\nSearch restructure cut wasted spend 22%', span: 2 },
                { k: 'next', l: 'Next Actions (one per line)', t: 'textarea', d: 'Shift 15% of Meta budget to highest-yield cohort\nLaunch seasonality model for Q3 forecast', span: 2 }
            ]
        }
    };

    const dsForm = document.getElementById('ds-form');
    const dsItemsWrap = document.getElementById('ds-items-wrap');
    const dsItems = document.getElementById('ds-items');
    const dsItemsTitle = document.getElementById('ds-items-title');
    const dsItemsTotal = document.getElementById('ds-items-total');
    const dsGenerate = document.getElementById('ds-generate');
    const dsDownloadBtn = document.getElementById('ds-download');
    let activeDoc = 'proposal';
    let lastDocHtml = null;
    let lastDocName = 'grow-document';

    const itemRow = (cols, vals = []) => {
        const row = document.createElement('div');
        row.className = 'ds-item-row';
        cols.forEach((c, i) => {
            const inp = document.createElement('input');
            inp.placeholder = c;
            inp.value = vals[i] ?? '';
            if (i > 0 && /\$|Qty|Budget/.test(c)) inp.type = 'text';
            inp.addEventListener('input', updateTotals);
            row.appendChild(inp);
        });
        const del = document.createElement('button');
        del.className = 'ds-row-del';
        del.textContent = '×';
        del.addEventListener('click', () => { row.remove(); updateTotals(); });
        row.appendChild(del);
        return row;
    };

    const readItems = () => [...dsItems.querySelectorAll('.ds-item-row')].map(r =>
        [...r.querySelectorAll('input')].map(i => i.value.trim())
    ).filter(vals => vals.some(Boolean));

    function updateTotals() {
        const spec = DOC_TYPES[activeDoc].items;
        if (!spec || !spec.totals) { dsItemsTotal.textContent = ''; return; }
        let total = 0;
        readItems().forEach(vals => {
            if (spec.totals === 'budget') total += Number(vals[1]) || 0;
            else total += (Number(vals[1]) || 0) * (Number(vals[2]) || 0);
        });
        dsItemsTotal.textContent = `TOTAL: ${fmtMoney(total)}`;
    }

    const renderDocForm = (type) => {
        activeDoc = type;
        const spec = DOC_TYPES[type];
        dsForm.innerHTML = '';
        spec.fields.forEach(f => {
            const wrap = document.createElement('div');
            wrap.className = 'ds-field' + (f.span === 2 ? ' span-2' : '');
            const label = document.createElement('label');
            label.textContent = f.l;
            const input = document.createElement(f.t === 'textarea' ? 'textarea' : 'input');
            if (f.t && f.t !== 'textarea') input.type = f.t;
            input.value = f.d ?? '';
            if (f.ph) input.placeholder = f.ph;
            input.dataset.key = f.k;
            wrap.appendChild(label);
            wrap.appendChild(input);
            dsForm.appendChild(wrap);
        });
        if (spec.items) {
            dsItemsWrap.hidden = false;
            dsItemsTitle.textContent = spec.items.title;
            dsItems.innerHTML = '';
            (spec.items.seed || [[]]).forEach(seed => dsItems.appendChild(itemRow(spec.items.cols, seed)));
            updateTotals();
        } else {
            dsItemsWrap.hidden = true;
        }
        dsDownloadBtn.disabled = true;
        lastDocHtml = null;
    };

    document.querySelectorAll('.doc-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.doc-type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderDocForm(btn.dataset.doc);
        });
    });
    document.getElementById('ds-add-row').addEventListener('click', () => {
        dsItems.appendChild(itemRow(DOC_TYPES[activeDoc].items.cols));
    });

    const readForm = () => {
        const d = {};
        dsForm.querySelectorAll('[data-key]').forEach(i => d[i.dataset.key] = i.value.trim());
        return d;
    };

    // Shared letterheaded A4 shell — brand law enforced.
    const docShell = (title, ref, metaRows, bodyHtml) => `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>${esc(title)} — GROW</title>
<link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&family=Archivo:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  :root { --ink:#1A202C; --paper:#FFFFFF; --soft:#F8F9FA; --line:#E2E8F0; --indigo:#4F46E5; }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--soft); color:var(--ink);
         font: 14px/1.6 -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Archivo', sans-serif; }
  .sheet { max-width: 800px; margin: 24px auto; background: var(--paper); padding: 56px 64px;
           border: 1px solid var(--line); }
  header.lh { display:flex; justify-content:space-between; align-items:flex-start;
              border-bottom: 2px solid var(--ink); padding-bottom: 20px; margin-bottom: 28px; }
  .lh-brand { display:flex; align-items:center; gap:14px; }
  .lh-brand svg { width:44px; height:44px; }
  .lh-name { font-family:'Archivo'; font-weight:800; font-size:26px; letter-spacing:-1px; }
  .lh-tag { font-family:'Roboto Mono'; font-size:9px; letter-spacing:1.5px; color:#4A5568; }
  .lh-meta { text-align:right; font-family:'Roboto Mono'; font-size:10px; line-height:1.9; color:#4A5568; }
  .lh-meta b { color: var(--ink); }
  h1.doc-title { font-family:'Archivo'; font-weight:800; font-size:24px; letter-spacing:-0.5px;
                 margin:0 0 4px; text-transform:uppercase; }
  .doc-ref { font-family:'Roboto Mono'; font-size:10px; letter-spacing:1px; color:var(--indigo); margin-bottom:26px; }
  h2.sec { font-family:'Archivo'; font-weight:700; font-size:12px; letter-spacing:1.6px;
           text-transform:uppercase; color:#4A5568; border-bottom:1px solid var(--line);
           padding-bottom:6px; margin:28px 0 12px; }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  th { font-family:'Roboto Mono'; font-size:9px; letter-spacing:1px; text-transform:uppercase;
       text-align:left; color:#4A5568; border-bottom:1px solid var(--ink); padding:7px 8px; }
  td { border-bottom:1px solid var(--line); padding:9px 8px; vertical-align:top; }
  td.num, th.num { text-align:right; font-family:'Roboto Mono'; font-size:12px; }
  .total-row td { border-bottom:none; border-top:2px solid var(--ink);
                  font-family:'Archivo'; font-weight:800; }
  .total-row .grand { color: var(--indigo); font-size:16px; }
  ul.fact, ol.fact { margin:0; padding-left:20px; } ul.fact li, ol.fact li { margin:6px 0; }
  .kpis { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin:8px 0 4px; }
  .kpi { border:1px solid var(--line); padding:14px 12px; }
  .kpi b { display:block; font-family:'Archivo'; font-weight:800; font-size:20px; letter-spacing:-0.5px; }
  .kpi.hero b { color: var(--indigo); }
  .kpi span { font-family:'Roboto Mono'; font-size:8.5px; letter-spacing:1px; color:#4A5568; text-transform:uppercase; }
  .score { margin:10px 0; }
  .score-head { display:flex; justify-content:space-between; font-family:'Roboto Mono'; font-size:10px; margin-bottom:4px; }
  .score-track { height:8px; background:var(--soft); border:1px solid var(--line); }
  .score-fill { height:100%; background:var(--indigo); }
  .sig-row { display:grid; grid-template-columns:1fr 1fr; gap:48px; margin-top:48px; }
  .sig { border-top:1px solid var(--ink); padding-top:8px; font-family:'Roboto Mono'; font-size:10px; color:#4A5568; }
  footer.doc { margin-top:40px; padding-top:14px; border-top:1px solid var(--line);
               display:flex; justify-content:space-between; font-family:'Roboto Mono';
               font-size:9px; letter-spacing:0.8px; color:#4A5568; }
  .print-bar { max-width:800px; margin:16px auto 0; display:flex; justify-content:flex-end; }
  .print-bar button { font-family:'Roboto Mono'; font-size:11px; letter-spacing:1px; cursor:pointer;
                      background:var(--indigo); color:#fff; border:none; padding:10px 22px; border-radius:6px; }
  @media print { body{background:#fff} .sheet{margin:0;border:none;max-width:none;padding:40px 48px} .print-bar{display:none} }
</style></head><body>
<div class="print-bar"><button onclick="window.print()">PRINT / SAVE AS PDF</button></div>
<div class="sheet">
  <header class="lh">
    <div class="lh-brand">
      <svg viewBox="0 0 100 100" stroke="#4F46E5">${GMARK_PATHS}</svg>
      <div><div class="lh-name">GROW</div>
      <div class="lh-tag">INTEGRATED CREATIVE &amp; ENTERPRISE INFRASTRUCTURE</div></div>
    </div>
    <div class="lh-meta">${metaRows.map(r => `${esc(r[0])}: <b>${esc(r[1])}</b>`).join('<br>')}</div>
  </header>
  <h1 class="doc-title">${esc(title)}</h1>
  <div class="doc-ref">${esc(ref)}</div>
  ${bodyHtml}
  <footer class="doc">
    <span>GROW — OPERATING AS ONE.</span>
    <span>CONFIDENTIAL // PREPARED UNDER BRAND LAW v3</span>
  </footer>
</div></body></html>`;

    const itemsTable = (cols, rows, totalsMode) => {
        let total = 0;
        const body = rows.map(vals => {
            if (totalsMode === 'budget') {
                total += Number(vals[1]) || 0;
                return `<tr><td>${esc(vals[0])}</td><td class="num">${fmtMoney(vals[1])}</td><td>${esc(vals[2] || '')}</td></tr>`;
            }
            const line = (Number(vals[1]) || 0) * (Number(vals[2]) || 0);
            total += line;
            return `<tr><td>${esc(vals[0])}</td><td class="num">${esc(vals[1])}</td><td class="num">${fmtMoney(vals[2])}</td><td class="num">${fmtMoney(line)}</td></tr>`;
        }).join('');
        const head = totalsMode === 'budget'
            ? `<th>${cols[0]}</th><th class="num">${cols[1]}</th><th>${cols[2]}</th>`
            : `<th>${cols[0]}</th><th class="num">${cols[1]}</th><th class="num">${cols[2]}</th><th class="num">Line Total</th>`;
        const totalRow = totalsMode === 'budget'
            ? `<tr class="total-row"><td>TOTAL BUDGET</td><td class="num grand">${fmtMoney(total)}</td><td></td></tr>`
            : `<tr class="total-row"><td colspan="3">TOTAL INVESTMENT</td><td class="num grand">${fmtMoney(total)}</td></tr>`;
        return { html: `<table><thead><tr>${head}</tr></thead><tbody>${body}${totalRow}</tbody></table>`, total };
    };

    const factList = (txt, ordered = false) => {
        const ls = lines(txt);
        if (!ls.length) return '<p>—</p>';
        const tag = ordered ? 'ol' : 'ul';
        return `<${tag} class="fact">${ls.map(l => `<li>${esc(l)}</li>`).join('')}</${tag}>`;
    };

    const DOC_BUILDERS = {
        proposal(d, items) {
            const ref = docRef('GROW-PRP');
            const t = itemsTable(DOC_TYPES.proposal.items.cols, items);
            return { ref, title: d.project || 'Growth Proposal', html: docShell(`Proposal — ${d.project || 'Growth Program'}`, ref,
                [['DATE', d.date], ['CLIENT', d.company || '—'], ['VALID', `${d.validity || 30} DAYS`]],
                `<h2 class="sec">Prepared For</h2><p><b>${esc(d.client || '—')}</b> · ${esc(d.company || '—')}</p>
                 <h2 class="sec">Executive Summary</h2><p>${esc(d.summary || '—')}</p>
                 <h2 class="sec">Scope &amp; Investment</h2>${t.html}
                 <h2 class="sec">Engagement Protocol</h2>
                 <ol class="fact"><li>Diagnose — bottlenecks measured and ranked by revenue impact.</li>
                 <li>Strategize — integrated architecture with predictive ROI modeling.</li>
                 <li>Execute — campaigns ship, systems deploy, telemetry tracks every metric.</li></ol>
                 <div class="sig-row"><div class="sig">FOR GROW — DATE / SIGNATURE</div><div class="sig">FOR ${esc((d.company || 'CLIENT').toUpperCase())} — DATE / SIGNATURE</div></div>`) };
        },
        invoice(d, items) {
            const ref = docRef('GROW-INV');
            const t = itemsTable(DOC_TYPES.invoice.items.cols, items);
            const tax = t.total * ((Number(d.tax) || 0) / 100);
            return { ref, title: `Invoice ${ref}`, html: docShell('Tax Invoice', ref,
                [['ISSUED', d.date], ['DUE', d.due || '—'], ['STATUS', 'PAYABLE']],
                `<h2 class="sec">Bill To</h2><p><b>${esc(d.company || '—')}</b><br>Attn: ${esc(d.client || '—')}</p>
                 <h2 class="sec">Items</h2>${t.html}
                 <table style="margin-top:8px"><tbody>
                 <tr><td style="border:none"></td><td class="num" style="width:160px;border:none;font-family:'Roboto Mono';font-size:11px;color:#4A5568">TAX (${esc(d.tax || 0)}%)</td><td class="num" style="width:120px;border:none">${fmtMoney(tax)}</td></tr>
                 <tr class="total-row"><td style="border-top:none"></td><td class="num" style="width:160px">AMOUNT DUE</td><td class="num grand" style="width:120px">${fmtMoney(t.total + tax)}</td></tr>
                 </tbody></table>
                 <h2 class="sec">Payment</h2><p>${esc(d.notes || '—')}</p>`) };
        },
        sow(d) {
            const ref = docRef('GROW-SOW');
            return { ref, title: `SOW — ${d.project || 'Engagement'}`, html: docShell(`Scope of Work — ${d.project || ''}`, ref,
                [['DATE', d.date], ['CLIENT', d.company || '—'], ['TIMELINE', `${d.weeks || '—'} WEEKS`]],
                `<h2 class="sec">Objective</h2><p>${esc(d.objective || '—')}</p>
                 <h2 class="sec">Deliverables</h2>${factList(d.deliverables, true)}
                 <h2 class="sec">Timeline</h2><p>Execution window: <b>${esc(d.weeks || '—')} weeks</b> from countersignature. Weekly telemetry reviews; phase gates at diagnostic close and launch.</p>
                 <h2 class="sec">Assumptions</h2>${factList(d.assumptions)}
                 <h2 class="sec">Acceptance Criteria</h2>${factList(d.acceptance)}
                 <div class="sig-row"><div class="sig">FOR GROW — DATE / SIGNATURE</div><div class="sig">FOR ${esc((d.company || 'CLIENT').toUpperCase())} — DATE / SIGNATURE</div></div>`) };
        },
        audit(d) {
            const ref = docRef('GROW-AUD');
            const dims = [['Brand & Creative', d.s1], ['Media Efficiency', d.s2], ['Content Output', d.s3], ['Data Infrastructure', d.s4]];
            const avg = Math.round(dims.reduce((a, x) => a + (Number(x[1]) || 0), 0) / 4);
            const scoreBars = dims.map(([label, v]) => {
                const val = Math.max(0, Math.min(100, Number(v) || 0));
                return `<div class="score"><div class="score-head"><span>${esc(label).toUpperCase()}</span><span>${val} / 100</span></div>
                        <div class="score-track"><div class="score-fill" style="width:${val}%"></div></div></div>`;
            }).join('');
            return { ref, title: `Growth Audit — ${d.company || ''}`, html: docShell(`Growth Audit Report`, ref,
                [['DATE', d.date], ['SUBJECT', d.company || '—'], ['COMPOSITE', `${avg} / 100`]],
                `<h2 class="sec">Composite Maturity</h2>
                 <div class="kpis"><div class="kpi hero"><b>${avg}/100</b><span>Composite Score</span></div>
                 ${dims.map(([l, v]) => `<div class="kpi"><b>${Number(v) || 0}</b><span>${esc(l)}</span></div>`).slice(0, 3).join('')}</div>
                 <h2 class="sec">Dimension Scores</h2>${scoreBars}
                 <h2 class="sec">Key Findings</h2>${factList(d.findings)}
                 <h2 class="sec">Recommendations</h2>${factList(d.recs, true)}
                 <h2 class="sec">Method</h2><p>Scores derive from the GROW Digital Maturity framework: measured signals, verified sources, no estimates without labels.</p>`) };
        },
        media(d, items) {
            const ref = docRef('GROW-MED');
            const t = itemsTable(DOC_TYPES.media.items.cols, items, 'budget');
            return { ref, title: `Media Plan — ${d.company || ''}`, html: docShell(`Media Plan — ${d.period || ''}`, ref,
                [['DATE', d.date], ['CLIENT', d.company || '—'], ['FLIGHT', d.period || '—']],
                `<h2 class="sec">Objective</h2><p>${esc(d.objective || '—')}</p>
                 <h2 class="sec">Channel Allocation</h2>${t.html}
                 <h2 class="sec">Governance</h2>
                 <ul class="fact"><li>Budget shifts &gt; 10% require client approval through the portal.</li>
                 <li>Every metric carries a verified source reference (request ID + link).</li>
                 <li>Weekly anomaly detection on CAC and ROAS; flights pause on breach.</li></ul>`) };
        },
        report(d) {
            const ref = docRef('GROW-RPT');
            return { ref, title: `Performance — ${d.period || ''}`, html: docShell(`Performance Report — ${d.period || ''}`, ref,
                [['DATE', d.date], ['CLIENT', d.company || '—'], ['PERIOD', d.period || '—']],
                `<h2 class="sec">Headline Metrics</h2>
                 <div class="kpis">
                 <div class="kpi hero"><b>${fmtMoney(d.k1)}</b><span>Revenue Influenced</span></div>
                 <div class="kpi"><b>${fmtMoney(d.k2)}</b><span>Media Spend</span></div>
                 <div class="kpi"><b>${esc(d.k3 || '—')}x</b><span>ROAS</span></div>
                 <div class="kpi"><b>${fmtMoney(d.k4)}</b><span>CAC</span></div></div>
                 <h2 class="sec">Highlights</h2>${factList(d.highlights)}
                 <h2 class="sec">Next Actions</h2>${factList(d.next, true)}
                 <h2 class="sec">Data Integrity</h2><p>All figures reconcile to the Verifiable Data Layer; source request IDs available in the Growth Intelligence Platform.</p>`) };
        }
    };

    if (dsGenerate) {
        renderDocForm('proposal');

        dsGenerate.addEventListener('click', () => {
            const d = readForm();
            const built = DOC_BUILDERS[activeDoc](d, readItems());
            lastDocHtml = built.html;
            lastDocName = `${built.ref}.html`;
            const w = window.open('', '_blank');
            if (w) { w.document.write(built.html); w.document.close(); }
            dsDownloadBtn.disabled = false;
        });

        dsDownloadBtn.addEventListener('click', () => {
            if (!lastDocHtml) return;
            downloadBlob(new Blob([lastDocHtml], { type: 'text/html' }), lastDocName);
        });
    }

    // Deck template download — institutional title + agenda scaffold
    const deckBtn = document.getElementById('dl-deck-template');
    if (deckBtn) {
        deckBtn.addEventListener('click', () => {
            runReadout(deckBtn, ['[INITIATING...]', '[PACKAGING_DATA]'], 350, (restore) => {
                const slide = (inner, dark) => `<section class="slide${dark ? ' dark' : ''}">${inner}
                  <div class="slide-foot"><span>GROW — CONFIDENTIAL</span><span class="pg"></span></div></section>`;
                const deck = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>GROW Deck Template</title>
<link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&family=Archivo:wght@600;700;800&display=swap" rel="stylesheet">
<style>
 body{margin:0;background:#F8F9FA;font-family:'Archivo',sans-serif;color:#1A202C}
 .slide{width:960px;height:540px;margin:24px auto;background:#fff;border:1px solid #E2E8F0;
        padding:64px 72px;position:relative;display:flex;flex-direction:column;justify-content:center;page-break-after:always}
 .slide.dark{background:#1A202C;color:#fff}
 .eyebrow{font-family:'Roboto Mono';font-size:11px;letter-spacing:3px;color:#4F46E5;margin-bottom:18px}
 h1{font-size:54px;font-weight:800;letter-spacing:-2px;margin:0 0 14px;line-height:1.02}
 .slide.dark h1 .hi{color:#818CF8}
 p.lede{font-size:18px;color:#4A5568;max-width:620px;margin:0}
 .slide.dark p.lede{color:#A0AEC0}
 ol.agenda{font-size:22px;font-weight:700;line-height:2.1;margin:0;padding-left:28px}
 ol.agenda li::marker{font-family:'Roboto Mono';color:#4F46E5;font-size:14px}
 .slide-foot{position:absolute;left:72px;right:72px;bottom:28px;display:flex;justify-content:space-between;
             font-family:'Roboto Mono';font-size:9px;letter-spacing:1.5px;color:#94A3B8}
 @media print{body{background:#fff}.slide{margin:0;border:none}}
</style></head><body>
${slide(`<div class="eyebrow">INTEGRATED CREATIVE &amp; ENTERPRISE INFRASTRUCTURE</div>
<h1>GROW<br><span class="hi">Operating as One.</span></h1>
<p class="lede">Engagement review — replace this line with the client, period, and mandate. Quietly dominant. Facts first.</p>`, true)}
${slide(`<div class="eyebrow">AGENDA</div><h1 style="font-size:34px">Today's Coordinates.</h1>
<ol class="agenda"><li>State of the System</li><li>Verified Performance</li><li>Predictive Outlook</li><li>Resource Allocation</li><li>Decisions Required</li></ol>`)}
${slide(`<div class="eyebrow">SECTION DIVIDER</div><h1 style="font-size:44px">01 — State of the System<span style="color:#4F46E5">.</span></h1>
<p class="lede">Duplicate this slide per section. One claim per slide. Every number carries its source.</p>`)}
</body></html>`;
                deckBtn.textContent = '[DOWNLOAD_SECURE]';
                downloadBlob(new Blob([deck], { type: 'text/html' }), 'grow-deck-template.html');
                setTimeout(restore, 1200);
            });
        });
    }

    // ─────────────────────────────────────────────────────
    // 12. INITIAL RUNS
    // ─────────────────────────────────────────────────────
    initializeChart(state.chartRange);
});
