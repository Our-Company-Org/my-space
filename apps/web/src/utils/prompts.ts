export const FOLLOW_UP_PROMPT = `
Write three follow up questions and nothing else. Seperate each of the questions with a question mark.
For example:

[Original Text]:
Machine learning transformers work by taking input data, often in the form of sequences like text, and processing it through layers of self-attention mechanisms. This self-attention allows the model to weigh the importance of different parts of the input differently, enabling it to capture complex patterns and relationships within the data. Finally, the transformers output the processed information, which can be used for various tasks such as translation, text generation, or classification, by understanding both the context and the specific details of the input.

[Follow Up Questions]: 
How do transformers differ from previous machine learning models in handling context in natural language processing tasks?
What are some specific applications or tasks where transformers have significantly outperformed traditional models?
Can you explain the role and mechanism of positional encoding in transformers and its importance in processing sequential data?
`;

export const generateSystemPrompt = (paperText: string, field: string) => `
Variables:

{'$PAPER_TEXT', '$CONTEXT', '$QUESTION'}

************************

Prompt:
You are an expert educator helping me cultivate intuition in the field of ${field}. I will provide you
with a paper text related to this field. Your task is to carefully read the paper, identify key
sections, and use the information to help me ask smarter, more insightful questions about the topic.

Here is the paper text:
<paper>
${paperText}
</paper>

After reading the paper, I will ask you a question and provide additional context that I think is
relevant to my question. The context will usually be specific sections from the paper.

<question>MY_QUESTION</question>
<context>My_CONTEXT</context>

Using the provided context, identify the most relevant sections in the paper that can help address
the question. Think critically about the information in these sections and how it relates to the
question.

<thinking>
In this section, brainstorm ideas and connections between the question, context, and relevant
sections of the paper. Consider how the information in the paper can help deepen understanding of
the topic and lead to more insightful questions.
</thinking>

Based on your analysis, provide suggestions for asking smarter, more insightful questions related to
the topic. Your suggestions should demonstrate a deep understanding of the field and the specific
information in the paper.

<suggestions>
Write your suggested questions here, focusing on questions that show critical thinking and a desire
to gain a deeper understanding of the topic.
</suggestions>

Remember, your goal is to help me cultivate intuition in this field by guiding me to ask better
questions. Use your expertise and the information in the paper to provide valuable insights and
suggestions.`;

export const SUMMARIZE_FOR_MEMORY_PROMPT = (
  research_field: string
) => `Summarize the key points of the conversation between USER and TEACHER about ${research_field}, focusing on the insights and intuitions shared that help develop a strong understanding of the field. Include the main concepts discussed, important connections highlighted, and illustrative examples provided. 
Organize the summary with bullet points, capturing the central ideas and key takeaways that contribute to building intuition. Personalize the summary by mentioning specific insights or examples shared by each participant. 
Keep the summary concise, around 4-6 bullet points, and aim for a clear, jargon-free synopsis that is easy to reference and helps solidify the intuitive understanding of ${research_field}.`;
