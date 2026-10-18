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

    if (!csvInput) return;

    csvInput.value = defaultData;

    let lotusChart = null;
    let seriesColors = {};
    const defaultPalette = ["#3aa3ff", "#ff4d5a", "#2ecc71", "#f1c40f", "#9b59b6", "#e67e22"];
    const pointStyles = ['circle', 'rect', 'triangle', 'rectRot', 'crossRot'];
    const bwLineStyles = [[], [8, 6], [3, 5], [12, 4, 3, 4]];

    function parseCSV(text) {
    if (!text) return null;

    // Remove standalone title headers like "Anti Dive (%)" if present at the top
    let rawText = text.trim();
    if (rawText.toLowerCase().startsWith("anti dive")) {
        const firstLineEnd = rawText.indexOf("\n");
        if (firstLineEnd !== -1) {
            rawText = rawText.substring(firstLineEnd).trim();
        }
    }

    // Split text into lines (handles both \n and \r\n)
    let lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l);

    // If the entire payload pasted on a single line, re-split by pattern matching
    if (lines.length === 1 && lines[0].includes("Front")) {
        const headerMatch = lines[0].match(/^(X\s+Front \+ve Y\s+Front -ve Y\s+Rear \+ve Y\s+Rear -ve Y)/i);
        if (headerMatch) {
            const headerStr = headerMatch[1];
            const dataStr = lines[0].substring(headerStr.length).trim();
            const dataRows = dataStr.match(/(-?\d+(?:\.\d+)?)/g);
            if (dataRows && dataRows.length % 5 === 0) {
                lines = [
                    "X, Front +ve Y, Front -ve Y, Rear +ve Y, Rear -ve Y"
                ];
                for (let i = 0; i < dataRows.length; i += 5) {
                    lines.push(dataRows.slice(i, i + 5).join(", "));
                }
            }
        }
    }

    if (lines.length < 2) return null;

    // Detect delimiter (tab or comma or multiple spaces)
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

    function generateExportCanvas() {
        const parsed = parseCSV(csvInput.value);
        if (!parsed) return null;

        const offCanvas = document.createElement("canvas");
        offCanvas.width = 2000;
        offCanvas.height = 1125;
        const offCtx = offCanvas.getContext("2d");

        const isColor = colorModeToggle.checked;
        const showValues = showDataValuesToggle.checked;

        const exportDatasets = parsed.seriesNames.map((name, idx) => {
            const color = isColor ? (seriesColors[name] || defaultPalette[idx % defaultPalette.length]) : "#111111";
            return {
                label: name,
                data: parsed.seriesData[name],
                borderColor: color,
                backgroundColor: color,
                borderWidth: 3.5,
                borderDash: isColor ? [] : bwLineStyles[idx % bwLineStyles.length],
                pointStyle: pointStyles[idx % pointStyles.length],
                pointRadius: 8,
                pointBackgroundColor: color,
                tension: 0.1
            };
        });

        const exportChart = new Chart(offCtx, {
            type: 'line',
            data: {
                labels: parsed.xValues,
                datasets: exportDatasets
            },
            options: {
                animation: false,
                responsive: false,
                devicePixelRatio: 2,
                layout: { padding: 40 },
                plugins: {
                    title: {
                        display: true,
                        text: chartTitleInput.value,
                        color: '#111111',
                        font: { size: 26, weight: 'bold' },
                        padding: { bottom: 20 }
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#111111',
                            font: { size: 16, weight: '600' },
                            boxWidth: 24,
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: xAxisLabelInput.value, color: '#111111', font: { size: 18, weight: '600' } },
                        grid: { color: '#e2e8f0', lineWidth: 1.5 },
                        ticks: { color: '#111111', font: { size: 14 } }
                    },
                    y: {
                        title: { display: true, text: yAxisLabelInput.value, color: '#111111', font: { size: 18, weight: '600' } },
                        grid: { color: '#e2e8f0', lineWidth: 1.5 },
                        ticks: { color: '#111111', font: { size: 14 } }
                    }
                }
            },
            plugins: [{
                id: 'pure_white_bg_and_labels',
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
                    const ctx = chart.ctx;
                    ctx.save();
                    ctx.font = "bold 15px sans-serif";
                    ctx.fillStyle = "#111111";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "bottom";

                    chart.data.datasets.forEach((ds, i) => {
                        const meta = chart.getDatasetMeta(i);
                        meta.data.forEach((pt, index) => {
                            ctx.fillText(ds.data[index], pt.x, pt.y - 12);
                        });
                    });
                    ctx.restore();
                }
            }]
        });

        return { exportChart, offCanvas };
    }

    function exportPNG() {
        const generated = generateExportCanvas();
        if (!generated) return;
        setTimeout(() => {
            const imgData = generated.offCanvas.toDataURL("image/png", 1.0);
            const link = document.createElement("a");
            link.download = "Lotus_Shark_Graph.png";
            link.href = imgData;
            link.click();
            generated.exportChart.destroy();
        }, 100);
    }

    function exportPDF() {
        const generated = generateExportCanvas();
        if (!generated) return;
        setTimeout(() => {
            const imgData = generated.offCanvas.toDataURL("image/jpeg", 0.98);
            const { jsPDF } = window.jspdf || {};
            if (jsPDF) {
                const pdf = new jsPDF({
                    orientation: 'landscape',
                    unit: 'mm',
                    format: 'a4'
                });
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                
                const imgWidth = pageWidth - 20;
                const imgHeight = (generated.offCanvas.height * imgWidth) / generated.offCanvas.width;
                const posY = (pageHeight - imgHeight) / 2;

                pdf.addImage(imgData, 'JPEG', 10, posY > 10 ? posY : 10, imgWidth, imgHeight);
                pdf.save('Lotus_Shark_Graph_Report.pdf');
            }
            generated.exportChart.destroy();
        }, 100);
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
