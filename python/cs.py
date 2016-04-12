"""Takes a caeser enciphered string in argv[1] and outputs all
the possibilities with uppercase and lowercase accounted for."""

import string
import sys


def caesar_cipher(msg, shift):
    '''
    Caesar cipher with uppercase letters
    '''
    # create a character-translation table
    trans = dict(zip(string.ascii_lowercase,
                     string.ascii_lowercase[shift:] +
                     string.ascii_lowercase[:shift]))
    trans.update(zip(string.ascii_uppercase,
                     string.ascii_uppercase[shift:] +
                     string.ascii_uppercase[:shift]))

    # apply it to the message string
    return ''.join(trans.get(ch, ch) for ch in msg)

for i in range(-26, 27):
    s = caesar_cipher(sys.argv[1], i)
    print(s)
