import sys
import shap
import joblib
from sklearn.naive_bayes import MultinomialNB

vectorizer_filename = r'C:\Users\prabh\Desktop\Elderly Financial Scams\mvp\backend\models\email_vectorizer.pkl'  # Change to your actual file path
model_filename = r'C:\Users\prabh\Desktop\Elderly Financial Scams\mvp\backend\models\email_model.pkl'  # Change to your actual file path

vectorizer = joblib.load(vectorizer_filename)
model = joblib.load(model_filename)

def predict_scam_probability(text):
    processed_text = vectorizer.transform([text])
    probabilities = model.predict_proba(processed_text)
    scam_probability = probabilities[0][1] * 100  
    return round(scam_probability)

# Function to extract scam keywords
def extract_scam_keywords(text, top_n=5):
    processed_text = vectorizer.transform([text])
    feature_names = vectorizer.get_feature_names_out()
    coef = model.feature_log_prob_[1]  # Log-probabilities for the spam class
    word_indices = processed_text.nonzero()[1]
    word_scores = [(feature_names[i], coef[i]) for i in word_indices]
    sorted_keywords = sorted(word_scores, key=lambda x: abs(x[1]), reverse=True)
    scam_keywords = [word for word, score in sorted_keywords[:top_n]]
    return scam_keywords

if __name__ == '__main__':
    # email text is passed as a command-line argument
    input_email = sys.argv[1]
    
    keywords = extract_scam_keywords(input_email)

    result = [predict_scam_probability(input_email), keywords]
    print(result)
