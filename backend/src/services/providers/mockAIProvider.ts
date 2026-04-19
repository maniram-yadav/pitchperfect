import { AIProvider } from '../../types/aiProvider';
import { EmailGenerationInput, Email, SequenceEmail } from '../../types/index';

export class MockAIProvider implements AIProvider {
  name = 'mock';

  async generateEmails(input: EmailGenerationInput): Promise<Email[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const emails: Email[] = [];

    // If custom input is provided, generate mock emails based on it
    if (input.useCustomInput && input.customPrompt) {
      const customSubjects = [
        `[Custom] Inquiry about collaboration`,
        `[Custom] Thought about your recent work`,
        `[Custom] Quick opportunity to discuss`,
        `[Custom] Interested in connecting`,
      ];

      const customBodies = [
        `Based on your profile and my research, I think there's a strong potential fit. I'd love to discuss how we might collaborate.\n\nWould you be open to a conversation?`,
        `I've been reviewing your work in this space and think our approaches align well. Could be valuable to connect.\n\nFree for a quick call?`,
        `Your experience aligns with what we're building. I think a discussion could be mutually beneficial.\n\nInterested in learning more?`,
        `I came across your recent projects and was impressed. I think we should explore potential synergies.\n\nWould you be available to chat?`,
      ];

      for (let i = 0; i < input.variations; i++) {
        emails.push({
          subject: customSubjects[i % customSubjects.length],
          body: customBodies[i % customBodies.length],
          variation: i + 1,
        });
      }
      return emails;
    }

    // Default behavior for structured input
    const mockSubjects = [
      `Quick question about ${input.targetIndustry || 'your industry'}`,
      `${input.senderCompany || 'We'} + ${input.targetIndustry || 'your niche'} = 🚀`,
      `Worth a 15 min call?`,
      `Helping ${input.targetRole || 'professionals'}s reduce ${input.painPoints?.[0] || 'complexity'}`,
      `New approach for ${input.targetIndustry || 'your space'}`,
      `${input.senderName || 'Hi'} from ${input.senderCompany || 'our company'}`,
    ];

    const mockBodies = [
      `Hi there! I noticed you're in ${input.targetIndustry || 'tech'}. We help companies like yours with ${input.valueProposition || 'solving pain points'}. Would love to chat about how we could help. Free?`,
      `Quick thought - we've helped similar companies reduce time-to-value by 40%. Curious if you're open to a brief conversation about ${input.usp || 'what makes us different'}?`,
      `${input.senderName || 'Name'} here from ${input.senderCompany || 'Company'}. Saw your profile and thought our ${input.productDescription || 'solution'} might interest you.`,
      `Hey! Noticed you're focused on ${input.targetIndustry || 'this space'}. We solve this exact problem - ${input.valueProposition || 'with proven results'}}. Chat?`,
      `I came across your profile and think there could be a good fit. We specialize in helping ${input.targetRole || 'leaders'}} like you with ${input.usp || 'innovative solutions'}}. Worth exploring?`,
      `Been following ${input.targetIndustry || 'your industry'}} trends. Your team seems like a good match for what we're building. Quick call next week?`,
    ];

    for (let i = 0; i < input.variations; i++) {
      emails.push({
        subject: mockSubjects[i % mockSubjects.length],
        body: mockBodies[i % mockBodies.length],
        variation: i + 1,
      });
    }

    return emails;
  }

  async generateSequence(input: EmailGenerationInput): Promise<SequenceEmail[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return [
      {
        day: 1,
        subject: `Initial outreach: ${input.senderCompany || 'Partnership opportunity'}`,
        body: `Hi ${input.targetRole || 'there'},\n\nI came across your profile and think there could be a good fit between what we do at ${input.senderCompany || 'our company'} and your work in ${input.targetIndustry || 'your industry'}.\n\nWould you be open to a brief conversation?\n\nBest,\n${input.senderName || 'Name'}`,
      },
      {
        day: 3,
        subject: `Follow-up: ${input.usp || 'Potential opportunity'}}`,
        body: `Hi ${input.targetRole || 'there'},\n\nDidn't hear back - wanted to follow up! Here's why I think we could help: ${input.valueProposition || 'we solve critical problems'}}.\n\nIf this interests you, let's grab 15 mins.\n\nBest,\n${input.senderName || 'Name'}`,
      },
      {
        day: 7,
        subject: `Final follow-up: Worth a quick call?`,
        body: `Hi ${input.targetRole || 'there'},\n\nOne final attempt - I really think you should hear about ${input.productDescription || 'what we offer'}}.\n\nLet me know if you'd be open to a quick call.\n\nBest,\n${input.senderName || 'Name'}`,
      },
      {
        day: 14,
        subject: `Different angle: Might be relevant`,
        body: `Hi ${input.targetRole || 'there'},\n\nThought of you while working with another ${input.targetIndustry || 'similar'}} company. Realized we might be able to help you too.\n\nWorth a conversation?\n\nBest,\n${input.senderName || 'Name'}`,
      },
    ];
  }
}
