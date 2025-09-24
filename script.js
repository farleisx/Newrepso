document.getElementById("generate").addEventListener("click", async () => {
  const prompt = document.getElementById("prompt").value;
  const responseBox = document.getElementById("response");
  responseBox.textContent = "Loading...";

  try {
    const res = await fetch("/api/ai-generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },document.getElementById("generate").addEventListener("click", async () => {
  const prompt = document.getElementById("prompt").value;
  const responseBox = document.getElementById("response");
  responseBox.textContent = "Loading...";

  try {
    const res = await fetch("/api/ai-generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    responseBox.textContent = data.output || "No response from AI.";
  } catch (err) {
    console.error(err);
    responseBox.textContent = "Error fetching AI response.";
  }
});

      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    responseBox.textContent = data.output || "No response from AI.";
  } catch (err) {
    console.error(err);
    responseBox.textContent = "Error fetching AI response.";
  }
});
