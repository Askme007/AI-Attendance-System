import cv2
import face_recognition
import os
import glob
import numpy as np
from simple_facerec import SimpleFacerec

# Initialize SimpleFacerec
sfr = SimpleFacerec()
sfr.load_encoding_images("images/")  # Folder where your known face images are stored

# Load the image to be recognized
image = face_recognition.load_image_file("group.png")  # Replace with your image path
image_cv = cv2.imread("group.png")  # For OpenCV to display

# Get face locations from the image
face_locations = face_recognition.face_locations(image)
print(f"Found {len(face_locations)} face(s) in this image.")

# Get face encodings for each detected face
face_encodings = face_recognition.face_encodings(image, face_locations)

# Prepare to recognize the faces
face_names = []

# Loop through the face encodings and match them with the known faces
for face_encoding in face_encodings:
    matches = face_recognition.compare_faces(sfr.known_face_encodings, face_encoding)
    name = "Unknown"

    # Use the face with the smallest distance as the best match
    face_distances = face_recognition.face_distance(sfr.known_face_encodings, face_encoding)
    best_match_index = np.argmin(face_distances)

    if matches[best_match_index]:
        name = sfr.known_face_names[best_match_index]

    face_names.append(name)

# Draw rectangles and names around the faces
for (top, right, bottom, left), name in zip(face_locations, face_names):
    cv2.rectangle(image_cv, (left, top), (right, bottom), (0, 255, 0), 2)  # Green rectangle
    
    # Reduce font size by changing the scale to a smaller value
    font_scale = 0.6  # Smaller font size
    font_thickness = 1
    cv2.putText(image_cv, name, (left, top - 10), cv2.FONT_HERSHEY_DUPLEX, font_scale, (0, 0, 255), font_thickness)  # Red text

# Create a resizable window
cv2.namedWindow("Face Recognition", cv2.WINDOW_NORMAL)  # This makes the window resizable
cv2.resizeWindow("Face Recognition", 800, 600)  # Initial size, user can resize after opening the window

# Show the image with recognized faces and names
cv2.imshow("Face Recognition", image_cv)

# Wait for user to press a key
cv2.waitKey(0)
cv2.destroyAllWindows()
