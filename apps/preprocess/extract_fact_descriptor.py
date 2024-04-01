import anthropic
import json
from utils import extract_between_tags 

def extract_fact_descriptor(input: str):
    client = anthropic.Anthropic()
    # MODEL_NAME = "claude-3-opus-20240229"
    # MODEL_NAME="claude-3-sonnet-20240229"
    MODEL_NAME="claude-3-haiku-20240307"
    
    EXTRACT_FACT_DESCRIPTOR_EXAMPLE = """
    Each of these additional dictionaries should be put in separate <fact_descriptor> tags.
    
    Example:
    <fact>
    {
        "fact1": "The concept of attention mechanisms in neural networks allows models to focus on specific parts of the input for making decisions."
    }   
    </fact>
    <fact_descriptor>
    {
    "fact": "The concept of attention mechanisms in neural networks allows models to focus on specific parts of the input for making decisions.",
    "relevance": "Explains the core concept behind the paper's methodology.",
    "nextSource": "Section 3.1",
    "expectedInfo": "Detailed explanation of the attention mechanism used in the model."
    }
    </fact_descriptor>
    """
    
    
    CORPUS_DATA = """The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder.
The best performing models also connect the encoder and decoder through an attention mechanism.
We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.
Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train.
Our model achieves 28.4 BLEU on the WMT 2014 Englishto-German translation task, improving over the existing best results, including ensembles, by over 2 BLEU.
On the WMT 2014 English-to-French translation task, our model establishes a new single-model state-of-the-art BLEU score of 41.8 after training for 3.5 days on eight GPUs, a small fraction of the training costs of the best models from the literature.
We show that the Transformer generalizes well to other tasks by applying it successfully to English constituency parsing both with large and limited training data.
∗Equal contribution.""" 

    message_content = f"""
    CORPUS_DATA: 
    ```
    {input}
    ```
    
    Give me a JSON dict with facts based on CORPUS_DATA
    Facts provide information directly relevant to the question (or where to find more information in the text) - either supplementary data, facts, or where the answer might be located, like pages and sections. Add definitions and other context from the page into the fact, so it's self-explanatory.
    Put this dictionary in <fact> tags.

    Then, for each fact, output an additional JSON dictionary according to the following schema:
    relevance: How is this fact relevant to the answer?
    nextSource: a page number, a section name, or other descriptors of where to look for more information.
    expectedInfo: What information is expected to be found at the next source?

    {EXTRACT_FACT_DESCRIPTOR_EXAMPLE}
    """


    message = client.messages.create(
        model=MODEL_NAME,
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": message_content
            },
            {
                "role": "assistant",
                "content": "Here is the JSON requested:"
            }
        ],
    ).content[0].text

    facts_dict = json.loads(extract_between_tags("fact", message)[0])
    facts_descriptor_dicts = [
        json.loads(d)
        for d in extract_between_tags("fact_descriptor", message)
    ]
    return facts_descriptor_dicts