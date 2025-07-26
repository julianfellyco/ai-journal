const saveBtn = document.getElementById('saveBtn');
const summarizeBtn = document.getElementById('summarizeBtn');
const entry = document.getElementById('entry');
const mood = document.getElementById('mood');
const summary = document.getElementById('summary');

let logs = JSON.parse(localStorage.getItem('journalLogs')) || [];

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
