export const MODELS_MAP = {
    'discodiffusion':{
        featured: true,
        url: "replicate/disco-diffusion",
        key: "r8.im/nightmareai/disco-diffusion@sha256:cc730cf65f83d7ffed2aa6d47bc9a538b628617be5a4c2db27e7aee6a6391920" ,
        name: "Disco Diffusion",
        id2pop: "1 Disco Diffusion",
        path: 'discodiffusion',
        category: '0 Featured',
        description: "![A Wonderful landscape of pollinations in a beautiful flower fields, in a mystical flower field Ultra detailed, hyper realistic 4k by Albert Bierstadt and Greg rutkowski](https://i.imgur.com/H1F0gTN.png)\n\n\n\n*A Wonderful landscape of pollinations in a beautiful flower fields, in a mystical flower field Ultra detailed, hyper realistic 4k by Albert Bierstadt and Greg rutkowski*\n\n\n\nThis is the  current go-to model for turning text into images. It might take a few minutes, but it is very artistic\n\n\n\n---\n\nTutorial Video *by Greg Bechtel* :\n\n\n\n<iframe \n\n    src=\"https://www.youtube.com/embed/-aUNQO5pXe0\"     \n\n    frameborder=\"0\"\n\n    allow=\"accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture\"\n\n    allowfullscreen> </iframe>\n\n\n\nCredits: [@gandamu](https://twitter.com/gandamu_ml)x, [@somnai_dreams](https://twitter.com/somnai_dreams), [Katherine Crowson](https://twitter.com/RiversHaveWings), [Adam Letts](https://twitter.com/gandamu_ml)"
    },
    'majestydiffusion': {
        featured: true,
        url:  "pollinations/majesty-diffusion-cog",
        key: "614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/majesty-diffusion-cog",
        name: 'Majesty Diffusion',
        id2pop: "0 Majesty Diffusion",
        path: 'majestydiffusion',
        category: '0 Featured',
        description: "![castle](https://user-images.githubusercontent.com/788417/169712054-fe3bf4bd-4473-4070-ba69-0f74f5c3e475.png)\n\n\n\nMajesty Diffusion is a mix of LAION and Disco Diffusion. Creates images that are more coherent and focused on individual objects rather than the complexity images with lots of small details in every part.\n\n\n\n---\n\n\n\nAccess our [Majestic Guide](https://multimodal.art/majesty-diffusion) (_under construction_), our [GitHub](https://github.com/multimodalart/majesty-diffusion), join our community on [Discord](https://discord.gg/yNBtQBEDfZ) or reach out via [@multimodalart on Twitter](https://twitter.com/multimodalart))\n\n\n\nby [dango233](https://github.com/Dango233/) and [apolinario (@multimodalart)](https://twitter.com/multimodalart). \n\nThe LAION-400M-trained model and the modified inference code are from [CompVis Latent Diffusion](https://github.com/CompVis/latent-diffusion). The guided-diffusion method is modified by Dango233 based on [Katherine Crowson](https://twitter.com/RiversHaveWings)'s guided diffusion notebook. multimodalart savable settings, MMC and assembled the Colab. Check the complete list on our GitHub. Some functions and methods are from various code masters (nsheppard, DanielRussRuss and others)\n"
    },
    'dalle': {
        featured: true,
        url: "pollinations/min-dalle",
        key: "614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/min-dalle",
        name: 'DallE',
        img: 'https://i.imgur.com/a9hByt4.png',
        id2pop: "2 DALLE-Mega (Requires Colab Pro)",
        path: 'dalle',
        category: '0 Featured',
        description: "<img src=\"https://i.imgur.com/a9hByt4.png\" width=\"300\">\n\n\n\n*Sunset over a lake*\n\n\n\nThe new model everyone is excited about.\n"
    },
    'avatarclip': {
        featured: true,
        url: "pollinations/avatar-clip",
        key: "614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/avatarclip",
        img: 'https://i.imgur.com/a9hByt4.png',
        name: 'Avatar Clip',
        id2pop: '',
        path: 'avatarclip',
        category: '0 Featured',
        description: "<img src=\"https://i.imgur.com/a9hByt4.png\" width=\"300\"> \n\n\n\nThis is a model that clips the avatar of a user to a specific part of the image. It is useful for creating avatars for other users.\n\n\n\n---\n\n\n\nAccess our Avatar Clip Guide(https://multimodal.art/avatar-clip) (_under construction_), our [GitHub](",
    },
    'swinir': {
        featured: true,
        url: "jingyunliang/swinir",
        key: "r8.im/jingyunliang/swinir@sha256:9d91795e944f3a585fa83f749617fc75821bea8b323348f39cf84f8fd0cbc2f7",
        name: 'Swinir',
        img: 'https://i.imgur.com/a9hByt4.png',
        id2pop: "2 SwinIR Super-Resolution",
        path: 'swinir',
        category: '0 Featured',
        description: "<img src=\"https://i.imgur.com/BKvDhnf.png\" width=\"300\" height=\"300\" />\n\n\n\nUses [SwinIR](https://github.com/JingyunLiang/SwinIR) to perform 4x neural super-resolution (creates HD images from low resolution)\n\n\n\n---\n\nCredits: [Jingyun Liang]((https://github.com/JingyunLiang)\n\nLicense: MIT",
    },
    'adampi': {
        featured: true,
        url: "pollinations/adampi",
        key: "614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/adampi",
        name: 'AdaMPI',
        img: 'https://i.imgur.com/a9hByt4.png',
        id2pop: "1 Photo3D",
        path: 'adampi',
        category: '0 Featured',
        description: "<img src=\"https://i.imgur.com/BKvDhnf.png\" width=\"300\" height=\"300\" />\n\n\n\nUses [SwinIR](https://github.com/JingyunLiang/SwinIR) to perform 4x neural super-resolution (creates HD images from low resolution)\n\n\n\n---\n\nCredits: [Jingyun Liang]((https://github.com/JingyunLiang)\n\nLicense: MIT",
    }

}