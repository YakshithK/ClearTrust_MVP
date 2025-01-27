import sys
import os
import shutil
import whisper
import joblib

if not sys.warnoptions:
    import warnings
    warnings.simplefilter("ignore")

def clear_directory(directory_path):
    # Check if the directory exists
    if os.path.exists(directory_path) and os.path.isdir(directory_path):
        # Iterate through all files and directories in the specified directory
        for item in os.listdir(directory_path):
            item_path = os.path.join(directory_path, item)
            # Check if it's a file or directory and remove accordingly
            if os.path.isfile(item_path) or os.path.islink(item_path):
                os.unlink(item_path)  # Remove file or symbolic link
            elif os.path.isdir(item_path):
                shutil.rmtree(item_path)  # Remove directory
        print(f"All contents of '{directory_path}' have been removed.")
    else:
        print(f"The directory '{directory_path}' does not exist or is not accessible.")

# Load vectorizer and model (ensure file paths are correct)
vectorizer = joblib.load(r"C:\Users\prabh\Desktop\Elderly Financial Scams\mvp\backend\models\phone_vectorizer.pkl")
model = joblib.load(r"C:\Users\prabh\Desktop\Elderly Financial Scams\mvp\backend\models\phone_model.pkl")

def classify_audio(audio_path):
    # Load Whisper model
    whisper_model = whisper.load_model("tiny")
    result = whisper_model.transcribe(audio_path)

    # Transcription
    transcription = result["text"]
    print(f"Transcription: {transcription}")

    # Transform transcription into input vector
    input_vector = vectorizer.transform([transcription])
    pred = model.predict(input_vector)  # Predict whether it's a scam

    # Return classification result
    return "Scam" if pred[0] == 1 else "Not Scam"

if __name__ == "__main__":
    audio_path = sys.argv[1]  # Get audio path from command line
    classification_result = classify_audio(audio_path)
    clear_directory(r"C:\Users\prabh\Desktop\Elderly Financial Scams\mvp\backend\uploads")
    print(classification_result)