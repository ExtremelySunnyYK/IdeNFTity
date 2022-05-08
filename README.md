# 🏗 IdeNFTity

IdeNFTity uses a person's particulars to generate a unique NFT! Beyond digitalising peoples' identity into a unique asset that they can own, the NFT can serve as a _'namecard'_ of sorts in today's digital age. It can also potentially help streamline the process of online applications by removing the need to individually fill in fields but rather submitting the NFT identity directly. Lastly, IdenNFTity helps people generate beautiful and unique art that they can call their own!


## Technical Overview
Users can enter their professional details in our Frontend that is built with React. The user data will then be passed to our AI API backend (hosted in FastAPI backend) where it is pre-processed, tokenised and vectorised to construct a raw user image. The raw user image is then meshed with 2 other images using neural style transfer to create a unique piece of art. The image of the artwork and the json file are saved to Infura which then returns a link to the data. The link returned to the React frontend calls Hardhat to mint the smart contract with information. Hardhat then returns the NFT address to the frontend where it is passed to the user.

# 🏄‍♂️ Quick Start

Prerequisites: [Node (v16 LTS)](https://nodejs.org/en/download/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)

> clone/fork 🏗 :

```bash
git clone https://github.com/ExtremelySunnyYK/IdeNFTity.git
```

> install and start the 👷‍ Hardhat chain:

```bash
cd ideNFTity
yarn install
yarn chain
```

> In a second terminal window, start the 📱 frontend:

```bash
cd ideNFTity
yarn start
```

> In a third terminal window, 🛰 deploy the contract:

```bash
cd ideNFTity
yarn deploy
```
