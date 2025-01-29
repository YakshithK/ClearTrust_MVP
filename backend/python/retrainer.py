import pandas as pd
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB  # Use Multinomial Naive Bayes
import sys
import json  # Import the json module to parse the data

def retrainModel(report):

    model_used = report['model']
    message = report['message']

    # Convert the feedback type into a numerical value (0 for false_negative, 1 for false_positive)
    if report['feedback_type'] == 'false_negative':
        feedbackType = 0
    elif report['feedback_type'] == 'false_positive':
        feedbackType = 1

    # Prepare the new data as a DataFrame
    data = [feedbackType, message]
    df = pd.DataFrame([data], columns=['label', 'text'])

    # Load the existing model and vectorizer
    try:
        model = joblib.load(f"C:\\Users\\prabh\\Desktop\\Elderly Financial Scams\\mvp\\backend\\models\\{model_used}_model.pkl")
        vectorizer = joblib.load(f"C:\\Users\\prabh\\Desktop\\Elderly Financial Scams\\mvp\\backend\\models\\{model_used}_vectorizer.pkl")
        print("Loaded existing model and vectorizer.")
    except FileNotFoundError:
        model = MultinomialNB()  # Initialize the Multinomial Naive Bayes model
        vectorizer = TfidfVectorizer()  # Initialize the vectorizer
        print("No existing model found. Training from scratch.")

    # Vectorize the new data
    X_new = vectorizer.transform(df["text"]) if 'vectorizer' in locals() else vectorizer.fit_transform(df["text"])
    y_new = df["label"]

    # If the model is not yet trained or the class labels were not seen before, use all possible classes
    if not hasattr(model, "classes_"):
        model.classes_ = np.array([0, 1])

    # Fine-tune the model with the new data (just one sample)
    model.partial_fit(X_new, y_new, classes=np.array([0, 1]))  # Specify both class labels explicitly

    # Save the updated model and vectorizer
    joblib.dump(model, f"C:\\Users\\prabh\\Desktop\\Elderly Financial Scams\\mvp\\backend\\models\\{model_used}_model.pkl")
    joblib.dump(vectorizer, f"C:\\Users\\prabh\\Desktop\\Elderly Financial Scams\\mvp\\backend\\models\\{model_used}_vectorizer.pkl")

    print("Model retrained successfully!")

if __name__ == "__main__":
    report = json.loads(sys.argv[1])  # Parse the JSON string into a Python dictionary
    retrainModel(report)
