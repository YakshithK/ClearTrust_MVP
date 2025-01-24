from flask import Flask, render_template, request
import os

from pipeline import if_scam

app = Flask(__name__)

# Define the folder where audio files will be saved
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Set the folder in Flask configuration
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/save_audio', methods=['POST'])
def save_audio():
    # Get the audio data from the POST request
    audio_data = request.data
    
    # Define the file path to save the audio
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], 'audio.wav')
    
    # Save the audio data as a .wav file
    with open(file_path, 'wb') as f:
        f.write(audio_data)
    
    return 'Audio saved successfully'

@app.route('/result')
def result():
    # Get the scam result from the session
    scam_result = if_scam()
    
    # If scam_result is None, that means there was an issue
    if scam_result is None:
        return "Error: No result found", 400
    
    # Render the result page
    return render_template('result.html', is_scam=scam_result)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
