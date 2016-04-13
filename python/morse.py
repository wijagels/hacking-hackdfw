"""
Decodes a base64 => .mp3 file of Morse code audio into plaintext.
"""

import numpy
import wave
import sys
import subprocess
import os

#   arg check
if (len(sys.argv) is not 2) or (sys.argv[1].find('.wav', len(sys.argv[1]) - 4) > 0):
    print('\n    Must have an .mp3 file as the sole argument!\n')
    exit()

#   convert mp3 to wav
TEMP_OUTPUT_WAV = './output.wav'
subprocess.call(['ffmpeg', '-loglevel', 'panic', '-hide_banner', '-y', '-i', sys.argv[1], TEMP_OUTPUT_WAV])

#   seed signal[] with values from the .wav file
spf = wave.open('output.wav', 'r')
os.remove(TEMP_OUTPUT_WAV)
signal = spf.readframes(-1)
signal = numpy.fromstring(signal, 'Int16')

#   normalize to all positives
signal = [abs(x) for x in signal]


#   each entry of averages[] is the average of each <STEP> entries in signal
STEP = 2000
averages = [0 if (sum(signal[i*STEP : (i+2)*STEP]) / STEP) < 50 else 1 for i in range(1, ((len(signal)//STEP) - 1))]
#print(averages)

code = ''       #   Morse code transcription
tracker = 0     #   Keeps track of the beginning of the last silence or sound
DAH_LENGTH_THRESHOLD = 8
SILENCE_LENGTH_THRESHOLD = 8
for i in range(1, len(averages)):
    #   if average increase in volume = dit or dah
    if averages[i] > averages[i-1]:
        #   if silence length passes threshold, it's a full silence
        code += ' ' if (i-tracker) > DAH_LENGTH_THRESHOLD else ''
        tracker = i
    #   if average decrease in volume = silence
    elif averages[i] < averages[i-1]:
        #   if noise length passes threshold, it's a dah. else it's a dit
        code += '_' if (i-tracker) > SILENCE_LENGTH_THRESHOLD else '.'
        tracker = i

print(code)

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
