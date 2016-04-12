import playfair
import sys

ph = playfair.Playfair()
string = sys.argv[1]
ph.setPassword('HACKDFW')

ans = ph.decrypt(string)
print(ans)
