import pandas as pd
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB  # Use Multinomial Naive Bayes
import os

def retrainModel(report):
    model_used = report['model']
    message = report['message']

    # Assign correct label
    feedbackType = 0 if report['feedback_type'] == 'false_negative' else 1  # 0 for not scam, 1 for scam

    df = pd.DataFrame([[feedbackType, message]], columns=['label', 'text'])

    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, 'models', f'{model_used}_model.pkl')
    vectorizer_path = os.path.join(base_dir, 'models', f'{model_used}_vectorizer.pkl')

    # Load model and vectorizer
    if os.path.exists(model_path) and os.path.exists(vectorizer_path):
        model = joblib.load(model_path)
        vectorizer = joblib.load(vectorizer_path)
    else:
        model = MultinomialNB()
        vectorizer = TfidfVectorizer()
        # Fit vectorizer on the new data
        X_new = vectorizer.fit_transform(df["text"])
        model.partial_fit(X_new, df["label"], classes=np.array([0, 1]))  # Train from scratch
        joblib.dump(model, model_path)
        joblib.dump(vectorizer, vectorizer_path)
        print("No existing model found. Trained from scratch.")
        return

    # Transform text with vectorizer
    X_new = vectorizer.transform(df["text"])

    # Fine-tune the model
    model.partial_fit(X_new, df["label"], classes=np.array([0, 1]))

    # Save the updated model and vectorizer
    joblib.dump(model, model_path)
    joblib.dump(vectorizer, vectorizer_path)
    print("Model retrained successfully!")
