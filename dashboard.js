// Helpers
function generateRandomName(base = "site") {
  const syllables = ["qua","neo","zen","nova","lyra","flux","gyro","aero","omni","cyra"];
  const random = syllables[Math.floor(Math.random() * syllables.length)];
  const suffix = Math.floor(Math.random() * 1000);
  return `${random}-${base}-${suffix}`;
}

function saveProject(project) {
  let projects = JSON.parse(localStorage.getItem("projects")||"[]");
  const idx = projects.findIndex(p=>p.id===project.id);
  if(idx>=0) projects[idx] = project;
  else projects.push(project);
  localStorage.setItem("projects", JSON.stringify(projects));
}

function loadProjects() {
  return JSON.parse(localStorage.getItem("projects")||"[]");
}

function renderProjectList() {
  const listEl = document.getElementById("projectList");
  listEl.innerHTML = "";
  const projects = loadProjects();
  projects.forEach(p=>{
    const div = document.createElement("div");
    div.className = "project-item";
    div.innerHTML = `<span>${p.name}</span><button data-id="${p.id}">✕</button>`;
    div.onclick = ()=>loadProject(p.id);
    div.querySelector("button").onclick = e=>{
      e.stopPropagation();
      deleteProject(p.id);
    };
    listEl.appendChild(div);
  });
}

// Inject code into iframe
function renderIframe(html, css, js) {
  const iframe = document.getElementById("preview");
  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  if(css){ const style=doc.createElement("style"); style.textContent=css; doc.head.appendChild(style); }
  if(js){ const script=doc.createElement("script"); script.textContent=js; doc.body.appendChild(script); }
  doc.close();
  document.getElementById("loading").style.display="none";
  iframe.style.display="block";
}

// Generate site using AI
async function generateSite(prompt, projectId=null) {
  const loading = document.getElementById("loading");
  loading.textContent = "Generating your AI website...";
  try {
    const res = await fetch("/api/ai-generate", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({prompt})
    });
    const data = await res.json();
    if(!data.output) throw new Error("No AI output");

    const htmlMatch = data.output.match(/```html([\s\S]*?)```/i);
    const cssMatch = data.output.match(/```css([\s\S]*?)```/i);
    const jsMatch = data.output.match(/```javascript([\s\S]*?)```/i);

    const html = htmlMatch?htmlMatch[1].trim():"<html><body><h1>No HTML generated</h1></body></html>";
    const css = cssMatch?cssMatch[1].trim():"";
    const js = jsMatch?jsMatch[1].trim():"";

    renderIframe(html,css,js);

    // Save project
    const project = {
      id: projectId||Date.now().toString(),
      name: document.getElementById("projectName").textContent,
      prompt, html, css, js
    };
    saveProject(project);
    renderProjectList();
  } catch(err) {
    console.error(err);
    document.getElementById("loading").textContent="❌ Failed to generate website.";
  }
}

// Load project by ID
function loadProject(id) {
  const project = loadProjects().find(p=>p.id===id);
  if(!project) return;
  document.getElementById("projectName").textContent=project.name;
  renderIframe(project.html,project.css,project.js);
}

// Delete project
function deleteProject(id) {
  let projects = loadProjects();
  projects = projects.filter(p=>p.id!==id);
  localStorage.setItem("projects", JSON.stringify(projects));
  renderProjectList();
  document.getElementById("loading").textContent = "Select a project";
  document.getElementById("preview").style.display = "none";
}

// Set device iframe size
function setDevice(type){
  const iframe=document.getElementById("preview");
  if(type==="desktop"){ iframe.style.width="100%"; iframe.style.height="100%"; }
  else if(type==="tablet"){ iframe.style.width="768px"; iframe.style.height="1024px"; }
  else if(type==="mobile"){ iframe.style.width="375px"; iframe.style.height="667px"; }
}

// Init dashboard
function initDashboard(){
  const prompt = localStorage.getItem("ai-prompt");
  let projectName;
  if(prompt){
    if(prompt.toLowerCase().includes(" for ")){
      projectName = prompt.split(" for ")[1].trim().replace(/\s+/g,"-").toLowerCase();
    } else {
      projectName = generateRandomName("site");
    }
    document.getElementById("projectName").textContent = projectName;
    generateSite(prompt);
    localStorage.removeItem("ai-prompt"); // prevent duplicate regeneration
  } else {
    document.getElementById("loading").textContent="Select a project from sidebar";
  }

  renderProjectList();

  document.getElementById("regenBtn").onclick = ()=>{
    const currentName = document.getElementById("projectName").textContent;
    const project = loadProjects().find(p=>p.name===currentName);
    if(project) generateSite(project.prompt, project.id);
  };
  document.getElementById("renameBtn").onclick = ()=>{
    const newName = prompt("Enter new project name:");
    if(newName){
      const currentName = document.getElementById("projectName").textContent;
      const project = loadProjects().find(p=>p.name===currentName);
      if(project){
        project.name=newName;
        saveProject(project);
        document.getElementById("projectName").textContent=newName;
        renderProjectList();
      }
    }
  };
  document.getElementById("backBtn").onclick = ()=>window.location.href="index.html";
}

// Run
initDashboard();
