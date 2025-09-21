import { spawn } from "child_process";
import path from "path";

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const searchQuery = formData.get("query") as string;

  if (!searchQuery) {
    return Response.json({ error: "No search query provided" }, { status: 400 });
  }

  try {
    // Run the Google search Python script
    const pythonProcess = spawn("venv/bin/python", ["AI-Agent/GoogleSearchAgent.py", searchQuery], {
      stdio: ["pipe", "pipe", "pipe"],
      cwd: process.cwd()
    });

    let stdout = "";
    let stderr = "";

    pythonProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    // Wait for process to complete
    const exitCode = await new Promise((resolve, reject) => {
      pythonProcess.on("close", (code) => {
        resolve(code);
      });
      pythonProcess.on("error", (err) => {
        reject(err);
      });
    });

    if (exitCode !== 0) {
      console.error("Google search process stderr:", stderr);
      return Response.json({ 
        error: `Search process failed with exit code ${exitCode}`,
        details: stderr
      }, { status: 500 });
    }

    // Parse the search results
    let searchResults;
    try {
      searchResults = JSON.parse(stdout.trim());
    } catch (parseError) {
      return Response.json({ 
        error: "Failed to parse search results",
        details: parseError instanceof Error ? parseError.message : "Unknown parsing error",
        raw_output: stdout
      }, { status: 500 });
    }

    return Response.json({ 
      success: true, 
      results: searchResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error processing search:", error);
    return Response.json({ 
      error: "Failed to process search request",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}