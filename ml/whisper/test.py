import whisper

model = whisper.load_model('turbo')
result = model.transcribe('ml/whisper/audio.wav')
print(result['text'])