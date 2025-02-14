from flask import Flask, request, jsonify
import joblib
import os
import sys
import whisper
from flask_cors import CORS
import json
from retrain import retrainModel
from waitress import serve

if not sys.warnoptions:
    import warnings
    warnings.simplefilter("ignore")

app = Flask(__name__)
CORS(app, origins=["https://clear-trust-mvp.vercel.app/", "https://clear-trust-pa0ga8fwe-yakshiths-projects-f743b366.vercel.app/", 'http://clear-trust-mvp-git-main-yakshiths-projects-f743b366.vercel.app', 'http://localhost:3000'])  # Explicitly allow your frontend origin

# Base directory of the project
base_dir = os.path.dirname(os.path.abspath(__file__))

# Load models and vectorizers
sms_vectorizer_filename = os.path.join(base_dir, 'models', 'sms_vectorizer.pkl')
sms_model_filename = os.path.join(base_dir, 'models', 'sms_model.pkl')
sms_vectorizer = joblib.load(sms_vectorizer_filename)
sms_model = joblib.load(sms_model_filename)

email_vectorizer_filename = os.path.join(base_dir, 'models', 'email_vectorizer.pkl')
email_model_filename = os.path.join(base_dir, 'models', 'email_model.pkl')
email_vectorizer = joblib.load(email_vectorizer_filename)
email_model = joblib.load(email_model_filename)

phone_vectorizer_filename = os.path.join(base_dir, 'models', 'phone_vectorizer.pkl')
phone_model_filename = os.path.join(base_dir, 'models', 'phone_model.pkl')
phone_vectorizer = joblib.load(phone_vectorizer_filename)
phone_model = joblib.load(phone_model_filename)

# Define the local uploads folder for Flask
UPLOAD_FOLDER = os.path.join(base_dir, 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

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
    if 'scamText' not in data:
        return jsonify({'error': 'Email text is required'}), 400
    
    email_text = data['scamText']
    probability = predict_scam_probability(email_text, email_vectorizer, email_model)
    keywords = extract_scam_keywords(email_text, email_vectorizer, email_model)
    return jsonify({'scam_probability': probability, 'scam_keywords': keywords})

@app.route('/detect_phone', methods=['POST'])
def classify_audio():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files["audio"]
    
    # Save the file temporarily if needed
    file_path = os.path.join(UPLOAD_FOLDER, audio_file.filename)
    audio_file.save(file_path)
    
    # Load Whisper model
    whisper_model = whisper.load_model("tiny")
    result = whisper_model.transcribe(file_path)

    # Transcription
    transcription = result["text"]

    # Transform transcription into input vector
    input_vector = phone_vectorizer.transform([transcription])
    pred = phone_model.predict(input_vector)  # Predict whether it's a scam

    # Delete the audio file after processing
    os.remove(file_path)

    # Return classification result
    result = "Scam" if pred[0] == 1 else "Not Scam"
    return jsonify({"result": result})

@app.route('/detect_report', methods=['POST'])
def receive_report():
    report = json.loads(request.data)['report']

    retrainModel(report)
    return jsonify({ "message": "Model retrained successfully!" })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Running on port {port}")
    serve(app, host='0.0.0.0', port=port)