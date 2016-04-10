import string
import requests
import sys

def caesar_cipher(msg, shift):
    # create a character-translation table
    trans = dict(zip(string.lowercase, string.lowercase[shift:] + string.lowercase[:shift]))
    trans.update(zip(string.uppercase, string.uppercase[shift:] + string.uppercase[:shift]))

    # apply it to the message string
    return ''.join(trans.get(ch, ch) for ch in msg)

for i in range(-26, 27):
    s = caesar_cipher(sys.argv[1], i)
    print(s)
    # url = "https://hdfw-tehgame.herokuapp.com/puzzle/caesar/wjagels1@binghamton.edu"
    # data = {"answer": s}

    # response = requests.request("POST", url, data=data)
    # print(response.json())
