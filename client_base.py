import socket
import argparse
import struct
import base64
import cv2
import datetime
import numpy as np
import pickle
from tkinter import *
from threading import Thread
import concurrent.futures
from multiprocessing import Process, Lock

parser = argparse.ArgumentParser(description = "This is the client for the multi threaded socket server!")
parser.add_argument('--host', metavar = 'host', type = str, nargs = '?', default = 'localhost')
parser.add_argument('--port', metavar = 'port', type = int, nargs = '?', default = 9999)
args = parser.parse_args()

print(f"Connecting to server: {args.host} on port: {args.port}")

sck_msg = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sck_vid = socket.socket(socket.AF_INET, socket.SOCK_STREAM)


try:
    sck_msg.connect((args.host, args.port))
    sck_vid.connect((args.host, 1234))
except Exception as e:
    raise SystemExit(f"We have failed to connect to host: {args.host} on port: {args.port}, because: {e}")


def msg_conn(sck_msg):
    while True:
        msg = input("What do we want to send to the server?: ")
        sck_msg.sendall(msg.encode('utf-8'))
        if msg =='exit':
            print("Client is saying goodbye!")
            break
        data = sck_msg.recv(1024)
        print(f"The server's response was: {data.decode()}")
    sck_msg.close()
    

def video_conn(sck_vid):
    payload_size = struct.calcsize("<L")
    data = b''
    while(True):
        start_time = datetime.datetime.now()
        while len(data) < payload_size:
            data += sck_vid.recv(4096)
        frame_size = struct.unpack("<L", data[:payload_size])[0]
        data = data[payload_size:]
        while len(data) < frame_size:
            data += sck_vid.recv(131072)
        frame_data = data[:frame_size]
        data = data[frame_size:]
        img = base64.b64decode(frame_data)
        npimg = np.frombuffer(img, dtype=np.uint8)
        frame = cv2.imdecode(npimg, 1)

        #frame = cv2.cvtColor(frame,cv2.COLOR_BGR2RGB)
        end_time = datetime.datetime.now()
        fps = 1/(end_time-start_time).total_seconds()
        print("Fps: ",round(fps,2))

        # Display
        cv2.imshow('frame', frame)
        
        if (cv2.waitKey(1) & 0xFF == ord('q')):
            cv2.destroyAllWindows()
            break;


proc1 = Thread(target=msg_conn, args=(sck_msg,))
proc2 = Thread(target=video_conn, args=(sck_vid,))
proc1.start()
proc2.start()    

