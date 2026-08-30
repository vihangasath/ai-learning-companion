"""
Knowledge Graph - The Brain of LearnFlow AI
Defines topics + prerequisites
"""
KNOWLEDGE_GRAPH_TOPICS = [
    {"name": "Calculus", "slug": "calculus", "category": "math", "difficulty": "beginner", "description": "Limits, derivatives, integrals - foundation of ML"},
    {"name": "Linear Algebra", "slug": "linear-algebra", "category": "math", "difficulty": "beginner", "description": "Vectors, matrices, eigenvalues - core of deep learning"},
    {"name": "Probability & Statistics", "slug": "probability-statistics", "category": "math", "difficulty": "beginner", "description": "Probability distributions, Bayes theorem"},
    {"name": "Discrete Mathematics", "slug": "discrete-math", "category": "math", "difficulty": "intermediate", "description": "Logic, sets, graphs"},
    {"name": "Python Basics", "slug": "python-basics", "category": "programming", "difficulty": "beginner", "description": "Python syntax, loops, functions"},
    {"name": "Data Structures", "slug": "data-structures", "category": "programming", "difficulty": "beginner", "description": "Lists, trees, graphs, hashmaps"},
    {"name": "Algorithms", "slug": "algorithms", "category": "programming", "difficulty": "intermediate", "description": "Sorting, searching, complexity"},
    {"name": "NumPy & Pandas", "slug": "numpy-pandas", "category": "programming", "difficulty": "intermediate", "description": "Data manipulation for ML"},
    {"name": "Gradient Descent", "slug": "gradient-descent", "category": "ml", "difficulty": "intermediate", "description": "Optimization algorithm for ML"},
    {"name": "Linear Regression", "slug": "linear-regression", "category": "ml", "difficulty": "intermediate", "description": "Basic supervised learning"},
    {"name": "Logistic Regression", "slug": "logistic-regression", "category": "ml", "difficulty": "intermediate", "description": "Classification algorithm"},
    {"name": "Neural Networks", "slug": "neural-networks", "category": "ml", "difficulty": "intermediate", "description": "Perceptrons, backpropagation"},
    {"name": "Deep Learning", "slug": "deep-learning", "category": "dl", "difficulty": "advanced", "description": "Deep neural networks, optimization"},
    {"name": "CNNs", "slug": "cnns", "category": "dl", "difficulty": "advanced", "description": "Convolutional networks for images"},
    {"name": "RNNs & LSTMs", "slug": "rnns-lstms", "category": "dl", "difficulty": "advanced", "description": "Sequential data, NLP basics"},
    {"name": "Transformers", "slug": "transformers", "category": "dl", "difficulty": "advanced", "description": "Attention mechanism, BERT, GPT"},
    {"name": "GANs", "slug": "gans", "category": "dl", "difficulty": "advanced", "description": "Generative adversarial networks"},
    {"name": "Natural Language Processing", "slug": "nlp", "category": "specialized", "difficulty": "advanced", "description": "Text processing, sentiment, LLMs"},
    {"name": "Computer Vision", "slug": "computer-vision", "category": "specialized", "difficulty": "advanced", "description": "Image classification, object detection"},
    {"name": "Reinforcement Learning", "slug": "reinforcement-learning", "category": "specialized", "difficulty": "advanced", "description": "Agents, rewards, Q-learning"},
    {"name": "MLOps", "slug": "mlops", "category": "specialized", "difficulty": "advanced", "description": "Deploying ML models in production"},
]

KNOWLEDGE_GRAPH_EDGES = {
    "Data Structures": ["Python Basics"],
    "Algorithms": ["Data Structures"],
    "NumPy & Pandas": ["Python Basics", "Linear Algebra"],
    "Linear Regression": ["Calculus", "Linear Algebra", "Python Basics"],
    "Logistic Regression": ["Linear Regression", "Probability & Statistics"],
    "Gradient Descent": ["Calculus", "Linear Algebra"],
    "Neural Networks": ["Gradient Descent", "Linear Algebra", "Calculus", "Python Basics"],
    "Deep Learning": ["Neural Networks", "NumPy & Pandas", "Probability & Statistics"],
    "CNNs": ["Deep Learning", "Linear Algebra"],
    "RNNs & LSTMs": ["Deep Learning", "Probability & Statistics"],
    "Transformers": ["Deep Learning", "RNNs & LSTMs", "Linear Algebra"],
    "GANs": ["Deep Learning", "Probability & Statistics"],
    "Natural Language Processing": ["Transformers", "Probability & Statistics"],
    "Computer Vision": ["CNNs", "Deep Learning"],
    "Reinforcement Learning": ["Deep Learning", "Probability & Statistics", "Algorithms"],
    "MLOps": ["Deep Learning", "Python Basics"],
    "Probability & Statistics": ["Calculus"],
    "Linear Algebra": ["Calculus"],
}

def get_prerequisites(topic_name: str):
    return KNOWLEDGE_GRAPH_EDGES.get(topic_name, [])

def get_next_topics(topic_name: str):
    next_topics = []
    for topic, prereqs in KNOWLEDGE_GRAPH_EDGES.items():
        if topic_name in prereqs:
            next_topics.append(topic)
    return next_topics
