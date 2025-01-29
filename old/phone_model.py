import pandas as pd
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer

from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

from sklearn import metrics

import matplotlib.pyplot as plt

df = pd.read_csv('scam_call_dataset.csv')

X = df['Transcript']
y = df['Label']

vectorizer = TfidfVectorizer()
X_tfidf = vectorizer.fit_transform(X)

X_train, X_test, y_train, y_test = train_test_split(X_tfidf, y, shuffle=True, test_size=0.3, random_state=42)

model = LogisticRegression()
model.fit(X_train, y_train)

print('Model has been trained')

y_pred = model.predict(X_test)

print('Accuracy: {}'.format(metrics.accuracy_score(y_pred=y_pred, y_true=y_test)))

confusion_matrix = metrics.confusion_matrix(y_test, y_pred)

cm_display = metrics.ConfusionMatrixDisplay(confusion_matrix = confusion_matrix, display_labels = [0, 1])

cm_display.plot()
plt.show()

joblib.dump(model, 'model.pkl')
joblib.dump(vectorizer, 'vectorizer.pkl')

