// Helpers
function generateRandomName(base = "site") {
  const syllables = ["qua","neo","zen","nova","lyra","flux","gyro","aero","omni","cyra"];
  const random = syllables[Math.floor(Math.random() * syllables.length)];
  const suffix = Math.floor(Math.random() * 1000);
  return `${random}-${base}-${suffix}`;
}

// Inject code into iframe
function renderIframe(html, css, js) {
  const iframe = document.getElementById("preview");
  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  if(css) {
    const style = doc.createElement("style");
    style.textContent = css;
    doc.head.appendChild(style);
  }
  if(js) {
    const script = doc.createElement("script");
    script.textContent = js;
    doc.body.appendChild(script);
  }
  doc.close();

  document.getElementById("loading").style.display = "none";
  iframe.style.display = "block";
  updateProgress(100); // complete
}

// Smooth live progress
let progressInterval;
function updateProgress(targetPercent) {
  const container = document.getElementById("progress-container");
  const bar = document.getElementById("progress-bar");
  container.style.display = "block";

  clearInterval(progressInterval);
  progressInterval = setInterval(() => {
    let current = parseFloat(bar.style.width) || 0;
    if(current < targetPercent) {
      bar.style.width = Math.min(current + 1, targetPercent) + "%";
    } else {
      clearInterval(progressInterval);
      if(targetPercent >= 100) {
        setTimeout(() => {
          container.style.display = "none";
          bar.style.width = "0%";
        }, 500);
      }
    }
  }, 15);
}

// Fetch AI code with live progress
async function generateSite(prompt) {
  const loading = document.getElementById("loading");
  loading.style.display = "block";
  loading.textContent = "Generating your AI website...";
  updateProgress(5);

  try {
    const res = await fetch("/api/ai-generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    // simulate live progress
    let fakeProgress = 10;
    const fakeInterval = setInterval(() => {
      if(fakeProgress < 70) { fakeProgress += Math.random() * 5; updateProgress(fakeProgress); }
      else clearInterval(fakeInterval);
    }, 200);

    const data = await res.json();
    updateProgress(80);

    const htmlMatch = data.output.match(/```html([\s\S]*?)```/i);
    const cssMatch = data.output.match(/```css([\s\S]*?)```/i);
    const jsMatch = data.output.match(/```javascript([\s\S]*?)```/i);

    const html = htmlMatch ? htmlMatch[1].trim() : "<html><body><h1>No HTML generated</h1></body></html>";
    const css = cssMatch ? cssMatch[1].trim() : "";
    const js = jsMatch ? jsMatch[1].trim() : "";

    renderIframe(html, css, js);

  } catch(err) {
    console.error(err);
    loading.textContent = "❌ Failed to generate website.";
  }
}

// AI Chat handler with live progress
async function chatWithAI(instruction) {
  if(!instruction || instruction.trim() === "") return;

  const loading = document.getElementById("loading");
  loading.style.display = "block";
  loading.textContent = "Applying AI changes...";
  updateProgress(10);

  try {
    const res = await fetch("/api/ai-generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        prompt: `${localStorage.getItem("ai-prompt")}\n\nApply the following instruction to the generated website: "${instruction}"` 
      })
    });

    // simulate live progress
    let fakeProgress = 20;
    const fakeInterval = setInterval(() => {
      if(fakeProgress < 70) { fakeProgress += Math.random() * 5; updateProgress(fakeProgress); }
      else clearInterval(fakeInterval);
    }, 150);

    const data = await res.json();
    updateProgress(90);

    const htmlMatch = data.output.match(/```html([\s\S]*?)```/i);
    const cssMatch = data.output.match(/```css([\s\S]*?)```/i);
    const jsMatch = data.output.match(/```javascript([\s\S]*?)```/i);

    const html = htmlMatch ? htmlMatch[1].trim() : "<html><body><h1>No HTML generated</h1></body></html>";
    const css = cssMatch ? cssMatch[1].trim() : "";
    const js = jsMatch ? jsMatch[1].trim() : "";

    renderIframe(html, css, js);

  } catch(err) {
    console.error(err);
    loading.textContent = "❌ Failed to apply changes.";
  }
}

// Initialize dashboard
function initDashboard() {
  const prompt = localStorage.getItem("ai-prompt");
  if(!prompt) { alert("No prompt found. Redirecting..."); window.location.href="index.html"; return; }

  let projectName;
  if(prompt.toLowerCase().includes(" for ")) {
    projectName = prompt.split(" for ")[1].trim().replace(/\s+/g,"-").toLowerCase();
  } else projectName = generateRandomName("site");

  document.getElementById("projectName").textContent = projectName;

  generateSite(prompt);

  // Buttons
  document.getElementById("backBtn").onclick = () => window.location.href = "index.html";
  document.getElementById("regenBtn").onclick = () => generateSite(prompt);
  document.getElementById("renameBtn").onclick = () => {
    const newName = prompt("Enter new project name:", projectName);
    if(newName && newName.trim() !== "") {
      projectName = newName.trim();
      document.getElementById("projectName").textContent = projectName;
    }
  };

  // Chat input
  document.getElementById("ai-chat-send").onclick = () => {
    const instruction = document.getElementById("ai-chat-input").value;
    chatWithAI(instruction);
    document.getElementById("ai-chat-input").value = "";
  };
  document.getElementById("ai-chat-input").addEventListener("keypress", (e) => {
    if(e.key === "Enter") document.getElementById("ai-chat-send").click();
  });
}

// Run
initDashboard();
