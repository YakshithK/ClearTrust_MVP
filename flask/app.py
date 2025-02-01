import os
import joblib
from flask import Flask, request, jsonify

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

# Your existing functions and routes
# ...

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Running on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)
