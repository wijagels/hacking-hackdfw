"""Decodes a base64 encoded mp3 file of Morse code audio into plaintext."""

import sys
import subprocess
import os
import base64
import wave
import numpy

#######################
# Arguments checking  #
#######################

if len(sys.argv) != 2:
    print('\n    Must have an base64 text file as the sole argument!\n')
    exit()
    
INPUT_TXT = sys.argv[1]
TEMP_OUTPUT_MP3 = './convertedfrombase64.mp3'
TEMP_OUTPUT_WAV = './output.wav'

# arg check
ext_start = INPUT_TXT.rfind('.')      # find index of last '.'
extension = INPUT_TXT[ext_start+1:]   # grab file extension after '.'
if extension != 'txt':
    print('\n    Must have an base64 text file as the sole argument!\n')
    exit()



##############################
# Pre-processing conversions #
##############################

# decode base64 into mp3
with open(TEMP_OUTPUT_MP3, 'wb') as file:
    file.write(base64.b64decode(open(INPUT_TXT, 'rb').read()))

# convert mp3 to wav
subprocess.call([
    'ffmpeg', 
    '-loglevel', 'panic',   # don't log crap unless it's critical
    '-hide_banner',         # hide stupid copyright licence
    '-y',                   # overwrite file
    '-i',                    
    TEMP_OUTPUT_MP3, 
    TEMP_OUTPUT_WAV
])
os.remove(TEMP_OUTPUT_MP3)

# seed signal[] with values from the .wav file
spf = wave.open(TEMP_OUTPUT_WAV, 'r')
os.remove(TEMP_OUTPUT_WAV)
signal = numpy.fromstring(spf.readframes(-1), 'Int16')



####################
# Audio Processing #
####################
"""
each entry of averages[] is the average of each <STEP> entries in signal
if the average is above a volume threshold, we assume a tone is playing
if a tone is playing, we set the average as 1, else as 0
"""
STEP = 2000
VOLUME_THRESHOLD = 50

# normalize to all positives
signal = [abs(x) for x in signal]

averages = [0 if (sum(signal[i*STEP : (i+2)*STEP]) / STEP) < VOLUME_THRESHOLD else 1 
            for i in range(1, len(signal)//STEP - 1)]
#print(averages)

DAH_LENGTH_THRESHOLD = 7        # Minimum length of a 'Dah' tone
SILENCE_LENGTH_THRESHOLD = 8    # Minimum length of letter delimiting silence
tracker = 0                     # Keeps track of the beginning of the last silence or sound
code = ''                       # Morse code transcription
for i in range(1, len(averages)):
    # if average increase in volume = dit or dah
    if averages[i] > averages[i-1]:
        # if silence length passes threshold, it's a full silence
        if (i-tracker) > SILENCE_LENGTH_THRESHOLD: 
            code += ' '
        tracker = i
    # if average decrease in volume = silence
    elif averages[i] < averages[i-1]:
        # if noise length passes threshold, it's a dah. else it's a dit
        code += '_' if (i-tracker) > DAH_LENGTH_THRESHOLD else '.'
        tracker = i
#print(code)



######################
# Morse to Plaintext #
######################

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
CODE_REVERSED = {value:key for key,value in CODE.items()}

print(''.join(CODE_REVERSED.get(i) for i in code.split()))
