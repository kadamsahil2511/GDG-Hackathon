import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const inputText = formData.get("inputText") as string;

  if (!inputText) {
    return Response.json({ error: "No input provided" }, { status: 400 });
  }

  try {
    let pythonArgs: string[];
    let tempFilePath: string | null = null;

    // Check if input is an image (data URL)
    if (inputText.startsWith("data:image/")) {
      // For images, save to temporary file to avoid E2BIG error
      tempFilePath = path.join(process.cwd(), "data", `temp_image_${Date.now()}.txt`);
      await fs.writeFile(tempFilePath, inputText, "utf-8");
      pythonArgs = ["AI-Agent/WebAgent.py", "--file", tempFilePath];
    } else {
      // For text, pass directly as argument
      pythonArgs = ["AI-Agent/WebAgent.py", inputText];
    }

    // Run the Python fact-checker with command line argument using virtual environment
    const pythonProcess = spawn("venv/bin/python", pythonArgs, {
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

    // Clean up temporary file if created
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
      } catch (cleanupError) {
        console.warn("Failed to cleanup temp file:", cleanupError);
      }
    }

    if (exitCode !== 0) {
      console.error("Python process stderr:", stderr);
      return Response.json({ 
        error: `Python process failed with exit code ${exitCode}`,
        details: stderr
      }, { status: 500 });
    }

    // Parse the result from stdout
    let result;
    try {
      result = JSON.parse(stdout.trim());
    } catch (parseError) {
      // If JSON parsing fails, try reading from file
      try {
        const resultsPath = path.join(process.cwd(), "data/results.json");
        const resultsData = await fs.readFile(resultsPath, "utf-8");
        const results = JSON.parse(resultsData);
        result = results[results.length - 1];
      } catch (fileError) {
        return Response.json({ 
          error: "Failed to parse result",
          details: `JSON parse error: ${parseError}, File read error: ${fileError}`,
          raw_output: stdout
        }, { status: 500 });
      }
    }

    return Response.json({ 
      success: true, 
      result: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error processing fact-check:", error);
    return Response.json({ 
      error: "Failed to process fact-check request",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}