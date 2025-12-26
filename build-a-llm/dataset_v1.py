import tiktoken
import torch
from mpmath import fourier
from torch.distributed.distributed_c10d import batch_isend_irecv
from torch.utils.data import DataLoader, Dataset

tokenizer = tiktoken.get_encoding("gpt2")


class GPTDatasetV1(Dataset):
    def __init__(self, txt, tokenizer, max_length, stride):
        self.input_ids = []
        self.target_ids = []

        # tokenize the entire text
        token_ids = tokenizer.encode(txt)

        # Use a sliding window to chunk the book into overlapping sequences of max_length
        for i in range(0, len(token_ids) - max_length, stride):
            input_chunk = token_ids[i : i + max_length]
            target_chunk = token_ids[i + 1 : i + max_length + 1]
            self.input_ids.append(torch.tensor(input_chunk))
            self.target_ids.append(torch.tensor(target_chunk))

    def __len__(self):
        return len(self.input_ids)

    def __getitem__(self, idx):
        return self.input_ids[idx], self.target_ids[idx]


def create_dataloader_v1(
    txt,
    batch_size=4,
    max_length=256,
    stride=128,
    shuffle=True,
    drop_last=True,
    num_workers=0,
):
    dataset = GPTDatasetV1(txt, tokenizer, max_length, stride)
    dataloader = DataLoader(
        dataset,
        batch_size=batch_size,
        shuffle=shuffle,
        drop_last=drop_last,
        num_workers=num_workers,
    )

    return dataloader


with open("the-verdict.txt", "r", encoding="utf-8") as f:
    raw_text = f.read()

dataloader = create_dataloader_v1(
    raw_text, batch_size=1, max_length=4, stride=1, shuffle=False
)
data_iter = iter(dataloader)
first_batch = next(data_iter)
print(
    first_batch
)  # [tensor([[ 40, 367, 2885, 1464]]), tensor([[ 367, 2885, 1464, 1817]])]
second_batch = next(data_iter)
print(
    second_batch
)  # [tensor([[ 367, 2885, 1464, 1807]]), tensor([[2885, 1464, 1807, 3619]])]

# Set max_length = 2 stride = 2 to get a better idea of the context window sliding
dataloader2 = create_dataloader_v1(
    raw_text, batch_size=1, max_length=2, stride=2, shuffle=False
)
data_iter2 = iter(dataloader2)
third_batch = next(data_iter2)
print(third_batch)  # [tensor([[ 40, 367]]), tensor([[ 367, 2885]])]
fourth_batch = next(data_iter2)
print(fourth_batch)  # [tensor([[2885, 1464]]), tensor([[1464, 1807]])]

# Set max_length = 8 stride = 2
dataloader3 = create_dataloader_v1(
    raw_text, batch_size=1, max_length=8, stride=2, shuffle=False
)
data_iter3 = iter(dataloader3)
fourth_batch = next(data_iter3)
print(
    fourth_batch
)  # [tensor([[  40,  367, 2885, 1464, 1807, 3619,  402,  271]]), tensor([[  367,  2885,  1464,  1807,  3619,   402,   271, 10899]])]
fifth_batch = next(data_iter3)
print(
    fifth_batch
)  # [tensor([[ 2885,  1464,  1807,  3619,   402,   271, 10899,  2138]]), tensor([[ 1464,  1807,  3619,   402,   271, 10899,  2138,   257]])]

# Sample with batch size greater than 1
dataloader4 = create_dataloader_v1(
    raw_text, batch_size=8, max_length=4, stride=4, shuffle=False
)
data_iter4 = iter(dataloader4)
inputs, targets = next(data_iter4)
# print("Inputs:\n", inputs)
# print("\nTargets:\n", targets)
# Inputs:
#  tensor([[   40,   367,  2885,  1464],
#         [ 1807,  3619,   402,   271],
#         [10899,  2138,   257,  7026],
#         [15632,   438,  2016,   257],
#         [  922,  5891,  1576,   438],
#         [  568,   340,   373,   645],
#         [ 1049,  5975,   284,   502],
#         [  284,  3285,   326,    11]])

# Targets:
#  tensor([[  367,  2885,  1464,  1807],
#         [ 3619,   402,   271, 10899],
#         [ 2138,   257,  7026, 15632],
#         [  438,  2016,   257,   922],
#         [ 5891,  1576,   438,   568],
#         [  340,   373,   645,  1049],
#         [ 5975,   284,   502,   284],
#         [ 3285,   326,    11,   287]])

vocab_size = 50257
output_dim = 256
token_embedding_layer = torch.nn.Embedding(vocab_size, output_dim)

max_length = 4
dataloader5 = create_dataloader_v1(
    raw_text, batch_size=8, max_length=max_length, stride=max_length, shuffle=False
)

data_iter5 = iter(dataloader5)
inputs1, targets1 = next(data_iter5)
print("Token IDs:\n", inputs1)
print("\nInputs shape:\n", inputs.shape)
# Token IDs:
#  tensor([[   40,   367,  2885,  1464],
#         [ 1807,  3619,   402,   271],
#         [10899,  2138,   257,  7026],
#         [15632,   438,  2016,   257],
#         [  922,  5891,  1576,   438],
#         [  568,   340,   373,   645],
#         [ 1049,  5975,   284,   502],
#         [  284,  3285,   326,    11]])

# Inputs shape:
#  torch.Size([8, 4])

token_embeddings = token_embedding_layer(inputs1)
print(token_embeddings.shape)  # torch.Size([8, 4, 256]) 8 x 4 x 256-dimensional tensor
