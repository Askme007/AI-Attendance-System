# AI Attendance System

## Project Overview

The AI Attendance System is a Python-based application designed to manage attendance using facial recognition technology. The system uses OpenCV for face detection and recognition, allowing users to mark their attendance by capturing their facial features.

## Features

- **Face Recognition**: Uses facial recognition to mark attendance for users.
- **User Management**: Users can register, and their attendance can be tracked over time.
- **Admin Dashboard**: Allows administrators to view attendance reports and manage users.
- **Attendance Logs**: Keeps a record of all the attendance sessions.

## Contributors

- [Aditya Shukla](https://github.com/Aditya-Shukla05)
- [Ashkrit Rai](https://github.com/Askme007)
- [Abhishek Jha](https://github.com/abhishekcodes16)
- [Abhishek Kumar](https://github.com/Akabhi2311)
- [Aayush Kumar](https://github.com/Akcodet7)
  
## Installation

### Prerequisites

Before you begin, make sure you have the following installed:

- Python 3.x
- pip (Python package manager)
- Git

### Setup

1. **Clone the Repository**

   Clone this repository to your local machine using Git:

   ```bash
   git clone https://github.com/Askme007/AI-Attendance-System.git
   cd AI-Attendance-System
   ```

2. **Create a Virtual Environment**

    You can create a virtual environment to manage dependencies:
  
      ```bash
        python -m venv faceenv
      ```

3. Activate the Virtual Environment

   * Windows:
     ```bash
      .\faceenv\Scripts\activate
      ```
    * Linux/macOS:
      ```bash
        source faceenv/bin/activate
      ```
 4. **Install Dependencies**

    Install all the necessary dependencies listed in the requirements.txt file:

    ```bash
      pip install -r requirements.txt
    ```
    
### Usage
  #### Running the Application

  To run the application, execute the main.py file:

  ```bash
    python main.py
  ```

This will start the facial recognition process, and the system will attempt to recognize users based on the pre-registered faces.
