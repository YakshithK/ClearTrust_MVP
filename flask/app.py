from flask import Flask, request, jsonify
import joblib

app = Flask(__name__)

vectorizer_filename = r'.\models\sms_vectorizer.pkl'  # Change to your actual file path
model_filename = r'.\models\sms_model.pkl'  # Change to your actual file path

vectorizer = joblib.load(vectorizer_filename)
model = joblib.load(model_filename)

def predict_scam_probability(text):
    processed_text = vectorizer.transform([text])
    probabilities = model.predict_proba(processed_text)
    scam_probability = probabilities[0][1] * 100  
    return round(scam_probability)

def extract_scam_keywords(text, top_n=5):
    processed_text = vectorizer.transform([text])
    feature_names = vectorizer.get_feature_names_out()
    coef = model.feature_log_prob_[1]  # Log-probabilities for the spam class
    word_indices = processed_text.nonzero()[1]
    word_scores = [(feature_names[i], coef[i]) for i in word_indices]
    sorted_keywords = sorted(word_scores, key=lambda x: abs(x[1]), reverse=True)
    scam_keywords = [word for word, score in sorted_keywords[:top_n]]
    return scam_keywords

@app.route('/detect_scam', methods=['POST'])
def detect_scam():
    data = request.json
    if 'scamText' not in data:
        return jsonify({'error': 'SMS text is required'}), 400
    
    scam_text = data['scamText']
    probability = predict_scam_probability(scam_text)
    keywords = extract_scam_keywords(scam_text)
    return jsonify({'scam_probability': probability, 'scam_keywords': keywords})


