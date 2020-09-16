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
from inputs import get_gamepad #pip install inputs

parser = argparse.ArgumentParser(description = "This is the client for the multi threaded socket server!")
parser.add_argument('--host', metavar = 'host', type = str, nargs = '?', default = 'localhost')
parser.add_argument('--port', metavar = 'port', type = int, nargs = '?', default = 9999)
args = parser.parse_args()

print(f"Connecting to server: {args.host} on port: {args.port}")

sck_msg = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sck_vid = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sck_vid2 = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s_cmd1 = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

try:
    sck_msg.connect((args.host, args.port))
    sck_vid.connect((args.host, 1234))
    sck_vid2.connect((args.host, 8080))
    s_cmd1.connect((args.host,1235))
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
        try:
            fps = 1/(end_time-start_time).total_seconds()
            print("Fps: ",round(fps,2))
        except ZeroDivisionError as err:
            print("Handling run-time error:", err)

        # Display
        cv2.imshow('frame', frame)
        
        if (cv2.waitKey(1) & 0xFF == ord('q')):
            cv2.destroyAllWindows()
            break;

def video_conn2(sck_vid):
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
        try:
            fps = 1/(end_time-start_time).total_seconds()
            print("Fps: ",round(fps,2))
        except ZeroDivisionError as err:
            print("Handling run-time error:", err)

        # Display
        cv2.imshow('frame2', frame)
        
        if (cv2.waitKey(1) & 0xFF == ord('q')):
            cv2.destroyAllWindows()
            break;

def send_cmd(s_cmd1):

    while True:
        gamepad = get_gamepad()

        for event in gamepad:

            if event.code == "ABS_Y":
                if event.state < 125:
                    reply = f"Forward"
                    s_cmd1.sendall(reply.encode('utf-8'))

            if event.code == "ABS_Z":
                if event.state > 130:
                    reply = f"Forward"
                    s_cmd1.sendall(reply.encode('utf-8'))
                elif event.state < 125:
                    reply = f"Left"
                    s_cmd1.sendall(reply.encode('utf-8'))
                    
            if event.code == "BTN_TL":
                if event.state == True:
                    reply = f"Turbo"
                    s_cmd1.sendall(reply.encode('utf-8'))
                    
            if event.code == "BTN_TR":
                if event.state == True:
                    reply = f"Tank"
                    s_cmd1.sendall(reply.encode('utf-8'))
                    
            if event.code == "BTN_NORTH":
                if event.state == True:
                    reply = f"Triangle"
                    s_cmd1.sendall(reply.encode('utf-8'))
                    
            if event.code == "BTN_SOUTH":
                if event.state == True:
                    reply = f"Square"
                    s_cmd1.sendall(reply.encode('utf-8'))
                    
            if event.code == "BTN_EAST":
                if event.state == True:
                    reply = f"Cross"
                    s_cmd1.sendall(reply.encode('utf-8'))
                    
            if event.code == "BTN_C":
                if event.state == True:
                    reply = f"Circle"
                    s_cmd1.sendall(reply.encode('utf-8'))
                    
            if event.code == "BTN_TR2":
                if event.state == True:
                    reply = f"Start"
                    s_cmd1.sendall(reply.encode('utf-8'))
                    
            if event.code == "BTN_TL2":
                if event.state == True:
                    reply = f"Select"
                    s_cmd1.sendall(reply.encode('utf-8'))
            if event.code == "ABS_HAT0Y":
                if event.state == -1:
                    reply = f"D pad Up"
                    s_cmd1.sendall(reply.encode('utf-8'))
                elif event.state == 1:
                    reply = f"D pad Down"
                    s_cmd1.sendall(reply.encode('utf-8'))
                    
            if event.code == "ABS_HAT0X":
                if event.state == -1:
                    reply = f"D pad Left"
                    s_cmd1.sendall(reply.encode('utf-8'))
                elif event.state == 1:
                    reply = f"D pad Right"
                    s_cmd1.sendall(reply.encode('utf-8'))
                    
            if event.code == "BTN_WEST":
                if event.state == True:
                    reply = f"Top left"
                    s_cmd1.sendall(reply.encode('utf-8'))
                    
            if event.code == "BTN_Z":
                if event.state == True:
                    reply = f"Top right"
                    s_cmd1.sendall(reply.encode('utf-8'))
proc1 = Thread(target=msg_conn, args=(sck_msg,))
proc2 = Thread(target=video_conn, args=(sck_vid,))
proc3 = Thread(target=video_conn2, args=(sck_vid2,))
proc4 = Thread(target=send_cmd, args=(s_cmd1,))
proc1.start()
proc2.start()
proc3.start()
proc4.start()

