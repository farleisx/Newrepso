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

  if (css) {
    const style = doc.createElement("style");
    style.textContent = css;
    doc.head.appendChild(style);
  }

  if (js) {
    const script = doc.createElement("script");
    script.textContent = js;
    doc.body.appendChild(script);
  }

  doc.close();
  document.getElementById("loading").style.display = "none";
  iframe.style.display = "block";
}

// Fetch AI code
async function generateSite(prompt) {
  const loading = document.getElementById("loading");
  loading.textContent = "Generating your AI website...";
  try {
    const res = await fetch("/api/ai-generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    if (!data.output) throw new Error("No AI output");

    const htmlMatch = data.output.match(/```html([\s\S]*?)```/i);
    const cssMatch = data.output.match(/```css([\s\S]*?)```/i);
    const jsMatch = data.output.match(/```javascript([\s\S]*?)```/i);

    const html = htmlMatch ? htmlMatch[1].trim() : "<html><body><h1>No HTML generated</h1></body></html>";
    const css = cssMatch ? cssMatch[1].trim() : "";
    const js = jsMatch ? jsMatch[1].trim() : "";

    renderIframe(html, css, js);
  } catch (err) {
    console.error(err);
    loading.textContent = "❌ Failed to generate website.";
  }
}

// Init dashboard
function initDashboard() {
  const prompt = localStorage.getItem("ai-prompt");
  if (!prompt) {
    alert("No prompt found. Redirecting...");
    window.location.href = "index.html";
    return;
  }

  let projectName;
  if (prompt.toLowerCase().includes(" for ")) {
    projectName = prompt.split(" for ")[1].trim().replace(/\s+/g, "-").toLowerCase();
  } else {
    projectName = generateRandomName("site");
  }
  document.getElementById("project-name").textContent = projectName;

  generateSite(prompt);

  document.getElementById("backBtn").onclick = () => window.location.href = "index.html";
  document.getElementById("regenBtn").onclick = () => generateSite(prompt);
}

// Run
initDashboard();
