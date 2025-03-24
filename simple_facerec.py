import face_recognition
import cv2
import os
import glob
import numpy as np
import dlib
from scipy.spatial import distance as dist
from imutils import face_utils


class SimpleFacerec:
    def __init__(self):
        self.known_face_encodings = []
        self.known_face_names = []
        self.frame_resizing = 0.25

        # Load Dlib face detector and shape predictor
        self.detector = dlib.get_frontal_face_detector()
        self.predictor = dlib.shape_predictor("shape_predictor_68_face_landmarks.dat")

        # Blink detection parameters
        self.EYE_AR_THRESH = 0.25
        self.EYE_AR_CONSEC_FRAMES = 3
        self.blink_counter = 0
        self.blink_detected = False

        # Motion detection variables
        self.prev_gray = None
        self.motion_threshold = 0.5

    def load_encoding_images(self, images_path):
        """
        Load encoding images from the given path.
        """
        images_path = glob.glob(os.path.join(images_path, "*.*"))
        print(f"{len(images_path)} encoding images found.")

        for img_path in images_path:
            img = cv2.imread(img_path)

            if img is None:
                print(f"Error loading image: {img_path}")
                continue

            rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            encodings = face_recognition.face_encodings(rgb_img)

            if len(encodings) == 0:
                print(f"No face found in {img_path}")
                continue

            basename = os.path.basename(img_path)
            (filename, ext) = os.path.splitext(basename)
            self.known_face_encodings.append(encodings[0])
            self.known_face_names.append(filename)

        print("Encoding images loaded successfully.")

    def detect_known_faces(self, frame):
        """
        Detect and recognize known faces in the frame.
        """
        small_frame = cv2.resize(frame, (0, 0), fx=self.frame_resizing, fy=self.frame_resizing)
        rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)

        face_locations = face_recognition.face_locations(rgb_small_frame)
        face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)

        face_names = []
        for face_encoding in face_encodings:
            matches = face_recognition.compare_faces(self.known_face_encodings, face_encoding)
            name = "Unknown"

            face_distances = face_recognition.face_distance(self.known_face_encodings, face_encoding)
            best_match_index = np.argmin(face_distances)

            if matches[best_match_index]:
                name = self.known_face_names[best_match_index]

            face_names.append(name)

        face_locations = np.array(face_locations)
        face_locations = face_locations / self.frame_resizing
        return face_locations.astype(int), face_names

    def eye_aspect_ratio(self, eye):
        """
        Calculate Eye Aspect Ratio (EAR) to detect blinks.
        """
        A = dist.euclidean(eye[1], eye[5])  # Vertical distance
        B = dist.euclidean(eye[2], eye[4])
        C = dist.euclidean(eye[0], eye[3])  # Horizontal distance
        return (A + B) / (2.0 * C)

    def detect_blink(self, frame):
        """
        Detect eye blink to determine liveness.
        """
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        rects = self.detector(gray, 0)

        for rect in rects:
            shape = self.predictor(gray, rect)
            shape = face_utils.shape_to_np(shape)

            left_eye = shape[36:42]
            right_eye = shape[42:48]

            left_ear = self.eye_aspect_ratio(left_eye)
            right_ear = self.eye_aspect_ratio(right_eye)

            ear = (left_ear + right_ear) / 2.0

            if ear < self.EYE_AR_THRESH:
                self.blink_counter += 1
            else:
                if self.blink_counter >= self.EYE_AR_CONSEC_FRAMES:
                    self.blink_detected = True
                self.blink_counter = 0

        return self.blink_detected

    def detect_motion(self, frame):
        """
        Detect motion to ensure real-time presence.
        """
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        if self.prev_gray is None:
            self.prev_gray = gray
            return False

        flow = cv2.calcOpticalFlowFarneback(self.prev_gray, gray, None, 0.5, 3, 15, 3, 5, 1.2, 0)
        motion_magnitude = np.mean(np.abs(flow))
        self.prev_gray = gray

        return motion_magnitude > self.motion_threshold
