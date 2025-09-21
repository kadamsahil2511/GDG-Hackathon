import type { ActionFunctionArgs } from 'react-router';
import { spawn } from 'child_process';
import path from 'path';

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const formData = await request.formData();
    const url = formData.get('url') as string;

    if (!url) {
      return Response.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return Response.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Path to the Python script
    const scriptPath = path.join(process.cwd(), 'AI-Agent', 'PageAnalyzer.py');
    
    // Execute the Python script
    const pythonProcess = spawn('python', [scriptPath, url], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        PYTHONPATH: path.join(process.cwd(), 'venv', 'lib', 'python3.13', 'site-packages'),
        VIRTUAL_ENV: path.join(process.cwd(), 'venv')
      }
    });

    let output = '';
    let errorOutput = '';

    // Collect stdout
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    // Collect stderr
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // Wait for the process to complete
    const result = await new Promise<{ success: boolean; data?: any; error?: string }>((resolve) => {
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const jsonOutput = JSON.parse(output);
            resolve({ success: true, data: jsonOutput });
          } catch (parseError) {
            console.error('Failed to parse Python output:', parseError);
            console.error('Raw output:', output);
            resolve({ 
              success: false, 
              error: `Failed to parse analysis results: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`
            });
          }
        } else {
          console.error('Python script failed with code:', code);
          console.error('Error output:', errorOutput);
          console.error('Standard output:', output);
          resolve({ 
            success: false, 
            error: `Analysis failed (exit code ${code}): ${errorOutput || 'Unknown error'}`
          });
        }
      });

      pythonProcess.on('error', (error) => {
        console.error('Failed to start Python process:', error);
        resolve({ 
          success: false, 
          error: `Failed to start analysis: ${error.message}`
        });
      });

      // Set a timeout for the analysis (30 seconds)
      setTimeout(() => {
        pythonProcess.kill();
        resolve({ 
          success: false, 
          error: 'Analysis timed out after 30 seconds'
        });
      }, 30000);
    });

    if (result.success) {
      return Response.json(result.data);
    } else {
      return Response.json({ error: result.error }, { status: 500 });
    }

  } catch (error) {
    console.error('Page analysis API error:', error);
    return Response.json(
      { error: 'Internal server error during analysis' },
      { status: 500 }
    );
  }
}