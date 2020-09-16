from threading import Thread
import cv2

class Webcam:
    def __init__(self, src):
        self.cap = cv2.VideoCapture(src)
        (self.ret, self.frame) = self.cap.read()
    def begin(self):
        Thread(target=self.get_frame, args=()).start()
        return self
    def get_frame(self):
        while True:
            (self.ret, self.frame) = self.cap.read()
    def read(self):
        return self.ret, self.frame
