import os
import face_recognition
import pickle

DATASET_DIR = "originalFaces/"
ENCODINGS_FILE = "encodings.pickle"

known_encodings = []
known_names = []

print("Encoding faces...")

for filename in os.listdir(DATASET_DIR):
    if filename.endswith((".jpg", ".jpeg", ".png")):
        img_path = os.path.join(DATASET_DIR, filename)
        image = face_recognition.load_image_file(img_path)
        encodings = face_recognition.face_encodings(image)

        if len(encodings) > 0:
            known_encodings.append(encodings[0])
            known_names.append(os.path.splitext(filename)[0])
            print(f"Encoded {filename}")
        else:
            print(f"No face found in {filename}, skipping.")

# Save the encodings
with open(ENCODINGS_FILE, "wb") as f:
    pickle.dump({"encodings": known_encodings, "names": known_names}, f)

print(f"Encoding complete. Data saved to {ENCODINGS_FILE}.")
