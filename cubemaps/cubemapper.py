from PIL import Image

net = Image.open("net.png")


print(net.size)

(w,h) = net.size

dim = w/4
print(w/4, h/3)

box = (0, dim, dim, 2*dim)

region = net.crop(box)



regions = []
names = [
    "black_1",
    "pos_y",
    "black_2",
    "black_3",
    "neg_x",
    "pos_z",
    "pos_x",
    "neg_z",
    "black_4",
    "neg_y",
    "black_5",
    "black_6"
    ]
i = 0
for y in range(3):
    for x in range(4):
        #print( (x*dim, y*dim, (x+1)*dim, (y+1)*dim) )
        region = net.crop((x*dim, y*dim, (x+1)*dim, (y+1)*dim))
        region.save(f"{names[i]}.png")
        print(f"File saved: {names[i]}.png")
        i += 1
        


