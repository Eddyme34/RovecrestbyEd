from subprocess import run
from time import sleep

# Path and name to the script you are trying to start
filePath = "server_rover_without_video_py.py" 

timer = 2
def start_server():
    try:
        # Make sure 'python' command is available
        run("python "+filePath, check=True)
    except KeyboardInterrupt:
        print("Kill switch activated! Shutting down")
    except:
        print("The server crashed! Restarting server")
        crashed()

def crashed():
    sleep(timer)  # Restarts the script after 2 seconds
    start_server()

start_server()
