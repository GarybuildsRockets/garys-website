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

    function parseCSV(text) {
        const lines = text.trim().split("\n").map(l => l.trim()).filter(l => l);
        if (lines.length < 2) return null;

        const headers = lines[0].split(",").map(h => h.trim());
        const seriesNames = headers.slice(1);

        const xValues = [];
        const seriesData = {};
        seriesNames.forEach(name => seriesData[name] = []);

        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(",").map(c => parseFloat(c.trim()));
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
                if (colorModeToggle.checked) {
                    updateGraph();
                }
            });

            controlsWrapper.appendChild(input);
            controlsWrapper.appendChild(hexVal);
            card.appendChild(nameEl);
            card.appendChild(controlsWrapper);

            colorPickersContainer.appendChild(card);
        });
    }

    function updateGraph() {
        const parsed = parseCSV(csvInput.value);
        if (!parsed) return;

        initColorPickers(parsed.seriesNames);
        const isColor = colorModeToggle.checked;
        const showValues = showDataValuesToggle.checked;

        const datasets = parsed.seriesNames.map((name, idx) => {
            const color = isColor ? (seriesColors[name] || "#3aa3ff") : "#111111";
            return {
                label: name,
                data: parsed.seriesData[name],
                borderColor: color,
                backgroundColor: color,
                borderWidth: 2.5,
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
                        title: {
                            display: true,
                            text: xAxisLabelInput.value,
                            color: '#a4afc3'
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.08)' },
                        ticks: { color: '#a4afc3' }
                    },
                    y: {
                        title: {
                            display: true,
                            text: yAxisLabelInput.value,
                            color: '#a4afc3'
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.08)' },
                        ticks: { color: '#a4afc3' }
                    }
                },
                animation: {
                    onComplete: function() {
                        if (!showValues) return;
                        const chartInstance = this;
                        const ctx = chartInstance.ctx;
                        ctx.font = "10px sans-serif";
                        ctx.fillStyle = "#a4afc3";
                        ctx.textAlign = "center";
                        ctx.textBaseline = "bottom";

                        chartInstance.data.datasets.forEach((dataset, i) => {
                            const meta = chartInstance.getDatasetMeta(i);
                            meta.data.forEach((point, index) => {
                                const dataVal = dataset.data[index];
                                ctx.fillText(dataVal, point.x, point.y - 8);
                            });
                        });
                    }
                }
            }
        });
    }

    // Export clean White-Background PNG with distinct shapes
    function exportExportableImage(format) {
        const parsed = parseCSV(csvInput.value);
        if (!parsed) return;

        const offCanvas = document.createElement("canvas");
        offCanvas.width = 2400;
        offCanvas.height = 1400;
        const offCtx = offCanvas.getContext("2d");

        const exportDatasets = parsed.seriesNames.map((name, idx) => {
            return {
                label: name,
                data: parsed.seriesData[name],
                borderColor: '#111111',
                backgroundColor: '#111111',
                borderWidth: 3.5,
                pointStyle: pointStyles[idx % pointStyles.length],
                pointRadius: 8,
                pointBackgroundColor: '#111111',
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
                        color: '#000000',
                        font: { size: 28, weight: 'bold' },
                        padding: { bottom: 20 }
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#000000',
                            font: { size: 18, weight: '500' },
                            boxWidth: 30,
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: xAxisLabelInput.value,
                            color: '#000000',
                            font: { size: 20, weight: '600' }
                        },
                        grid: { color: '#cccccc', lineWidth: 1.5 },
                        ticks: { color: '#000000', font: { size: 16 } }
                    },
                    y: {
                        title: {
                            display: true,
                            text: yAxisLabelInput.value,
                            color: '#000000',
                            font: { size: 20, weight: '600' }
                        },
                        grid: { color: '#cccccc', lineWidth: 1.5 },
                        ticks: { color: '#000000', font: { size: 16 } }
                    }
                },
                animation: {
                    onComplete: function() {
                        if (!showDataValuesToggle.checked) return;
                        const ci = this;
                        const c = ci.ctx;
                        c.font = "bold 16px sans-serif";
                        c.fillStyle = "#000000";
                        c.textAlign = "center";
                        c.textBaseline = "bottom";

                        ci.data.datasets.forEach((ds, i) => {
                            const meta = ci.getDatasetMeta(i);
                            meta.data.forEach((pt, idx) => {
                                c.fillText(ds.data[idx], pt.x, pt.y - 12);
                            });
                        });
                    }
                }
            },
            plugins: [{
                id: 'white_bg',
                beforeDraw: (chart) => {
                    const ctx = chart.canvas.getContext('2d');
                    ctx.save();
                    ctx.globalCompositeOperation = 'destination-over';
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, chart.width, chart.height);
                    ctx.restore();
                }
            }]
        });

        setTimeout(() => {
            const imgData = offCanvas.toDataURL("image/png");
            if (format === 'png') {
                const link = document.createElement("a");
                link.download = "Lotus_Shark_Graph.png";
                link.href = imgData;
                link.click();
            } else if (format === 'pdf') {
                const { jsPDF } = window.jspdf || {};
                // Using html2pdf bundle conversion of the high-res white canvas image
                const container = document.createElement("div");
                container.innerHTML = `<img src="${imgData}" style="width:100%;">`;
                const opt = {
                    margin: 10,
                    filename: 'Lotus_Shark_Graph_Report.pdf',
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2 },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
                };
                html2pdf().from(container).set(opt).save();
            }
            exportChart.destroy();
        }, 150);
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

    exportPngBtn.addEventListener("click", () => exportExportableImage('png'));
    exportPdfBtn.addEventListener("click", () => exportExportableImage('pdf'));

    updateGraph();
});
