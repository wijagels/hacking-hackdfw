"""
Decodes a .wav file of Morse code audio into plaintext.
"""

import numpy
import wave
import sys

if len(sys.argv) is not 2:
    print('\n    Must have a .wav file as the sole argument!\n')
    exit()

#   seed signal[] with values from the .wav file
spf = wave.open(sys.argv[1], 'r')
signal = spf.readframes(-1)
signal = numpy.fromstring(signal, 'Int16')

#   normalize to all positives
signal = [abs(x) for x in signal]


#   each entry of averages[] is the average of each <STEP> entries in signal
STEP = 2000
averages = [0 if (sum(signal[i*STEP : (i+2)*STEP]) / STEP) < 50 else 1 for i in range(1, ((len(signal)//STEP) - 1))]


code = ''       #   Morse code transcription
tracker = 0     #   Keeps track of the beginning of the last silence or sound
for i in range(1, len(averages)):
    #   if average increase in volume = dit or dah
    if averages[i] > averages[i-1]:
        code += ' ' if (i-tracker) > 8 else ''
        tracker = i
    #   if average decrease in volume = silence
    elif averages[i] < averages[i-1]:
        code += '_' if (i-tracker) > 8 else '.'
        tracker = i

#   print(code)

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
