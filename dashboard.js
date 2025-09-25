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
}

// Slow, realistic progress bar helper
function startProgressBar() {
  const container = document.getElementById("progress-container");
  const bar = document.getElementById("progress-bar");
  container.style.display = "block";
  bar.style.width = "0%";

  let progress = 0;
  const interval = setInterval(() => {
    if(progress < 95) {
      progress += 5; // 5% every tick
      bar.style.width = progress + "%";
    }
  }, 5000); // every 5 seconds

  return interval; // return interval ID so we can clear it
}

function finishProgressBar() {
  const container = document.getElementById("progress-container");
  const bar = document.getElementById("progress-bar");
  bar.style.width = "100%";
  setTimeout(() => {
    container.style.display = "none";
    bar.style.width = "0%";
  }, 500);
}

// Fetch AI code with slow progress
async function generateSite(prompt) {
  const loading = document.getElementById("loading");
  loading.style.display = "block";
  loading.textContent = "Generating your AI website...";

  const interval = startProgressBar();

  try {
    const res = await fetch("/api/ai-generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();
    clearInterval(interval);

    const htmlMatch = data.output.match(/```html([\s\S]*?)```/i);
    const cssMatch = data.output.match(/```css([\s\S]*?)```/i);
    const jsMatch = data.output.match(/```javascript([\s\S]*?)```/i);

    const html = htmlMatch ? htmlMatch[1].trim() : "<html><body><h1>No HTML generated</h1></body></html>";
    const css = cssMatch ? cssMatch[1].trim() : "";
    const js = jsMatch ? jsMatch[1].trim() : "";

    renderIframe(html, css, js);
    finishProgressBar();

  } catch(err) {
    clearInterval(interval);
    console.error(err);
    loading.textContent = "❌ Failed to generate website.";
  }
}

// AI Chat handler with slow progress
async function chatWithAI(instruction) {
  if(!instruction || instruction.trim() === "") return;

  const loading = document.getElementById("loading");
  loading.style.display = "block";
  loading.textContent = "Applying AI changes...";

  const interval = startProgressBar();

  try {
    const res = await fetch("/api/ai-generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        prompt: `${localStorage.getItem("ai-prompt")}\n\nApply the following instruction to the generated website: "${instruction}"` 
      })
    });

    const data = await res.json();
    clearInterval(interval);

    const htmlMatch = data.output.match(/```html([\s\S]*?)```/i);
    const cssMatch = data.output.match(/```css([\s\S]*?)```/i);
    const jsMatch = data.output.match(/```javascript([\s\S]*?)```/i);

    const html = htmlMatch ? htmlMatch[1].trim() : "<html><body><h1>No HTML generated</h1></body></html>";
    const css = cssMatch ? cssMatch[1].trim() : "";
    const js = jsMatch ? jsMatch[1].trim() : "";

    renderIframe(html, css, js);
    finishProgressBar();

  } catch(err) {
    clearInterval(interval);
    console.error(err);
    loading.textContent = "❌ Failed to apply changes.";
  }
}

// Initialize dashboard
function initDashboard() {
  const storedPrompt = localStorage.getItem("ai-prompt");
  if(!storedPrompt) { alert("No prompt found. Redirecting..."); window.location.href="index.html"; return; }

  let projectName = localStorage.getItem("project-name"); // load saved name
  if(!projectName) {
    if(storedPrompt.toLowerCase().includes(" for ")) {
      projectName = storedPrompt.split(" for ")[1].trim().replace(/\s+/g,"-").toLowerCase();
    } else {
      projectName = generateRandomName("site");
    }
  }

  document.getElementById("projectName").textContent = projectName;

  generateSite(storedPrompt);

  // Buttons
  document.getElementById("backBtn").onclick = () => window.location.href = "index.html";
  document.getElementById("regenBtn").onclick = () => generateSite(storedPrompt);
  document.getElementById("renameBtn").onclick = () => {
    const newName = prompt("Enter new project name:", projectName);
    if(newName && newName.trim() !== "") {
      projectName = newName.trim();
      localStorage.setItem("project-name", projectName); // save to localStorage
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
