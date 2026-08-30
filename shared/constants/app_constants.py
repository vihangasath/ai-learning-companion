"""
Shared Constants - Member 3
Used across auth, database, recommendation
"""

# Mastery thresholds (0-100)
MASTERY_NOT_STARTED = 0
MASTERY_LEARNING = 30
MASTERY_WEAK = 50
MASTERY_MASTERED = 70

# Content types tracked from extension
CONTENT_TYPES = [
    "youtube",
    "course",
    "pdf",
    "blog",
    "docs",
    "paper"
]

# Learning levels
LEARNING_LEVELS = ["beginner", "intermediate", "advanced"]

# JWT Settings
JWT_SECRET_KEY = "learnflow-hackathon-secret-key-2026-super-secure"
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_DAYS = 7

# Knowledge graph time estimates
TOPIC_TIME_ESTIMATES = {
    "Calculus": "20 hours",
    "Linear Algebra": "15 hours",
    "Probability & Statistics": "15 hours",
    "Discrete Mathematics": "12 hours",
    "Python Basics": "10 hours",
    "Data Structures": "15 hours",
    "Algorithms": "20 hours",
    "NumPy & Pandas": "8 hours",
    "Gradient Descent": "5 hours",
    "Linear Regression": "6 hours",
    "Logistic Regression": "6 hours",
    "Neural Networks": "15 hours",
    "Deep Learning": "25 hours",
    "CNNs": "15 hours",
    "RNNs & LSTMs": "15 hours",
    "Transformers": "20 hours",
    "GANs": "15 hours",
    "Natural Language Processing": "20 hours",
    "Computer Vision": "18 hours",
    "Reinforcement Learning": "20 hours",
    "MLOps": "12 hours",
}
