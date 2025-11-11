export interface PredefinedNodeData {
	starter: number[];
	popular: number[];
	youtube: Array<{
		id: string;
		title: string;
		description: string;
	}>;
}

export const NODE_DATA: Record<string, PredefinedNodeData> = {
	'@aura/aura-nodes-langchain.agent': {
		starter: [6270, 5462, 3100],
		popular: [2465, 2326, 2006],
		youtube: [
			{
				id: '4cQWJViybAQ',
				title: 'aura Quick Start Tutorial: Build Your First Workflow [2025]',
				description:
					'In this tutorial, @theflowgrammer walks you through the conceptual foundations you need to know to build powerful aura workflows from scratch.',
			},
			{
				id: '77Z07QnLlB8',
				title: 'Building AI Agents: Prompt Engineering for Beginners [Part 3]',
				description:
					'In Part 3 of our Building AI Agents series, we focus on the essentials of prompt engineering—specifically for single-task agents in aura.',
			},
		],
	},
	'@aura/aura-nodes-langchain.openAi': {
		starter: [3100, 2722, 5462],
		popular: [2462, 2783, 2187],
		youtube: [
			{
				id: '4cQWJViybAQ',
				title: 'aura Quick Start Tutorial: Build Your First Workflow [2025]',
				description:
					'In this tutorial, @theflowgrammer walks you through the conceptual foundations you need to know to build powerful aura workflows from scratch.',
			},
			{
				id: '77Z07QnLlB8',
				title: 'Building AI Agents: Prompt Engineering for Beginners [Part 3]',
				description:
					'In Part 3 of our Building AI Agents series, we focus on the essentials of prompt engineering—specifically for single-task agents in aura.',
			},
		],
	},
	'aura-nodes-base.googleSheets': {
		starter: [2581, 5462, 1751],
		popular: [5690, 2819, 6468],
		youtube: [
			{
				id: '4cQWJViybAQ',
				title: 'aura Quick Start Tutorial: Build Your First Workflow [2025]',
				description:
					'In this tutorial, @theflowgrammer walks you through the conceptual foundations you need to know to build powerful aura workflows from scratch.',
			},
			{
				id: 'IJdt_Ds-gmc',
				title: 'OpenAI and Google Sheets integration: Automated workflows (+ 2 Free Templates)',
				description:
					'In this video, we connect OpenAI and Google Sheets into two powerful workflows.',
			},
		],
	},
	'aura-nodes-base.gmail': {
		starter: [1953, 6277, 2722],
		popular: [3686, 3123, 3905],
		youtube: [
			{
				id: '4cQWJViybAQ',
				title: 'aura Quick Start Tutorial: Build Your First Workflow [2025]',
				description:
					'In this tutorial, @theflowgrammer walks you through the conceptual foundations you need to know to build powerful aura workflows from scratch.',
			},
			{
				id: 'UnSKuFJPtyk',
				title: 'Build Your First AI Agent for Free with No Code (aura + Google Gemini 2.5 Pro)',
				description:
					'Learn how to build your own AI-powered email assistant with zero coding using aura and Google Gemini. This step-by-step tutorial shows how to create an agent that can read, draft, and send emails on your behalf — all automatically.',
			},
		],
	},
	'aura-nodes-base.httpRequest': {
		starter: [1748, 3858, 5171],
		popular: [2035, 4110, 3100],
		youtube: [
			{
				id: '4cQWJViybAQ',
				title: 'aura Quick Start Tutorial: Build Your First Workflow [2025]',
				description:
					'In this tutorial, @theflowgrammer walks you through the conceptual foundations you need to know to build powerful aura workflows from scratch.',
			},
			{
				id: 'tKwvqgVEBOU',
				title: 'aura HTTP Request Node Made Simple: 10x Your Automations in 10 Minutes',
				description:
					"The aura HTTP Request node is the most powerful tool you're probably not using. Most aura users stick to pre-built integrations because the HTTP Request node looks intimidating, but mastering aura HTTP requests will literally 10x what you can automate.",
			},
		],
	},
	'@aura/aura-nodes-langchain.googleGemini': {
		starter: [6270, 4365, 3905],
		popular: [5993, 2753, 2466],
		youtube: [
			{
				id: '4cQWJViybAQ',
				title: 'aura Quick Start Tutorial: Build Your First Workflow [2025]',
				description:
					'In this tutorial, @theflowgrammer walks you through the conceptual foundations you need to know to build powerful aura workflows from scratch.',
			},
			{
				id: 'UnSKuFJPtyk',
				title: 'Build Your First AI Agent for Free with No Code (aura + Google Gemini 2.5 Pro)',
				description:
					'Learn how to build your own AI-powered email assistant with zero coding using aura and Google Gemini. This step-by-step tutorial shows how to create an agent that can read, draft, and send emails on your behalf — all automatically.',
			},
		],
	},
	'aura-nodes-base.googleDrive': {
		starter: [6611, 1960, 2782],
		popular: [2753, 4767, 3135],
		youtube: [
			{
				id: '4cQWJViybAQ',
				title: 'aura Quick Start Tutorial: Build Your First Workflow [2025]',
				description:
					'In this tutorial, @theflowgrammer walks you through the conceptual foundations you need to know to build powerful aura workflows from scratch.',
			},
			{
				id: 'vqZTpKGh_jU',
				title: 'I Automated My Entire Google Drive With aura – It Organizes Itself',
				description:
					'In this video, learn how to use aura to automatically organize your Google Drive files From organizing files to streamlining tasks, discover smart ways to boost productivity in just minutes!',
			},
		],
	},
	'aura-nodes-base.telegram': {
		starter: [2462, 2114, 4365],
		popular: [3654, 2783, 3686],
		youtube: [
			{
				id: '4cQWJViybAQ',
				title: 'aura Quick Start Tutorial: Build Your First Workflow [2025]',
				description:
					'In this tutorial, @theflowgrammer walks you through the conceptual foundations you need to know to build powerful aura workflows from scratch.',
			},
			{
				id: 'ODdRXozldPw',
				title: 'How to build a Telegram AI bot with aura – Step-by-step tutorial',
				description:
					"In this video, we’ll guide you through the workflow that integrates with Telegram to create an AI-powered chatbot. It uses OpenAI's Chat Model and Dall-E 3 to understand and respond to user messages, correct errors, and generate and send images based on user queries.",
			},
		],
	},
};
