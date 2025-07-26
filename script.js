const saveBtn = document.getElementById('saveBtn');
const summarizeBtn = document.getElementById('summarizeBtn');
const entry = document.getElementById('entry');
const mood = document.getElementById('mood');
const summary = document.getElementById('summary');

let logs = JSON.parse(localStorage.getItem('journalLogs')) || [];
const submitBtn = document.getElementById("submit");
const entryEl = document.getElementById("entry");
const summaryEl = document.getElementById("summary");

submitBtn.addEventListener("click", async () => {
  const content = entryEl.value.trim();
  if (!content) return alert("Please write something first!");

  summaryEl.textContent = "Generating summary...";
  const summary = await generateSummary(content);
  summaryEl.textContent = summary;

  saveToLocal(content, summary);
  updateMoodChart();
});

function saveToLocal(content, summary) {
  const data = JSON.parse(localStorage.getItem("entries") || "[]");
  const date = new Date().toISOString().split("T")[0];
  data.push({ date, content, summary });
  localStorage.setItem("entries", JSON.stringify(data));
}

async function generateSummary(text) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer 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"
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        { role: "system", content: "Summarize the following journal entry briefly." },
        { role: "user", content: text }
      ]
    })
  });

  const result = await response.json();
  return result.choices?.[0]?.message?.content || "Failed to generate summary.";
}

// Simple mood chart stub
let moodChart;
function updateMoodChart() {
  const data = JSON.parse(localStorage.getItem("entries") || "[]");
  const labels = data.map(e => e.date);
  const moods = data.map((e, i) => (e.summary.includes("happy") ? 5 : 3 + (i % 3))); // dummy scoring

  if (moodChart) moodChart.destroy();

  moodChart = new Chart(document.getElementById("moodChart").getContext("2d"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Mood",
        data: moods,
        borderColor: "#3b82f6",
        backgroundColor: "#93c5fd",
        tension: 0.3
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true, max: 5 }
      }
    }
  });
}

saveBtn.onclick = () => {
  const text = entry.value.trim();
  const moodValue = mood.value;
  if (!text) return alert("Please write something!");

  logs.push({ text, mood: moodValue, date: new Date().toISOString() });
  localStorage.setItem('journalLogs', JSON.stringify(logs));
  entry.value = "";
  alert("Saved!");
  renderChart();
};

summarizeBtn.onclick = async () => {
  const text = entry.value.trim();
  if (!text) return alert("Write something first!");
  
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer YOUR_OPENAI_API_KEY",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: `Summarize this: ${text}` }],
      max_tokens: 50
    })
  });

  const data = await res.json();
  summary.innerText = data.choices[0].message.content;
};

function renderChart() {
  const moodCounts = logs.reduce((acc, log) => {
    acc[log.mood] = (acc[log.mood] || 0) + 1;
    return acc;
  }, {});

  const ctx = document.getElementById('moodChart').getContext('2d');
  if (window.moodChart) window.moodChart.destroy();

  window.moodChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(moodCounts),
      datasets: [{
        label: 'Mood Tracker',
        data: Object.values(moodCounts),
        backgroundColor: ['#4ade80', '#facc15', '#f87171']
      }]
    },
    options: {
      responsive: true
    }
  });
}

renderChart();
