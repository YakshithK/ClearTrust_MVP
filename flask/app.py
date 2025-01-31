from flask import Flask, request, jsonify
import joblib
import os
import sklearn

app = Flask(__name__)

# Base directory of the project
base_dir = os.path.dirname(os.path.abspath(__file__))

# Load SMS model and vectorizer
sms_vectorizer_filename = os.path.join(base_dir, 'models', 'sms_vectorizer.pkl')
sms_model_filename = os.path.join(base_dir, 'models', 'sms_model.pkl')
sms_vectorizer = joblib.load(sms_vectorizer_filename)
sms_model = joblib.load(sms_model_filename)

# Load email model and vectorizer
email_vectorizer_filename = os.path.join(base_dir, 'models', 'email_vectorizer.pkl')
email_model_filename = os.path.join(base_dir, 'models', 'email_model.pkl')
email_vectorizer = joblib.load(email_vectorizer_filename)
email_model = joblib.load(email_model_filename)

def predict_scam_probability(text, vectorizer, model):
    processed_text = vectorizer.transform([text])
    probabilities = model.predict_proba(processed_text)
    scam_probability = probabilities[0][1] * 100  
    return round(scam_probability)

def extract_scam_keywords(text, vectorizer, model, top_n=5):
    processed_text = vectorizer.transform([text])
    feature_names = vectorizer.get_feature_names_out()
    coef = model.feature_log_prob_[1]  # Log-probabilities for the spam class
    word_indices = processed_text.nonzero()[1]
    word_scores = [(feature_names[i], coef[i]) for i in word_indices]
    sorted_keywords = sorted(word_scores, key=lambda x: abs(x[1]), reverse=True)
    scam_keywords = [word for word, score in sorted_keywords[:top_n]]
    return scam_keywords

@app.route('/detect_sms', methods=['POST'])
def detect_scam():
    data = request.json
    if 'scamText' not in data:
        return jsonify({'error': 'SMS text is required'}), 400
    
    scam_text = data['scamText']
    probability = predict_scam_probability(scam_text, sms_vectorizer, sms_model)
    keywords = extract_scam_keywords(scam_text, sms_vectorizer, sms_model)
    return jsonify({'scam_probability': probability, 'scam_keywords': keywords})

@app.route('/detect_email', methods=['POST'])
def detect_email():
    data = request.json
    if 'emailText' not in data:
        return jsonify({'error': 'Email text is required'}), 400
    
    email_text = data['emailText']
    probability = predict_scam_probability(email_text, email_vectorizer, email_model)
    keywords = extract_scam_keywords(email_text, email_vectorizer, email_model)
    return jsonify({'scam_probability': probability, 'scam_keywords': keywords})

if __name__ == '__main__':
    app.run(debug=True)
