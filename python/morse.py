"""
Decodes a base64 encoded mp3 file of Morse code audio into plaintext.
"""

import numpy
import wave
import sys
import subprocess
import os
import base64

INPUT_TXT = sys.argv[1]

#   arg check
ext_start = INPUT_TXT.rfind('.')      #   find index of last '.'
extension = INPUT_TXT[ext_start+1:]   #   grab file extension after '.'
if (len(sys.argv) is not 2) or (extension is 'txt'):
    print('\n    Must have an base64 text file as the sole argument!\n')
    exit()

#   decode base64 into mp3
TEMP_OUTPUT_MP3 = './convertedfrombase64.mp3'
with open(TEMP_OUTPUT_MP3, 'wb') as file:
    f = open(INPUT_TXT, 'rb').read()
    file.write(base64.b64decode(f))

#   convert mp3 to wav
TEMP_OUTPUT_WAV = './output.wav'
subprocess.call(['ffmpeg', '-loglevel', 'panic', '-hide_banner', '-y', '-i', TEMP_OUTPUT_MP3, TEMP_OUTPUT_WAV])
os.remove(TEMP_OUTPUT_MP3)

#   seed signal[] with values from the .wav file
spf = wave.open('output.wav', 'r')
os.remove(TEMP_OUTPUT_WAV)
signal = spf.readframes(-1)
signal = numpy.fromstring(signal, 'Int16')

#   normalize to all positives
signal = [abs(x) for x in signal]


#   each entry of averages[] is the average of each <STEP> entries in signal
STEP = 2000
VOLUME_THRESHOLD = 50
averages = [0 if (sum(signal[i*STEP : (i+2)*STEP]) / STEP) < VOLUME_THRESHOLD else 1 for i in range(1, ((len(signal)//STEP) - 1))]
#print(averages)

code = ''       #   Morse code transcription
tracker = 0     #   Keeps track of the beginning of the last silence or sound
DAH_LENGTH_THRESHOLD = 8
SILENCE_LENGTH_THRESHOLD = 8
for i in range(1, len(averages)):
    #   if average increase in volume = dit or dah
    if averages[i] > averages[i-1]:
        #   if silence length passes threshold, it's a full silence
        code += ' ' if (i-tracker) > SILENCE_LENGTH_THRESHOLD else ''
        tracker = i
    #   if average decrease in volume = silence
    elif averages[i] < averages[i-1]:
        #   if noise length passes threshold, it's a dah. else it's a dit
        code += '_' if (i-tracker) > DAH_LENGTH_THRESHOLD else '.'
        tracker = i

#print(code)

#   Morse lookup table
CODE = {'A': '._',     'B': '_...',   'C': '_._.', 
        'D': '_..',    'E': '.',      'F': '.._.',
        'G': '__.',    'H': '....',   'I': '..',
        'J': '.___',   'K': '_._',    'L': '._..',
        'M': '__',     'N': '_.',     'O': '___',
        'P': '.__.',   'Q': '__._',   'R': '._.',
        'S': '...',    'T': '_',      'U': '.._',
        'V': '..._',   'W': '.__',    'X': '_.._',
        'Y': '_.__',   'Z': '__..',

        '0': '_____',  '1': '.____',  '2': '..___',
        '3': '...__',  '4': '...._',  '5': '.....',
        '6': '_....',  '7': '__...',  '8': '___..',
        '9': '____.' 
        }
#   For morse to plaintext
CODE_REVERSED = {value:key for key,value in CODE.items()}

print(''.join(CODE_REVERSED.get(i) for i in code.split()))
