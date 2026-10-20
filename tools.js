document.addEventListener("DOMContentLoaded", function () {
    const defaultData = `X, Front +ve Y, Front -ve Y, Rear +ve Y, Rear -ve Y
60, -9.65023, -9.65023, 53.89741, 53.89741
40, -9.24616, -9.24616, 51.96409, 51.96409
20, -8.88913, -8.88913, 50.36708, 50.36708
0, -8.56942, -8.56942, 49.07853, 49.07853
-20, -8.27935, -8.27935, 48.08387, 48.08387
-40, -8.01252, -8.01252, 47.38116, 47.38116
-60, -7.76347, -7.76347, 46.98189, 46.98189`;

    const csvInput = document.getElementById("csvDataInput");
    const chartTitleInput = document.getElementById("chartTitleInput");
    const xAxisLabelInput = document.getElementById("xAxisLabelInput");
    const yAxisLabelInput = document.getElementById("yAxisLabelInput");
    const updateBtn = document.getElementById("updateChartBtn");
    const loadSampleBtn = document.getElementById("loadSampleBtn");
    const exportPngBtn = document.getElementById("exportPngBtn");
    const exportPdfBtn = document.getElementById("exportPdfBtn");
    const colorPickersContainer = document.getElementById("colorPickersContainer");
    const colorModeToggle = document.getElementById("colorModeToggle");
    const showDataValuesToggle = document.getElementById("showDataValuesToggle");
    const trendsSummaryContainer = document.getElementById("trendsSummaryContainer");

    if (!csvInput) return;

    csvInput.value = defaultData;

    let lotusChart = null;
    let seriesColors = {};
    const defaultPalette = ["#3aa3ff", "#ff4d5a", "#2ecc71", "#f1c40f", "#9b59b6", "#e67e22"];
    const pointStyles = ['circle', 'rect', 'triangle', 'rectRot', 'crossRot'];
    const bwLineStyles = [[], [8, 6], [3, 5], [12, 4, 3, 4]];

    function parseCSV(text) {
        if (!text) return null;

        let rawText = text.trim();

        if (/^anti\s+\w+/i.test(rawText)) {
            const firstLineEnd = rawText.indexOf("\n");
            if (firstLineEnd !== -1) {
                rawText = rawText.substring(firstLineEnd).trim();
            }
        }

        let lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l);

        if (lines.length === 1 && lines[0].includes("Front")) {
            const headerMatch = lines[0].match(/^(X\s*Front \+ve Y\s*Front -ve Y\s*Rear \+ve Y\s*Rear -ve Y)/i);
            if (headerMatch) {
                const headerStr = headerMatch[1];
                const dataStr = lines[0].substring(headerStr.length).trim();
                const numbers = dataStr.match(/(-?\d+(?:\.\d+)?)/g);
                if (numbers && numbers.length % 5 === 0) {
                    lines = ["X, Front +ve Y, Front -ve Y, Rear +ve Y, Rear -ve Y"];
                    for (let i = 0; i < numbers.length; i += 5) {
                        lines.push(numbers.slice(i, i + 5).join(", "));
                    }
                }
            }
        }

        if (lines.length < 2) return null;

        const delimiter = lines[0].includes("\t") ? "\t" : (lines[0].includes(",") ? "," : /\s+/);
        const headers = lines[0].split(delimiter).map(h => h.trim()).filter(h => h);
        const seriesNames = headers.slice(1);

        const xValues = [];
        const seriesData = {};
        seriesNames.forEach(name => seriesData[name] = []);

        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(delimiter).map(c => parseFloat(c.trim())).filter(c => !isNaN(c));
            if (cols.length === headers.length) {
                xValues.push(cols[0]);
                for (let j = 1; j < headers.length; j++) {
                    seriesData[headers[j]].push(cols[j]);
                }
            }
        }

        return { xValues, seriesNames, seriesData };
    }

    function analyzeTrend(xValues, yValues) {
        if (!xValues || !yValues || xValues.length < 2) return null;

        let maxVal = -Infinity, minVal = Infinity;
        let maxIdx = -1, minIdx = -1;

        for (let i = 0; i < yValues.length; i++) {
            if (yValues[i] > maxVal) {
                maxVal = yValues[i];
                maxIdx = i;
            }
            if (yValues[i] < minVal) {
                minVal = yValues[i];
                minIdx = i;
            }
        }

        const extrema = [];
        for (let i = 1; i < yValues.length - 1; i++) {
            const prevDiff = yValues[i] - yValues[i - 1];
            const nextDiff = yValues[i + 1] - yValues[i];

            if (prevDiff > 0 && nextDiff < 0) {
                extrema.push({ type: 'Peak (Local Max)', x: xValues[i], y: yValues[i] });
            } else if (prevDiff < 0 && nextDiff > 0) {
                extrema.push({ type: 'Trough (Local Min)', x: xValues[i], y: yValues[i] });
            }
        }

        const inflectionPoints = [];
        for (let i = 1; i < yValues.length - 2; i++) {
            const s1 = (yValues[i] - yValues[i - 1]) / (xValues[i] - xValues[i - 1]);
            const s2 = (yValues[i + 1] - yValues[i]) / (xValues[i + 1] - xValues[i]);
            const s3 = (yValues[i + 2] - yValues[i + 1]) / (xValues[i + 2] - xValues[i + 1]);

            const curve1 = s2 - s1;
            const curve2 = s3 - s2;

            if ((curve1 > 0 && curve2 < 0) || (curve1 < 0 && curve2 > 0)) {
                inflectionPoints.push({ x: xValues[i + 1], y: yValues[i + 1] });
            }
        }

        return {
            maxPoint: { x: xValues[maxIdx], y: maxVal },
            minPoint: { x: xValues[minIdx], y: minVal },
            extrema,
            inflectionPoints
        };
    }

    function updateTrendsPanel(parsed) {
        if (!trendsSummaryContainer) return;
        trendsSummaryContainer.innerHTML = "";

        parsed.seriesNames.forEach((name, idx) => {
            const color = colorModeToggle.checked ? (seriesColors[name] || defaultPalette[idx % defaultPalette.length]) : "#3aa3ff";
            const trend = analyzeTrend(parsed.xValues, parsed.seriesData[name]);
            if (!trend) return;

            const card = document.createElement("div");
            card.className = "trend-card";
            card.style.borderLeftColor = color;

            const header = document.createElement("div");
            header.className = "trend-card-header";
            header.textContent = name;
            card.appendChild(header);

            const maxItem = document.createElement("div");
            maxItem.className = "trend-item";
            maxItem.innerHTML = `<span>Maximum:</span> <span class="trend-item-val">(${trend.maxPoint.x}, ${trend.maxPoint.y.toFixed(2)})</span>`;
            card.appendChild(maxItem);

            const minItem = document.createElement("div");
            minItem.className = "trend-item";
            minItem.innerHTML = `<span>Minimum:</span> <span class="trend-item-val">(${trend.minPoint.x}, ${trend.minPoint.y.toFixed(2)})</span>`;
            card.appendChild(minItem);

            let infText = "Monotonic / Uniform";
            if (trend.extrema.length > 0) {
                infText = trend.extrema.map(e => `${e.type} @ (${e.x}, ${e.y.toFixed(2)})`).join("; ");
            } else if (trend.inflectionPoints.length > 0) {
                infText = trend.inflectionPoints.map(p => `Inflection @ (${p.x}, ${p.y.toFixed(2)})`).join("; ");
            }

            const infItem = document.createElement("div");
            infItem.className = "trend-item";
            infItem.style.flexDirection = "column";
            infItem.style.gap = "2px";
            infItem.innerHTML = `<span style="font-size: 10px; opacity: 0.8;">Turning / Inflection Points:</span> <span class="trend-item-val" style="font-size: 10px; color: ${color};">${infText}</span>`;
            card.appendChild(infItem);

            trendsSummaryContainer.appendChild(card);
        });
    }

    function initColorPickers(seriesNames) {
        colorPickersContainer.innerHTML = "";
        seriesNames.forEach((name, idx) => {
            if (!seriesColors[name]) {
                seriesColors[name] = defaultPalette[idx % defaultPalette.length];
            }

            const card = document.createElement("div");
            card.className = "color-picker-card";

            const nameEl = document.createElement("span");
            nameEl.className = "series-name";
            nameEl.textContent = name;

            const controlsWrapper = document.createElement("div");
            controlsWrapper.className = "picker-control-wrapper";

            const input = document.createElement("input");
            input.type = "color";
            input.className = "prominent-color-input";
            input.value = seriesColors[name];
            input.dataset.series = name;

            const hexVal = document.createElement("span");
            hexVal.className = "hex-label";
            hexVal.textContent = seriesColors[name].toUpperCase();

            input.addEventListener("input", (e) => {
                const color = e.target.value;
                seriesColors[e.target.dataset.series] = color;
                hexVal.textContent = color.toUpperCase();
                updateGraph();
            });

            controlsWrapper.appendChild(input);
            controlsWrapper.appendChild(hexVal);
            card.appendChild(nameEl);
            card.appendChild(controlsWrapper);

            colorPickersContainer.appendChild(card);
        });
    }

    function drawDataValuesPlugin(chartInstance) {
        if (!showDataValuesToggle.checked) return;
        const ctx = chartInstance.ctx;
        ctx.save();
        ctx.font = "bold 11px sans-serif";
        ctx.fillStyle = chartInstance.options.scales.x.grid.color === '#ffffff' ? '#111111' : '#a4afc3';
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";

        chartInstance.data.datasets.forEach((dataset, i) => {
            const meta = chartInstance.getDatasetMeta(i);
            meta.data.forEach((point, index) => {
                const dataVal = dataset.data[index];
                ctx.fillText(dataVal, point.x, point.y - 8);
            });
        });
        ctx.restore();
    }

    function updateGraph() {
        const parsed = parseCSV(csvInput.value);
        if (!parsed) return;

        initColorPickers(parsed.seriesNames);
        updateTrendsPanel(parsed);
        const isColor = colorModeToggle.checked;

        const datasets = parsed.seriesNames.map((name, idx) => {
            const color = isColor ? (seriesColors[name] || defaultPalette[idx % defaultPalette.length]) : "#111111";
            return {
                label: name,
                data: parsed.seriesData[name],
                borderColor: color,
                backgroundColor: color,
                borderWidth: 2.5,
                borderDash: isColor ? [] : bwLineStyles[idx % bwLineStyles.length],
                pointStyle: pointStyles[idx % pointStyles.length],
                pointRadius: 6,
                pointHoverRadius: 8,
                tension: 0.1
            };
        });

        const ctx = document.getElementById("lotusChart").getContext("2d");
        
        if (lotusChart) {
            lotusChart.destroy();
        }

        lotusChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: parsed.xValues,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: chartTitleInput.value,
                        color: '#f5f7fb',
                        font: { size: 16, weight: '600' }
                    },
                    legend: {
                        labels: { color: '#a4afc3', boxWidth: 14, usePointStyle: true }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: xAxisLabelInput.value, color: '#a4afc3' },
                        grid: { color: 'rgba(255, 255, 255, 0.08)' },
                        ticks: { color: '#a4afc3' }
                    },
                    y: {
                        title: { display: true, text: yAxisLabelInput.value, color: '#a4afc3' },
                        grid: { color: 'rgba(255, 255, 255, 0.08)' },
                        ticks: { color: '#a4afc3' }
                    }
                }
            },
            plugins: [{
                id: 'customDataLabels',
                afterDatasetsDraw: (chart) => {
                    drawDataValuesPlugin(chart);
                }
            }]
        });
    }

    // Graph-Only High-Resolution Export
    function generateCleanExportCanvas() {
        const parsed = parseCSV(csvInput.value);
        if (!parsed) return null;

        const isColor = colorModeToggle.checked;
        const showValues = showDataValuesToggle.checked;

        const exportDatasets = parsed.seriesNames.map((name, idx) => {
            const color = isColor ? (seriesColors[name] || defaultPalette[idx % defaultPalette.length]) : "#111111";
            return {
                label: name,
                data: parsed.seriesData[name],
                borderColor: color,
                backgroundColor: color,
                borderWidth: 3,
                borderDash: isColor ? [] : bwLineStyles[idx % bwLineStyles.length],
                pointStyle: pointStyles[idx % pointStyles.length],
                pointRadius: 7,
                pointBackgroundColor: color,
                tension: 0.1
            };
        });

        const canvasWidth = 1800;
        const canvasHeight = 1000;

        // Temporary offscreen container
        const tempContainer = document.createElement("div");
        tempContainer.style.position = "absolute";
        tempContainer.style.left = "-9999px";
        tempContainer.style.top = "-9999px";
        tempContainer.style.width = `${canvasWidth}px`;
        tempContainer.style.height = `${canvasHeight}px`;

        const chartCanvas = document.createElement("canvas");
        chartCanvas.width = canvasWidth;
        chartCanvas.height = canvasHeight;
        tempContainer.appendChild(chartCanvas);
        document.body.appendChild(tempContainer);

        const chartCtx = chartCanvas.getContext("2d");

        const tempChart = new Chart(chartCtx, {
            type: 'line',
            data: {
                labels: parsed.xValues,
                datasets: exportDatasets
            },
            options: {
                animation: false,
                responsive: false,
                maintainAspectRatio: false,
                layout: { padding: { top: 30, left: 40, right: 40, bottom: 30 } },
                plugins: {
                    title: {
                        display: true,
                        text: chartTitleInput.value,
                        color: '#111111',
                        font: { size: 28, weight: 'bold' },
                        padding: { bottom: 20 },
                        align: 'center'
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        align: 'center',
                        labels: { color: '#111111', font: { size: 16, weight: '600' }, boxWidth: 18, usePointStyle: true, padding: 20 }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: xAxisLabelInput.value, color: '#111111', font: { size: 18, weight: 'bold' }, padding: { top: 10 } },
                        grid: { color: '#e2e8f0', lineWidth: 1.5 },
                        ticks: { color: '#111111', font: { size: 14, weight: '500' } }
                    },
                    y: {
                        title: { display: true, text: yAxisLabelInput.value, color: '#111111', font: { size: 18, weight: 'bold' }, padding: { bottom: 10 } },
                        grid: { color: '#e2e8f0', lineWidth: 1.5 },
                        ticks: { color: '#111111', font: { size: 14, weight: '500' } }
                    }
                }
            },
            plugins: [{
                id: 'whiteBgAndValues',
                beforeDraw: (chart) => {
                    const ctx = chart.canvas.getContext('2d');
                    ctx.save();
                    ctx.globalCompositeOperation = 'destination-over';
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, chart.width, chart.height);
                    ctx.restore();
                },
                afterDatasetsDraw: (chart) => {
                    if (!showValues) return;
                    const cCtx = chart.ctx;
                    cCtx.save();
                    cCtx.font = "bold 13px sans-serif";
                    cCtx.fillStyle = "#111111";
                    cCtx.textAlign = "center";
                    cCtx.textBaseline = "bottom";

                    chart.data.datasets.forEach((ds, i) => {
                        const meta = chart.getDatasetMeta(i);
                        meta.data.forEach((pt, index) => {
                            cCtx.fillText(ds.data[index], pt.x, pt.y - 10);
                        });
                    });
                    cCtx.restore();
                }
            }]
        });

        // Copy canvas output
        const masterCanvas = document.createElement("canvas");
        masterCanvas.width = canvasWidth;
        masterCanvas.height = canvasHeight;
        const ctx = masterCanvas.getContext("2d");
        ctx.drawImage(chartCanvas, 0, 0);

        tempChart.destroy();
        document.body.removeChild(tempContainer);

        return masterCanvas;
    }

    function exportPNG() {
        const offCanvas = generateCleanExportCanvas();
        if (!offCanvas) return;

        const imgData = offCanvas.toDataURL("image/png", 1.0);
        const link = document.createElement("a");
        link.download = "Lotus_Shark_Kinematics_Graph.png";
        link.href = imgData;
        link.click();
    }

    function exportPDF() {
        const offCanvas = generateCleanExportCanvas();
        if (!offCanvas) return;

        const imgData = offCanvas.toDataURL("image/jpeg", 0.98);
        const { jsPDF } = window.jspdf || {};

        if (jsPDF) {
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            const margin = 10;
            const imgWidth = pageWidth - (margin * 2);
            const imgHeight = (offCanvas.height * imgWidth) / offCanvas.width;

            const posY = (pageHeight - imgHeight) / 2;

            pdf.addImage(imgData, 'JPEG', margin, posY > margin ? posY : margin, imgWidth, imgHeight);
            pdf.save('Lotus_Shark_Kinematics_Report.pdf');
        }
    }

    updateBtn.addEventListener("click", updateGraph);
    colorModeToggle.addEventListener("change", updateGraph);
    showDataValuesToggle.addEventListener("change", updateGraph);

    loadSampleBtn.addEventListener("click", () => {
        csvInput.value = defaultData;
        chartTitleInput.value = "Anti Dive (%) - Lotus Shark Kinematics";
        xAxisLabelInput.value = "Bump/Rebound (mm)";
        yAxisLabelInput.value = "Anti Dive (%)";
        colorModeToggle.checked = true;
        showDataValuesToggle.checked = false;
        seriesColors = {};
        updateGraph();
    });

    exportPngBtn.addEventListener("click", exportPNG);
    exportPdfBtn.addEventListener("click", exportPDF);

    updateGraph();
});
