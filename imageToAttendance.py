import cv2
import face_recognition
import numpy as np
import pickle
from attendance_tracker import mark_attendance
import sys
import os

ENCODINGS_FILE = "/home/adi/Programming/AI-Attendance-System/encodings.pickle"

if len(sys.argv) < 2:
    print("No image given")
    sys.exit(1)

# Load the saved encodings
if not os.path.exists(ENCODINGS_FILE):
    print(f"Encodings file '{ENCODINGS_FILE}' not found. Run 'encode_faces.py' first.")
    sys.exit(1)

with open(ENCODINGS_FILE, "rb") as f:
    data = pickle.load(f)
    known_face_encodings = data["encodings"]
    known_face_names = data["names"]

# Load and process uploaded image
img_path = sys.argv[1]
image = face_recognition.load_image_file(img_path)
image_cv = cv2.imread(img_path)

face_locations = face_recognition.face_locations(image)
face_encodings = face_recognition.face_encodings(image, face_locations)

if len(face_encodings) == 0:
    print("No faces found in the uploaded image.")
    sys.exit(0)

for face_encoding in face_encodings:
    if not known_face_encodings:
        print("No known face encodings loaded.")
        continue

    matches = face_recognition.compare_faces(known_face_encodings, face_encoding)
    face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)

    best_match_index = np.argmin(face_distances)
    name = "Unknown"

    if matches[best_match_index]:
        name = known_face_names[best_match_index]

    print(f"Recognized: {name}")
    mark_attendance(name)
