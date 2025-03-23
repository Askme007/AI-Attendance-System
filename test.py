import face_recognition
import cv2

image = face_recognition.load_image_file("group.png")

face_locations = face_recognition.face_locations(image)

print(f"Found {len(face_locations)} face(s) in this image.")

image_cv = cv2.imread("group.png")

for top, right, bottom, left in face_locations:
    cv2.rectangle(image_cv, (left, top), (right, bottom), (0, 255, 0), 2)

cv2.imshow("Face Recognition", image_cv)
cv2.waitKey(0)
cv2.destroyAllWindows()
