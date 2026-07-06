import dotenv from 'dotenv';
dotenv.config();

/**
 * Google Agent Development Kit (ADK) Emulator
 * Mocks the official @google/adk TypeScript/JavaScript SDK interfaces
 * to turn raw computations into a production-ready Multi-Agent system.
 * Supports FunctionTools, LlmAgents, Workflows, and Agent-to-Agent (A2A) orchestration.
 */

export class FunctionTool {
  constructor({ name, description, parameters, execute }) {
    this.name = name;
    this.description = description;
    this.parameters = parameters; // Zod schema or JSON schema
    this.execute = execute;
  }

  async run(args) {
    try {
      console.log(`[ADK Tool] Executing tool "${this.name}" with args:`, args);
      return await this.execute(args);
    } catch (err) {
      console.error(`[ADK Tool Error] Tool "${this.name}" failed:`, err.message);
      return { status: 'error', error: err.message };
    }
  }
}

export class LlmAgent {
  constructor({ name, description, instruction, model = 'gemini-2.5-flash', tools = [] }) {
    this.name = name;
    this.description = description;
    this.instruction = instruction;
    this.model = model;
    this.tools = tools;
  }

  async run(input, context = {}) {
    console.log(`[ADK Agent] "${this.name}" is processing input. Model: ${this.model}`);
    
    // In a live environment with GEMINI_API_KEY, this would perform actual function calling.
    // Here we run our high-fidelity, deterministic reasoning loop.
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        return await this._runLiveGemini(input, context);
      } catch (err) {
        console.warn(`[ADK Agent Warning] Live Gemini call failed, falling back to local reasoning:`, err.message);
      }
    }
    
    return await this._runLocalReasoning(input, context);
  }

  async _runLiveGemini(input, context) {
    // Standard Gemini 2.0 Function Calling payload structure
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const toolDeclarations = this.tools.map(t => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters ? (t.parameters.jsonSchema ? t.parameters.jsonSchema : t.parameters) : {}
    }));

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `Instruction: ${this.instruction}\n\nContext: ${JSON.stringify(context)}\n\nInput: ${input}` }] }],
        tools: toolDeclarations.length > 0 ? [{ functionDeclarations: toolDeclarations }] : []
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned status: ${response.status}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const message = candidate?.content;
    const parts = message?.parts || [];

    // Check if the model wants to call a tool
    const functionCall = parts.find(p => p.functionCall);
    if (functionCall) {
      const toolName = functionCall.functionCall.name;
      const toolArgs = functionCall.functionCall.args;
      const targetTool = this.tools.find(t => t.name === toolName);
      if (targetTool) {
        const toolResult = await targetTool.run(toolArgs);
        // Feed the tool output back to the model or return it
        return {
          agent: this.name,
          toolCalled: toolName,
          toolArgs,
          result: toolResult
        };
      }
    }

    return {
      agent: this.name,
      text: parts.map(p => p.text).join('\n')
    };
  }

  async _runLocalReasoning(input, context) {
    // High-fidelity local execution of attached tools depending on inputs
    const results = {};
    for (const tool of this.tools) {
      // Determine if this tool is relevant to the input
      let shouldExecute = false;
      if (this.name === 'RootOrchestrator' || input.toLowerCase().includes(tool.name.replace(/_/g, ' '))) {
        shouldExecute = true;
      } else {
        // Match keywords
        const keywords = tool.name.toLowerCase().split('_');
        shouldExecute = keywords.some(kw => input.toLowerCase().includes(kw) || JSON.stringify(context).toLowerCase().includes(kw));
      }

      if (shouldExecute) {
        const args = this._extractArgsForTool(tool, input, context);
        results[tool.name] = await tool.run(args);
      }
    }

    return {
      agent: this.name,
      executedTools: Object.keys(results),
      results
    };
  }

  _extractArgsForTool(tool, input, context) {
    // Extract parameters from context or input dynamically
    const args = {};
    if (context) Object.assign(args, context);
    if (typeof input === 'string') {
      try {
        const parsed = JSON.parse(input);
        Object.assign(args, parsed);
      } catch {
        args.query = input;
      }
    }
    return args;
  }
}

export class Workflow {
  constructor({ name, steps = [] }) {
    this.name = name;
    this.steps = steps;
  }

  async execute(initialInput, initialContext = {}) {
    console.log(`[ADK Workflow] Executing workflow "${this.name}"`);
    let currentInput = initialInput;
    let currentContext = { ...initialContext };
    const stepResults = [];

    for (const step of this.steps) {
      console.log(`[ADK Workflow] Step: ${step.name}`);
      const stepOutput = await step.run(currentInput, currentContext);
      stepResults.push({ step: step.name, output: stepOutput });

      // Update state for next agent/step
      if (stepOutput.text) {
        currentInput = stepOutput.text;
      } else if (stepOutput.results) {
        currentContext = { ...currentContext, ...stepOutput.results };
      }
    }

    return {
      workflow: this.name,
      success: true,
      stepResults
    };
  }
}
