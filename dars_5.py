savollar = ["Ish vaqti?", "Manzil?", "Narx qancha?"]

# savollar.append("Nomi?")
savollar.insert(1, "qayerda?")
savollar.pop()
print(savollar)

sonlar = [3, 5, 4, 2, 1, 0]
sonlar.sort()
print(sonlar[::5])

sonlar = (3, 5, 4, 2, 1, 0)
print(type(sonlar))