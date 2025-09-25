let currentCode = ""; // Stores current AI code for updates

// Helpers
function generateRandomName(base = "site") {
  const syllables = ["qua","neo","zen","nova","lyra","flux","gyro","aero","omni","cyra"];
  const random = syllables[Math.floor(Math.random() * syllables.length)];
  const suffix = Math.floor(Math.random() * 1000);
  return `${random}-${base}-${suffix}`;
}

// Render into iframe
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

// Extract code blocks
function parseCodeBlocks(aiOutput) {
  const matches = [...aiOutput.matchAll(/```(\w+)[\s\S]*?```/g)];
  const blocks = {};
  matches.forEach(m => {
    const lang = m[1];
    const code = m[0].replace(/```(\w+)?/,"").replace(/```$/,"").trim();
    blocks[lang] = code;
  });
  return blocks;
}

// Generate or update site
async function generateSite(prompt) {
  const loading = document.getElementById("loading");
  loading.textContent = "Generating your AI website...";

  try {
    const res = await fetch("/api/ai-generate", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ prompt, previousCode: currentCode })
    });
    const data = await res.json();
    if (!data.output) throw new Error("No AI output");

    const blocks = parseCodeBlocks(data.output);
    currentCode = data.output; // save for future edits
    renderIframe(blocks.html || "<body></body>", blocks.css || "", blocks.javascript || "");
  } catch (err) {
    console.error(err);
    document.getElementById("loading").textContent = "❌ Failed to generate website.";
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

  // Chat input for AI tweaks
  const chatInput = document.getElementById("ai-chat-input");
  const chatSend = document.getElementById("ai-chat-send");
  chatSend.onclick = () => {
    const msg = chatInput.value.trim();
    if (!msg) return;
    generateSite(msg);
    chatInput.value = "";
  };

  document.getElementById("backBtn").onclick = () => window.location.href = "index.html";
  document.getElementById("regenBtn").onclick = () => generateSite(prompt);
}

// Run dashboard
initDashboard();
