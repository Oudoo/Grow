/* ================================================================
   GROW ECOSYSTEM — Application Logic
   Handles: Tabs, Accordions, Timer, Save, Copy, PDF, Checklist
   ================================================================ */

(function () {
    'use strict';

    // ─── CONFIG ───
    const STORAGE_KEY = 'grow_playbook_data';
    const CLIENTS = ['nour', 'heka', 'hekap', 'base', 'roky', 'dental180'];
    const CLIENT_META = {
        nour: { name: 'Nour Clinic Elite', duration: 60, contact: 'Prof. Ahmed Adel Nour-Eldin' },
        heka: { name: 'Heka Cosmetics', duration: 60, contact: 'Heka Wellness Hub' },
        hekap: { name: 'Heka Pharmacy', duration: 60, contact: 'Heka Pharmacy' },
        base: { name: 'Base Training Club', duration: 45, contact: 'Base Training Club' },
        roky: { name: 'its just roky', duration: 60, contact: 'its just roky' },
        dental180: { name: '180 Dental & Cosmetics', duration: 60, contact: '180 Dental & Cosmetics' }
    };

    // ─── STATE ───
    let timers = {};
    let timerIntervals = {};

    // ─── INITIALIZATION ───
    document.addEventListener('DOMContentLoaded', () => {
        applyTheme();
        restoreAllData();
        initTabs();
        initAccordions();
        initChecklists();
        updateDashboard();
        updateAllSaveIndicators();
    });

    // ═══════════════════════════════════════
    // 1. THEME MANAGEMENT
    // ═══════════════════════════════════════
    window.toggleTheme = function () {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('grow_theme', next);
        updateThemeIcon(next);
    };

    function applyTheme() {
        const saved = localStorage.getItem('grow_theme') || 'light';
        document.documentElement.setAttribute('data-theme', saved);
        updateThemeIcon(saved);
    }

    function updateThemeIcon(theme) {
        const btn = document.getElementById('theme-toggle');
        if (!btn) return;
        btn.innerHTML = theme === 'dark'
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    }

    // ═══════════════════════════════════════
    // 2. TAB MANAGEMENT
    // ═══════════════════════════════════════
    function initTabs() {
        // Set first tab active
        switchTab('nour');
    }

    window.switchTab = function (tabId) {
        // Hide all panels
        document.querySelectorAll('.tab-panel').forEach(p => {
            p.classList.remove('active');
        });

        // Deactivate all buttons
        document.querySelectorAll('.nav-tab').forEach(b => {
            b.classList.remove('active');
        });

        // Activate selected
        const panel = document.getElementById('panel-' + tabId);
        const btn = document.getElementById('tab-' + tabId);

        if (panel) {
            panel.classList.add('active');
            // Re-trigger animation
            panel.style.animation = 'none';
            panel.offsetHeight;
            panel.style.animation = null;
        }
        if (btn) btn.classList.add('active');

        // Refresh dashboard when switching to it
        if (tabId === 'dashboard') {
            updateDashboard();
        }
    };

    // ═══════════════════════════════════════
    // 3. ACCORDION SYSTEM
    // ═══════════════════════════════════════
    function initAccordions() {
        document.querySelectorAll('.phase-toggle').forEach(toggle => {
            toggle.addEventListener('click', function () {
                const card = this.closest('.phase-card');
                const parent = card.closest('.phases-container');

                // Close siblings
                parent.querySelectorAll('.phase-card.open').forEach(openCard => {
                    if (openCard !== card) openCard.classList.remove('open');
                });

                // Toggle current
                card.classList.toggle('open');
            });
        });

        // Open first phase in each client tab
        document.querySelectorAll('.phases-container').forEach(container => {
            const first = container.querySelector('.phase-card');
            if (first) first.classList.add('open');
        });
    }

    // ═══════════════════════════════════════
    // 4. DATA PERSISTENCE (SAVE / RESTORE)
    // ═══════════════════════════════════════
    function getAllData() {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    }

    function saveClientData(clientId) {
        const data = getAllData();
        const fields = {};

        // Get all inputs/textareas for this client
        const panel = document.getElementById('panel-' + clientId);
        if (!panel) return;

        panel.querySelectorAll('[data-field]').forEach(el => {
            fields[el.dataset.field] = el.value;
        });

        data[clientId] = {
            fields: fields,
            savedAt: new Date().toISOString()
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        updateSaveIndicator(clientId);
        showToast('Data saved successfully', 'success');
        updateDashboard();
    }

    function restoreAllData() {
        const data = getAllData();

        CLIENTS.forEach(clientId => {
            if (data[clientId] && data[clientId].fields) {
                const panel = document.getElementById('panel-' + clientId);
                if (!panel) return;

                Object.entries(data[clientId].fields).forEach(([key, value]) => {
                    const el = panel.querySelector(`[data-field="${key}"]`);
                    if (el) el.value = value;
                });
            }
        });
    }

    function updateSaveIndicator(clientId) {
        const data = getAllData();
        const indicator = document.getElementById('save-indicator-' + clientId);
        if (!indicator) return;

        if (data[clientId] && data[clientId].savedAt) {
            const dt = new Date(data[clientId].savedAt);
            indicator.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Last saved: ${dt.toLocaleString()}`;
            indicator.classList.add('saved');
        }
    }

    function updateAllSaveIndicators() {
        CLIENTS.forEach(id => updateSaveIndicator(id));
    }

    // Expose save
    window.saveData = function (clientId) {
        saveClientData(clientId);
    };

    // ═══════════════════════════════════════
    // 5. COPY DATA
    // ═══════════════════════════════════════
    window.copyData = function (clientId) {
        const panel = document.getElementById('panel-' + clientId);
        if (!panel) return;

        const meta = CLIENT_META[clientId];
        let output = `**DMAIC Intelligence Extraction: ${meta.name}**\n\n`;

        panel.querySelectorAll('[data-field]').forEach(el => {
            const label = el.closest('.capture-group')?.querySelector('.capture-label')?.textContent
                || el.dataset.field;
            const value = el.value || 'No data captured.';
            output += `**${label.trim()}:**\n${value}\n\n`;
        });

        output += `---\nExtracted: ${new Date().toLocaleString()}\nClient: ${meta.contact}`;

        copyToClipboard(output);
        showToast('Data copied to clipboard', 'info');
    };

    function copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
        } else {
            fallbackCopy(text);
        }
    }

    function fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px;';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) { /* silent */ }
        document.body.removeChild(ta);
    }

    // ═══════════════════════════════════════
    // 6. MEETING TIMER
    // ═══════════════════════════════════════
    window.startTimer = function (clientId) {
        if (timerIntervals[clientId]) return; // Already running

        const meta = CLIENT_META[clientId];
        const totalSeconds = meta.duration * 60;

        if (!timers[clientId]) {
            timers[clientId] = { elapsed: 0, total: totalSeconds };
        }

        const display = document.getElementById('timer-display-' + clientId);
        const progress = document.getElementById('timer-progress-' + clientId);
        const phaseEl = document.getElementById('timer-phase-' + clientId);
        const liveBadge = document.getElementById('live-badge-' + clientId);

        if (liveBadge) liveBadge.style.display = 'inline-flex';

        timerIntervals[clientId] = setInterval(() => {
            timers[clientId].elapsed++;
            const elapsed = timers[clientId].elapsed;
            const remaining = totalSeconds - elapsed;

            if (remaining <= 0) {
                pauseTimer(clientId);
                display.textContent = '00:00';
                display.className = 'timer-display critical';
                if (phaseEl) phaseEl.textContent = 'MEETING ENDED';
                showToast(`${meta.name}: Meeting time is up!`, 'warning');
                return;
            }

            const mins = Math.floor(remaining / 60);
            const secs = remaining % 60;
            display.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

            // Progress bar
            const pct = (elapsed / totalSeconds) * 100;
            if (progress) progress.style.width = pct + '%';

            // Phase calculation
            if (phaseEl) {
                const phases = getPhases(clientId);
                const elapsedMin = elapsed / 60;
                let currentPhase = phases[phases.length - 1].label;
                for (const phase of phases) {
                    if (elapsedMin < phase.end) {
                        currentPhase = phase.label;
                        break;
                    }
                }
                phaseEl.textContent = currentPhase;
            }

            // Color coding
            if (remaining <= 120) {
                display.className = 'timer-display critical';
            } else if (remaining <= 300) {
                display.className = 'timer-display warning';
            } else {
                display.className = 'timer-display';
            }
        }, 1000);
    };

    window.pauseTimer = function (clientId) {
        if (timerIntervals[clientId]) {
            clearInterval(timerIntervals[clientId]);
            timerIntervals[clientId] = null;
        }
        const liveBadge = document.getElementById('live-badge-' + clientId);
        if (liveBadge) liveBadge.style.display = 'none';
    };

    window.resetTimer = function (clientId) {
        pauseTimer(clientId);
        timers[clientId] = null;

        const meta = CLIENT_META[clientId];
        const display = document.getElementById('timer-display-' + clientId);
        const progress = document.getElementById('timer-progress-' + clientId);
        const phaseEl = document.getElementById('timer-phase-' + clientId);

        if (display) {
            display.textContent = `${String(meta.duration).padStart(2, '0')}:00`;
            display.className = 'timer-display';
        }
        if (progress) progress.style.width = '0%';
        if (phaseEl) phaseEl.textContent = 'READY';
    };

    function getPhases(clientId) {
        const phaseMaps = {
            nour: [
                { end: 10, label: 'Phase I — Legacy & Clinical Vision' },
                { end: 25, label: 'Phase II — Patient Experience & Capacity' },
                { end: 40, label: 'Phase III — Lifetime Care Pathway' },
                { end: 50, label: 'Phase IV — Ecosystem Architecture' },
                { end: 60, label: 'Phase V — Operational Enhancements' }
            ],
            heka: [
                { end: 10, label: 'Phase I — Brand & Ecosystem Vision' },
                { end: 25, label: 'Phase II — Inventory & Operations' },
                { end: 40, label: 'Phase III — Customer Retention' },
                { end: 50, label: 'Phase IV — D2C vs B2B Strategy' },
                { end: 60, label: 'Phase V — Quick Wins & Next Steps' }
            ],
            hekap: [
                { end: 12, label: 'Phase I — Core Business Objectives' },
                { end: 24, label: 'Phase II — Target Audience & Experience' },
                { end: 36, label: 'Phase III — Digital Infrastructure' },
                { end: 48, label: 'Phase IV — Brand & Competitive Positioning' },
                { end: 60, label: 'Phase V — Budget & Execution Readiness' }
            ],
            roky: [
                { end: 10, label: 'Phase I — The Executive Download' },
                { end: 25, label: 'Phase II — The Unlimited Dreams Protocol' },
                { end: 40, label: 'Phase III — The Friction Log' },
                { end: 55, label: 'Phase IV — Culinary & Systems Audit' },
                { end: 60, label: 'Phase V — Success Definition & Next Steps' }
            ],
            dental180: [
                { end: 10, label: 'Phase I — Clinical Operations' },
                { end: 25, label: 'Phase II — Revenue & Margins' },
                { end: 40, label: 'Phase III — The Patient Lifecycle' },
                { end: 50, label: 'Phase IV — Marketing & Acquisition' },
                { end: 60, label: 'Phase V — Tech Stack & Next Steps' }
            ],
            base: [
                { end: 10, label: 'Phase I — Vision & Capacity' },
                { end: 25, label: 'Phase II — The Friction Log' },
                { end: 35, label: 'Phase III — Seasonality & Mitigation' },
                { end: 45, label: 'Phase IV — Systems & DMAIC Data' },
                { end: 45, label: 'Phase V — Commitments' }
            ]
        };
        return phaseMaps[clientId] || [];
    }

    // ═══════════════════════════════════════
    // 7. PDF EXPORT
    // ═══════════════════════════════════════
    window.exportPDF = function (clientId) {
        const meta = CLIENT_META[clientId];
        const panel = document.getElementById('panel-' + clientId);
        if (!panel) return;

        // Build printable content
        let content = '';
        content += `<div style="font-family:Inter,sans-serif;max-width:700px;margin:0 auto;padding:40px;">`;
        content += `<div style="border-bottom:3px solid #4F46E5;padding-bottom:16px;margin-bottom:32px;">`;
        content += `<h1 style="font-size:24px;font-weight:800;color:#1A202C;margin:0;">Executive Induction Playbook</h1>`;
        content += `<p style="font-size:14px;color:#64748B;margin-top:4px;">Client: ${meta.contact} (${meta.name})</p>`;
        content += `<p style="font-size:12px;color:#94A3B8;margin-top:4px;font-family:monospace;">Exported: ${new Date().toLocaleString()} | Duration: ${meta.duration} Minutes</p>`;
        content += `</div>`;

        // Collect all captured data
        panel.querySelectorAll('[data-field]').forEach(el => {
            const label = el.closest('.capture-group')?.querySelector('.capture-label')?.textContent || el.dataset.field;
            const value = el.value || 'No data captured.';
            content += `<div style="margin-bottom:20px;">`;
            content += `<h3 style="font-size:13px;font-weight:700;color:#1A202C;margin-bottom:6px;">${label.trim()}</h3>`;
            content += `<p style="font-size:13px;color:#475569;line-height:1.6;padding:12px;background:#F8F9FA;border-radius:8px;border:1px solid #E2E8F0;">${escapeHtml(value)}</p>`;
            content += `</div>`;
        });

        content += `<div style="margin-top:40px;padding-top:16px;border-top:1px solid #E2E8F0;">`;
        content += `<p style="font-size:10px;color:#94A3B8;font-family:monospace;">GROW ECOSYSTEM — Confidential Meeting Intelligence</p>`;
        content += `</div></div>`;

        // Open print dialog
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Meeting Report — ${meta.name}</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
                <style>
                    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
                </style>
            </head>
            <body>${content}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 500);

        showToast('PDF export opened in new window', 'success');
    };

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML.replace(/\n/g, '<br>');
    }

    // ═══════════════════════════════════════
    // 8. READINESS CHECKLIST
    // ═══════════════════════════════════════
    function initChecklists() {
        document.querySelectorAll('.checklist-header').forEach(header => {
            header.addEventListener('click', () => {
                header.closest('.checklist-panel').classList.toggle('open');
            });
        });

        // Restore checked states
        const checkData = JSON.parse(localStorage.getItem('grow_checklists') || '{}');

        document.querySelectorAll('.checklist-item input[type="checkbox"]').forEach(cb => {
            const key = cb.dataset.checkKey;
            if (checkData[key]) {
                cb.checked = true;
                cb.closest('.checklist-item').classList.add('checked');
            }

            cb.addEventListener('change', function () {
                const data = JSON.parse(localStorage.getItem('grow_checklists') || '{}');
                data[this.dataset.checkKey] = this.checked;
                localStorage.setItem('grow_checklists', JSON.stringify(data));
                this.closest('.checklist-item').classList.toggle('checked', this.checked);
                updateChecklistProgress(this.closest('.checklist-panel'));
            });
        });

        // Init progress counts
        document.querySelectorAll('.checklist-panel').forEach(panel => {
            updateChecklistProgress(panel);
        });
    }

    function updateChecklistProgress(panel) {
        const total = panel.querySelectorAll('.checklist-item input[type="checkbox"]').length;
        const checked = panel.querySelectorAll('.checklist-item input[type="checkbox"]:checked').length;
        const progressEl = panel.querySelector('.checklist-progress');
        if (progressEl) {
            progressEl.textContent = `${checked}/${total}`;
        }
    }

    // ═══════════════════════════════════════
    // 9. CONSOLIDATED DASHBOARD
    // ═══════════════════════════════════════
    function updateDashboard() {
        const data = getAllData();
        let totalFields = 0;
        let filledFields = 0;
        let savedClients = 0;

        CLIENTS.forEach(clientId => {
            const card = document.getElementById('dash-card-' + clientId);
            if (!card) return;

            const meta = CLIENT_META[clientId];
            const clientData = data[clientId];

            // Status badge
            const statusEl = card.querySelector('.dashboard-card-status');
            const metaEl = card.querySelector('.dashboard-card-meta');

            if (clientData && clientData.savedAt) {
                statusEl.textContent = 'Saved';
                statusEl.className = 'dashboard-card-status status-saved';
                metaEl.textContent = 'Last saved: ' + new Date(clientData.savedAt).toLocaleString();
                savedClients++;
            } else {
                statusEl.textContent = 'Pending';
                statusEl.className = 'dashboard-card-status status-pending';
                metaEl.textContent = 'No data saved yet';
            }

            // Field values
            const fieldsContainer = card.querySelector('.dashboard-card-fields');
            if (fieldsContainer) {
                fieldsContainer.innerHTML = '';

                const panel = document.getElementById('panel-' + clientId);
                if (panel) {
                    panel.querySelectorAll('[data-field]').forEach(el => {
                        totalFields++;
                        const label = el.closest('.capture-group')?.querySelector('.capture-label')?.textContent?.trim() || el.dataset.field;
                        const value = el.value;
                        if (value) filledFields++;

                        const fieldEl = document.createElement('div');
                        fieldEl.className = 'dashboard-field';
                        fieldEl.innerHTML = `
                            <span class="dashboard-field-label">${truncate(label, 30)}</span>
                            <span class="dashboard-field-value ${value ? '' : 'empty'}">${value ? truncate(value, 40) : 'Empty'}</span>
                        `;
                        fieldsContainer.appendChild(fieldEl);
                    });
                }
            }
        });

        // Update stats
        const statClients = document.getElementById('stat-clients');
        const statFields = document.getElementById('stat-fields');
        const statSaved = document.getElementById('stat-saved');

        if (statClients) statClients.textContent = CLIENTS.length;
        if (statFields) statFields.textContent = `${filledFields}/${totalFields}`;
        if (statSaved) statSaved.textContent = savedClients;
    }

    function truncate(str, len) {
        return str.length > len ? str.substring(0, len) + '…' : str;
    }

    // Export all data
    window.exportAllData = function () {
        const data = getAllData();
        let output = '═══ GROW ECOSYSTEM — CONSOLIDATED MEETING INTELLIGENCE ═══\n\n';

        CLIENTS.forEach(clientId => {
            const meta = CLIENT_META[clientId];
            output += `━━━ ${meta.name.toUpperCase()} (${meta.contact}) ━━━\n`;

            const panel = document.getElementById('panel-' + clientId);
            if (panel) {
                panel.querySelectorAll('[data-field]').forEach(el => {
                    const label = el.closest('.capture-group')?.querySelector('.capture-label')?.textContent?.trim() || el.dataset.field;
                    const value = el.value || 'No data captured.';
                    output += `• ${label}: ${value}\n`;
                });
            }

            if (data[clientId] && data[clientId].savedAt) {
                output += `[Saved: ${new Date(data[clientId].savedAt).toLocaleString()}]\n`;
            }
            output += '\n';
        });

        output += `═══ Exported: ${new Date().toLocaleString()} ═══`;

        copyToClipboard(output);
        showToast('All client data copied to clipboard', 'success');
    };

    // Save all data from all panels
    window.saveAllData = function () {
        CLIENTS.forEach(clientId => saveClientData(clientId));
        showToast('All client data saved', 'success');
    };

    // ═══════════════════════════════════════
    // 10. TOAST NOTIFICATION SYSTEM
    // ═══════════════════════════════════════
    function showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const icons = {
            success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
            warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
        };

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;

        container.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                toast.classList.add('visible');
            });
        });

        // Auto-dismiss
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 350);
        }, 3000);
    }

})();
