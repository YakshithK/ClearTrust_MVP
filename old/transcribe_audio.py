from google.cloud import speech
import os
from pydub import AudioSegment

os.environ["FFMPEG_BINARY"] = r"C:\ffmpeg\bin\ffmpeg.exe"
os.environ["FFPROBE_BINARY"] = r"C:\ffmpeg\bin\ffprobe.exe"

def transcribe():
    convert_audio('uploads/audio.wav', 'uploads/audio.wav')
    audio = AudioSegment.from_wav('uploads/audio.wav')

    client = speech.SpeechClient()

    audio_path = 'uploads/audio.wav'

    with open(audio_path, 'rb') as audio_file:
        content = audio_file.read()

    audio = speech.RecognitionAudio(content=content)

    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=44100,
        language_code='en-US'
    )

    response = client.recognize(config=config, audio=audio)

    for result in response.results:
        return result.alternatives[0].transcript
    
def convert_audio(input_path, output_path):
    try:
        audio = AudioSegment.from_file(input_path)
        audio = audio.set_channels(1)  # Ensure it's mono (1 channel)
        audio = audio.set_frame_rate(44100)  # Ensure sample rate is 44100
        audio = audio.set_sample_width(2)  # Set to 16-bit (2 bytes per sample)
        audio.export(output_path, format='wav')
        print(f"Successfully converted audio to WAV: {output_path}")
    except Exception as e:
        print(f"Error converting audio: {e}")
    

