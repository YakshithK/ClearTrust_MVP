import joblib 
model = joblib.load('model.pkl')
vectorizer = joblib.load("vectorizer.pkl")

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from transcribe_audio import transcribe

def if_scam():
    message = transcribe()
    print(message)

    input_vector = vectorizer.transform([message])

    pred = model.predict(input_vector)

    if pred[0] == 0:
        return False
    else: 
        return True