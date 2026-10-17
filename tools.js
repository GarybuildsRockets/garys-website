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
    const exportPdfBtn = document.getElementById("exportPdfBtn");
    const colorPickersContainer = document.getElementById("colorPickersContainer");

    if (!csvInput) return;

    csvInput.value = defaultData;

    let lotusChart = null;
    let seriesColors = {};
    const defaultPalette = ["#3aa3ff", "#ff4d5a", "#2ecc71", "#f1c40f", "#9b59b6", "#e67e22"];

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
                updateGraph();
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

        const datasets = parsed.seriesNames.map((name) => {
            const color = seriesColors[name] || "#3aa3ff";
            return {
                label: name,
                data: parsed.seriesData[name],
                borderColor: color,
                backgroundColor: color,
                borderWidth: 2.5,
                pointRadius: 4,
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
                        labels: { color: '#a4afc3', boxWidth: 14 }
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
                }
            }
        });
    }

    // PDF Export Function keeping full color and high resolution
    function exportColorPDF() {
        const element = document.getElementById("pdf-export-area");
        const opt = {
            margin:       10,
            filename:     'Lotus_Shark_Graph_Report.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, backgroundColor: '#0b1018', useCORS: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };
        html2pdf().from(element).set(opt).save();
    }

    updateBtn.addEventListener("click", updateGraph);

    loadSampleBtn.addEventListener("click", () => {
        csvInput.value = defaultData;
        chartTitleInput.value = "Anti Dive (%) - Lotus Shark Kinematics";
        xAxisLabelInput.value = "Bump/Rebound (mm)";
        yAxisLabelInput.value = "Anti Dive (%)";
        seriesColors = {};
        updateGraph();
    });

    exportPdfBtn.addEventListener("click", exportColorPDF);

    updateGraph();
});
