import cv2
import face_recognition
import os
import numpy as np
from simple_facerec import SimpleFacerec
sfr = SimpleFacerec()
sfr.load_encoding_images("images/")
image_path = "group.png"
if not os.path.exists(image_path):
    raise FileNotFoundError(f"Image file '{image_path}' not found!")

image = cv2.imread(image_path)
if image is None:
    raise ValueError(f"Unable to load image: {image_path}")

# Detect previous faces
face_locations, face_names = sfr.detect_known_faces(image)

for (top, right, bottom, left), name in zip(face_locations, face_names):
    cv2.rectangle(image, (left, top), (right, bottom), (0, 255, 0), 2)
    cv2.putText(image, name, (left, top - 10), cv2.FONT_HERSHEY_DUPLEX, 0.6, (0, 0, 255), 1)

# Show known faces
cv2.imshow("Face Recognition", image)
cv2.waitKey(0)
cv2.destroyAllWindows()
