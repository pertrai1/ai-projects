from importlib.metadata import version

import tiktoken

print("tiktoken version:", version("tiktoken"))

tokenizer = tiktoken.get_encoding("gpt2")

# text = (
#     "Hello, do you like tea? <|endoftext|> In the sunlit terracesof someunknownPlace."
# )
# integers = tokenizer.encode(text, allowed_special={"<|endoftext|>"})
# # print(integers)

# strings = tokenizer.decode(integers)
# print(strings)
#
with open("the-verdict.txt", "r", encoding="utf-8") as f:
    raw_text = f.read()

encoded_text = tokenizer.encode(raw_text)
print(len(encoded_text))

enc_sample = encoded_text[50:]

context_size = 4
# x = enc_sample[:context_size]  # contains the input tokens
# y = enc_sample[1 : context_size + 1]  # targets, which are inputs shifted by 1
# print(f"x: {x}")
# print(f"y:      {y}")

for i in range(1, context_size + 1):
    context = enc_sample[:i]
    desired = enc_sample[i]
    print(context, "---->", desired)
# OUTPUT
# 5146
# [290] ----> 4920
# [290, 4920] ----> 2241
# [290, 4920, 2241] ----> 287
# [290, 4920, 2241, 287] ----> 257

for i in range(1, context_size + 1):
    context = enc_sample[:i]
    desired = enc_sample[i]
    print(tokenizer.decode(context), "---->", tokenizer.decode([desired]))
# OUTPUT
# and ----> established
# and established ----> himself
# and established himself ----> in
# and established himself in ---> a
