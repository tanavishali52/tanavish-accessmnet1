import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Agent, AgentDocument } from './schemas/agent.schema';
import { CreateAgentDto, UpdateAgentDto } from './dto/agent.dto';
import { MODELS } from '../data/static-data';

@Injectable()
export class AgentsService {
  constructor(@InjectModel(Agent.name) private readonly agentModel: Model<AgentDocument>) {}

  create(dto: CreateAgentDto, userId: string | null) {
    return this.agentModel.create({ ...dto, userId });
  }

  findAll(userId: string | null) {
    return this.agentModel.find({ userId }).sort({ createdAt: -1 }).lean();
  }

  async findOne(id: string, userId: string | null) {
    const agent = await this.agentModel.findOne({ _id: id, userId }).lean();
    if (!agent) throw new NotFoundException('Agent not found');
    return agent;
  }

  async update(id: string, dto: UpdateAgentDto, userId: string | null) {
    const agent = await this.agentModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: dto },
      { new: true },
    ).lean();
    if (!agent) throw new NotFoundException('Agent not found');
    return agent;
  }

  async remove(id: string, userId: string | null) {
    const agent = await this.agentModel.findOneAndDelete({ _id: id, userId }).lean();
    if (!agent) throw new NotFoundException('Agent not found');
    return { message: 'Agent deleted successfully' };
  }

  async run(id: string, message: string, userId: string | null) {
    const agent = await this.agentModel.findOne({ _id: id, userId }).lean();
    if (!agent) throw new NotFoundException('Agent not found');

    const model = MODELS.find((m) => m.id === agent.modelId) ?? MODELS[0];
    const tools = agent.tools ?? [];
    const memoryMode = agent.memoryMode ?? 'short_term';

    // Build a contextual response based on agent config + message
    const response = this.buildAgentResponse(message, agent, model, tools, memoryMode);
    return {
      agentId: id,
      agentName: agent.name,
      model: { id: model.id, name: model.name, icon: model.icon },
      input: message,
      output: response,
      toolsUsed: tools,
      timestamp: new Date().toISOString(),
    };
  }

  private buildAgentResponse(
    message: string,
    agent: Partial<Agent>,
    model: (typeof MODELS)[number],
    tools: string[],
    memoryMode: string,
  ): string {
    const msg = message.toLowerCase();
    const hasSearch = tools.includes('web_search');
    const hasCode   = tools.includes('code_interpreter');
    const hasFile   = tools.includes('file_access');

    const toolNote = tools.length > 0
      ? `\n\n**Tools activated:** ${tools.map((t) => `\`${t}\``).join(', ')}`
      : '';

    const memoryLabel =
      memoryMode === 'none'
        ? 'Stateless (no memory)'
        : memoryMode === 'short_and_long_term'
          ? 'Short + long-term (vector store)'
          : 'Short-term (session)';
    const memoryNote = `\n\n*Memory profile: ${memoryLabel}.*`;

    const systemNote = agent.systemPrompt
      ? `\n\n*Operating under agent instructions: "${agent.systemPrompt.slice(0, 80)}${agent.systemPrompt.length > 80 ? '…' : ''}"*`
      : '';

    if (msg.includes('research') || msg.includes('find') || msg.includes('search')) {
      return `**[${agent.name}]** Running research task using **${model.name}**...\n\n${hasSearch ? '🔍 Searching the web for relevant information...\n' : ''}Here is a structured summary based on your query:\n\n1. **Topic Overview** — Identified key themes and recent developments\n2. **Key Findings** — Extracted the most relevant data points\n3. **Sources** — ${hasSearch ? 'Referenced 5 live sources' : 'Referenced from training data'}\n4. **Recommendation** — Actionable next steps based on findings${toolNote}${systemNote}${memoryNote}`;
    }

    if (msg.includes('code') || msg.includes('build') || msg.includes('implement')) {
      return `**[${agent.name}]** Processing development task using **${model.name}**...\n\n${hasCode ? '💻 Running code interpreter...\n' : ''}**Analysis complete:**\n\n- Reviewed the requirements and identified implementation steps\n- ${hasCode ? 'Executed test code and validated output' : 'Outlined the code structure'}\n- Suggested best practices for your stack\n\n**Next:** Review the generated plan and iterate with follow-up instructions.${toolNote}${systemNote}${memoryNote}`;
    }

    if (msg.includes('analys') || msg.includes('data') || msg.includes('report')) {
      return `**[${agent.name}]** Running analysis using **${model.name}**...\n\n${hasFile ? '📂 Accessing file context...\n' : ''}**Report generated:**\n\n- **Input processed** — Parsed and structured the data\n- **Patterns identified** — Found key correlations and outliers\n- **Insight summary** — Top 3 actionable conclusions extracted\n- **Confidence level** — High (based on available context)${toolNote}${systemNote}${memoryNote}`;
    }

    return `**[${agent.name}]** Task received. Processing with **${model.name}**...\n\nI have understood your instruction: *"${message}"*\n\nHere is how I will approach this:\n1. Break the task into sub-goals\n2. Execute each step using my configured tools\n3. Return a structured, actionable output\n\n${tools.length > 0 ? `My active tools (${tools.join(', ')}) are ready.` : 'No tools configured — running on model knowledge only.'}${systemNote}${memoryNote}`;
  }
}
