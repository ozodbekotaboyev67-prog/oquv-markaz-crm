name =  input("what is your name: ") .strip() .title()
price =  1_000_000
is_student =input("Talabamisiz? ha/yo'q:").strip().lower() == "ha"

if is_student:
    discount = 0.10
else:
    discount = 0

final_price = int(price * (1 - discount))

print(f"{name}, final price is: {final_price:,} so'm")