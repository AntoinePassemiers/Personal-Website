---
layout: ../../../layouts/PostLayout.astro
title: Neural networks for dummies
description: An intuitive but also formal explanation of neural networks and the backpropagation algorithm
date: 2026-06-23
author: Antoine Passemiers
lang: en
tag: Machine Learning
difficulty: 1
---

In the age of generative AI, it may be important to understand how modern large language models, and more largely neural networks, are actually trained. Neural networks have become incredibly complex over time, but this complexity boils down to the data collection process, architectural design and implementation. In fact, the mathematics needed to understand the training of neural networks is quite simple: all you need to know is how to work with derivatives, a concept you probably remember from high school. Indeed, the *backpropagation algorithm*, which underlies the training of any model, is solely based on derivatives.

## Neural networks are not "networks of neurons"

There is massive content about neural networks and backpropagation online, so it would be pretty useless repeating what has been written already. Anyway, when I was studying Machine Learning during my Master, I found the overwhelming majority (if not all) of formal courses and online blog posts incomplete or confusing on this topic. It took me the implementation of a deep learning library from scratch to understand how things actually work. So in this post, I will explain the algorithm the way I understood it.

> "What I cannot create, I do not understand."
>
> — Richard Feynman

I'm going to dispel several common misconceptions right off the bat. Do not think of neural networks as "networks of neurons". Forget about the drawings everyone is sharing, depicting neurons interconnected with edges all over the place. While the analogy with brains can grant you a superficial understanding of how neural networks **make predictions**, it is a dead end if your goal is to fully grasp how they are **trained**. This neural analogy is all the more false nowadays, now that neural networks involve more than fully-connected layers, such as convolutions or transformers, which do not even remotely resemble biological neurons.

TODO: explanation that is more rigorous, more intuitive, and closer to how it is implemented in practice

## A single-layer model

Neural networks are nothing more than compositions of mathematical functions. Let's start with the simplest example possible:

<figure>
    <picture>
        <source srcset="/images/backpropagation-algorithm/forward-1-dark.svg" media="(prefers-color-scheme: dark)">
        <source srcset="/images/backpropagation-algorithm/forward-1-dark.svg" media="(prefers-color-scheme: light)">
        <img src="/images/backpropagation-algorithm/full-dark.svg" alt="MLP forward pass" />
    </picture>
</figure>

Here, $X$ is a data matrix. If you don't remember what a matrix is, you will definitely need a refresher first: https://en.wikipedia.org/wiki/Matrix_(mathematics).
If you don't have the time, let's make a super accelerated course about matrices:
- Matrices are nothing more than grids of numbers (e.g. Excel sheets). For the sake of example, let's imagine that each row corresponds to an image summary, and each column corresponds to a descriptive feature about that image. If there are $n$ images and $m$ visual cues, the matrix $X$ is of shape $n \times m$.
- The element located at row $i$ and column $j$ of matrix $X$ is denoted as $X_{ij}$. The following notation can also be used: $\left( X \right)_{ij}$.
- $X^T$ is the transpose of $X$, that is, the matrix obtained by swapping the rows and columns of $X$. By transposing a matrix twice, we again obtain the same matrix: $X = (X^T)^T$. For this specific reason, it can also be said that $X_{ij} = X_{ji}^T$.

Let's come back to the model depicted in the figure hereabove. $XU$ is the product of matrices $X$ and $U$, which is a matrix whose elements are defined as
$$
\left( XU \right)_{ij} = \sum_k X_{ik} U_{kj}.
$$
So what is $U$ exactly? Well, it is a matrix parameter. It is the very matrix that will be **learned** to solve our problem. Because $U$ is learnable, I enclosed it in the first block in the figure. In the case of a binary classification problem (e.g. determining whether or not there is a cat in the picture), the output of the neural network needs to be a single value, $U$ has only one column, which essentially makes it a vector. Let's note that in statistics, such model is a special case of what we call a *logistic regression* ("logit" to those in the know).

The next question you might have is why multiplying $X$ and $U$? Because it is a way to couple the variables/descriptors/features found in $X$, and assign them different weights or degrees of importance. For example, a variable related to the presence of furr should have a positive and high contribution for detecting cats in a picture, but a negative and high contribution for detecting dolphins. On the other hand, a variable related to the overall brightness of the picture should have a low or near-zero contribution, as it should (in principle) not allow to reliably distinguish between cats and other animals, for example.

Finally, $\sigma$ is an activation function defined as
$$
\left( \sigma(X) \right)_{ij} = \frac{1}{1 + e^{-X_{ij}}}.
$$
As can be seen immediately from the formula, the function is applied on each element of the matrix *independently*. Here, the point is not to couple the variables, but to *transform* them. To be more specific, this function forces the output to be bounded between 0 and 1. This is very convenient if the model is designed for estimating probabilities (e.g., the probability that a pictured animal is a cat, a dog, a naked mole-rat or a tardigrade). As we will see in the next section, the activation function can have a second, much more important role in the model.

## Why deep learning has to be deep

The model presented in the previous section is naive in multiple ways. First, it lacks what we call a "bias term" or "intercept". In practice, the full formula is $\sigma(XU + b)$, not just $\sigma(XU)$. That's not a problem, as my example can be easily generalized to more complex models. Spoiler: handling additions is simpler than handling multiplications. If you understand the whole content of this post, implementing the addition should be a piece of cake. By the way, if you wonder what $b$ is used for, it helps the model ensuring that on average, the values of $XU + b$ are located not too far from zero, therefore making the values of $\sigma(XU + b)$ not too far from $\frac{1}{2}$. This is of utmost importance, as it enforces the estimations to default to roughly neutral values when the model is unconfident or lacks discriminative information.

The second limitation is that it only considers the **linear relationship between variables**. By that, I mean that each descriptive feature contributes independently to the estimated probabilities. Let's jump back to the animal classification example. Indian peafowls can be identified by the presence of brown plumage OR the presence of a long, ornamental tail. By OR, I mean XOR (exclusive OR): both facts cannot be true at the same time. This is refered to as sexual dimorphism: male Indian peafowls (peacocks) have a long tail, while females (peahens) have a mostly brown plumage [^1]. None of them has both at the same time. A linear model wouldn't be suitable here, as it could classify a random bird as an Indian peafowl with overconfidence due to the presence of both brown plumage and a long tail. This problem can be found in various forms, and is called the "XOR problem" [^2].

To account for the *non-linear* relationship between variables, we need to apply activation functions (which are purposely designed to be non-linear) **before** combining the variables with a linear operation. Let's add a fully-connected operation after our activation function. Now that the model no longer ends up with an activation function, the outputs are no longer probabilities bounded between 0 and 1. The natural solution is to add another activation function as well, which gives this new architecture:

<figure>
    <picture>
        <source srcset="/images/backpropagation-algorithm/forward-no-loss-dark.svg" media="(prefers-color-scheme: dark)">
        <source srcset="/images/backpropagation-algorithm/forward-no-loss-dark.svg" media="(prefers-color-scheme: light)">
        <img src="/images/backpropagation-algorithm/forward-no-loss-dark.svg" alt="MLP forward pass" />
    </picture>
</figure>

A variant of this two-layer architecture has been proven to be suitable for approximating **any** function, as long as the size of the matrices is large enough. This important result, called the Universal Approximation Theorem [^3], is a theoretical foundation for using neural networks in diverse and unrelated problems: neural networks can adapt to any data.

Let's note an important transformation of our model. Previously, we had a matrix parameter $U$ of shape $m \times c$, where $c$ is the number of classes (e.g., the number of animal species to distinguish). Now, we have two matrices $U$ and $V$, which have shapes $m \times h$ and $h \times c$, where $h$ is unknown. In fact, $h$ is unknown because it is up to us to choose it. Because it is arbitrary, it is called a *hyper-parameter*. Let's note that $h$ is the number of columns in $U$ but also the number of rows in $V$ to ensure that the dimensions match. Otherwise, matrix multiplication would be invalid and undefined.

While the theory suggest that this two-layer neural network is extremely powerful, there is a catch: nobody is using such architectures in 2026. You probably came across the term "deep learning" already. "Deep" refers to the number of layers that a neural network possesses. Most modern neural networks have very large numbers of layers. GPT-3 175B, a relatively old large language model, has no fewer than 96 layers [^4]. So why do practitioners have recourse to more layers than just two?

For the Universal Approximation Theorem to hold in practice, the size of the matrices should scale to the difficulty of the problem. The more intricate the data, the higher $h$ should be. However, increasing the size of matrices $U$ and $V$ brings a new problem: **overfitting**. To put it simply, overfitting occurs when a model learns by heart the data being shown during training. When parameter matrices (here $U$ and $V$) become too large, the model starts using them as plain memory, instead of drawing smart, short and general conclusions from the data. Humans act in the exact same way: the less material we must study and/or the more time we have to study it, the easier it is for us to study it by heart. Here, the smaller the data matrix ($X$) and/or the more capacity the model has ($U$ and $V$, through $h$), the more likely it is to overfit. In both cases, the consequence is the same: performance becomes miserable when confronted with new, unseen questions/data. And in both cases, the correct way to fix the problem is the same: building abstraction.

The best way to build abstraction is **by doing more with less**: training the model accurately with less parameters. This is why Machine Learning research didn't simply stop with the Universal Approximation Theorem. Researchers are constantly seeking to build more powerful models using "sophisticated" mathematical functions. Here are two examples:
- Convolutional neural networks, which attain large "receptive fields" by stacking convolutional filters [^5]. In other words, these models are capable of observing and extracting information from all the pixels of an image using relatively few parameters.
- Transformers, which are capable of paying "attention" to all the elements of a sequence (e.g. the words in a text) without losing context [^6].
Convolutions and transformers are both designed to workwith a number of parameters that does not increase with the amount of available data.

In any case, to make the mathematical details less tedious, let's focus on the architecture illustrated in the previous figure.

## Training the model

So far, we have the following ingredients:
- Some data: $X$
- A model: $\sigma(\sigma(XU)V)$

Now, I would like to take a few minutes to address a common confusion, which turns out to be ubiquitous across all media, but also in the broad scientific community. There is a clear, well-defined distinction between model and algorithm, and these two terms should not be used interchangeably. **The model** encapsulates the way we perceive the world, and how conclusions or predictions should be made from the data (if available). This notion is somehow materialistic: 
in our example, it encompasses the parameter matrices $U$ and $V$, the description of how to identify animals in images, which mathematical functions to use for that purpose, and a graphical illustration of the model with boxes and arrows. Moreover, the model also takes physical space, as it is necessarily stored in the computer's RAM whenever it is used. When downloading a large language model via HuggingFace [^7], you download a model, not an algorithm. An **algorithm** dictates how to use the model. In fact, each neural network has at least two algorithms related to it:
- The forward pass: computing outputs from the data (e.g., probabilities). To give you an idea, this algorithm is used every time you ask ChatGPT a question. In our example, the forward pass is simply about computing $\sigma(\sigma(XU)V)$, given a data matrix $X$.
- The training algorithm, which builds on the backpropagation algorithm. This step is costly and requires collecting data beforehand.

Which brings me to the training phase. How can a neural network know which animal is shown on a picture? Well, it can't until you train it. Which means that before training, the model will simply give random answers. In our example, this is because $U$ and $V$, which must necessarily exist prior to the training phase, are initialized with random values. It is by trial-and-error that the model will learn how to perform better than random. But how to tell the model how wrong it is? For that we need to define a *loss function*, which quantifies how wrong the model is. But for this we 
TODO

<figure>
    <picture>
        <source srcset="/images/backpropagation-algorithm/forward-dark.svg" media="(prefers-color-scheme: dark)">
        <source srcset="/images/backpropagation-algorithm/forward-dark.svg" media="(prefers-color-scheme: light)">
        <img src="/images/backpropagation-algorithm/forward-dark.svg" alt="MLP forward pass" />
    </picture>
</figure>

TODO: softmax

## The chain rule

Do you remember about derivatives? A partial derivative $\frac{\partial y}{\partial x}$ quantifies how much $y$ varies when $x$ varies by a small proportion. Assuming $z$ is a variable that depends on $y$, which in turns depends on $x$, the **chain rule**[^8] provides a formula for how $z$ is affected when $x$ changes:
$$
\frac{\partial z}{\partial x} = \frac{\partial z}{\partial y} \frac{\partial y}{\partial x}
$$
Now, when $z$ depends on $x$ indirectly through multiple variables $y_1, y_2, \dotsc$, the variations can be simply added up:
$$
\frac{\partial z}{\partial x} = \sum_i \frac{\partial z}{\partial y_i} \frac{\partial y_i}{\partial x}
$$
Similarly, if $z$ depends on $x$ indirectly through multiple variables $Y_{1,1}, Y_{1,2}, \dotsc, Y_{2,1}, Y_{2,2}, \dotsc$, where $Y$ is a matrix, the variations also add up:
$$
\frac{\partial z}{\partial x} = \sum_i \sum_j \frac{\partial z}{\partial Y_{ij}} \frac{\partial Y_{ij}}{\partial x}
$$

**So if you were wondering how derivatives relate to neural networks, now is the time.** Computing the derivative of the loss function with respect to each parameter of the model is extremely insightful, as it reflects how the loss function would be affected by changing that parameter. Since our goal is to *minimize* the loss function, a simple approach would be to update each parameter in the *direction opposite to the derivative*.

Let's note that in our example, there are $m \times h$ parameter values in $U$, and $h \times c$ parameter values in $V$. For the sake of using the practitioners terminology, usually we don't say that we are "computing the $m \times h$ derivatives of $\ell$ with respect to each value of $U$", but simply "computing the gradient of $U$". Let's denote the gradients of $U$ and $V$ as $\nabla U$ and $\nabla V$, respectively.

For now, let's abstract away some mathematical details from previous figures and simplify the notation using matrices $Z^{(1)}$, $Z^{(2)}$, $Z^{(3)}$, $Z^{(4)}$. Let's denote the loss function by $\ell$. The **backpropagation algorithm** consists in computing the gradients in the way depicted in the figure below:

<figure>
    <picture>
        <source srcset="/images/backpropagation-algorithm/backprop-simplified-dark.svg" media="(prefers-color-scheme: dark)">
        <source srcset="/images/backpropagation-algorithm/backprop-simplified-dark.svg" media="(prefers-color-scheme: light)">
        <img src="/images/backpropagation-algorithm/backprop-simplified-dark.svg" alt="Simplified backpropagation" />
    </picture>
</figure>

This is precisely why the gradient estimation algorithm is called the backpropagation algorithm: because it propagates the information obtained at the end (the right) of the network back to the start (the left), computing the gradient of $U$ and $V$ along the way. This approach is valid because the chain rule can be applied on each function successively.

I represented The information passed from block to block as matrices $Z^{(1)}$, $Z^{(2)}$, $Z^{(3)}$, $Z^{(4)}$ and $Z^{(5)}$. Let's apply the **chain rule** to find out what each of these matrices is. That's where the maths start to kick in.

Let's start from the end, and compute the gradient of $\ell$ with respect to $Z_{ij}^{(4)}$. This is straightforward because $\ell$ depends on nothing but $Z_{ij}^{(4)}$. As a reminder, the formula for our loss function (the binary cross-entropy) is:
$$
\ell = -\frac{1}{nm}\sum_i \sum_j \left( Y_{ij} \log(Z_{ij}^{(4)}) + (1 - Y_{ij}) \log(1 - \log(Z_{ij}^{(4)}) \right)
$$
Its derivatives are given by:
$$
\begin{aligned}
\frac{\partial \ell}{\partial Z_{ij}^{(4)}} & = -\frac{1}{nm} \frac{\partial}{\partial Z_{ij}^{(4)}} \left( Y_{ij} \log(Z_{ij}^{(4)}) + (1 - Y_{ij}) \log(1 - Z_{ij}^{(4)}) \right) \\
& -\frac{1}{nm} 
\end{aligned}
$$


$$
\begin{aligned}
\frac{\partial \ell}{\partial Z_{ij}^{(4)}} & := G \\
\end{aligned}
$$

$$
\begin{aligned}
\frac{\partial \ell}{\partial Z_{ij}^{(3)}} & = \sum_k \sum_l \frac{\partial \ell}{\partial Z_{kl}^{(4)}} \frac{\partial Z_{kl}^{(4)}}{\partial Z_{ij}^{(3)}} \\
& = \sum_k \sum_l \frac{\partial \ell}{G_{kl}} \frac{\partial \sigma\left(Z_{kl}^{(3)}\right)}{\partial Z_{ij}^{(3)}} \\
& = G_{ij} \sigma'\left(Z_{ij}^{(3)}\right) \\
\end{aligned}
$$

$$
\begin{aligned}
\frac{\partial \ell}{\partial Z_{ij}^{(2)}} & = \sum_k \sum_l \frac{\partial \ell}{\partial Z_{kl}^{(3)}} \frac{\partial Z_{kl}^{(3)}}{\partial Z_{ij}^{(2)}} \\
& = \sum_k \sum_l \frac{\partial \ell}{\partial Z_{kl}^{(3)}} \frac{\partial \left(\sum_r Z_{kr}^{(2)}V_{rl}\right)}{\partial Z_{ij}^{(2)}} \\
& = \sum_l \frac{\partial \ell}{\partial Z_{il}^{(3)}} \sum_r \frac{\partial \left(Z_{ir}^{(2)}V_{rl}\right)}{\partial Z_{ij}^{(2)}} \\
& = \sum_l \frac{\partial \ell}{\partial Z_{il}^{(3)}} V_{jl} \\
& = \sum_l \frac{\partial \ell}{\partial Z_{il}^{(3)}} V_{lj}^T \\
\end{aligned}
$$


$$
\begin{aligned}
\frac{\partial \ell}{\partial V_{ij}} & = \sum_k \sum_l \frac{\partial \ell}{\partial Z_{kl}^{(3)}} \frac{\partial Z_{kl}^{(3)}}{\partial V_{ij}} \\
& = \sum_k \sum_l \frac{\partial \ell}{\partial Z_{kl}^{(3)}} \frac{\partial \left(\sum_r Z_{kr}^{(2)}V_{rl}\right)}{\partial V_{ij}} \\
& = \sum_k \frac{\partial \ell}{\partial Z_{kj}^{(3)}} \sum_r \frac{\partial \left(Z_{kr}^{(2)}V_{rj}\right)}{\partial V_{ij}} \\
& = \sum_k \frac{\partial \ell}{\partial V_{ij}} Z_{ki}^{(2)} \\
& = \sum_k \left(Z_{ik}^{(2)}\right)^T \frac{\partial \ell}{\partial V_{ij}} \\
\end{aligned}
$$

<figure>
    <picture>
        <source srcset="/images/backpropagation-algorithm/forward-simplified-dark.svg" media="(prefers-color-scheme: dark)">
        <source srcset="/images/backpropagation-algorithm/forward-simplified-dark.svg" media="(prefers-color-scheme: light)">
        <img src="/images/backpropagation-algorithm/forward-simplified-dark.svg" alt="MLP forward pass" />
    </picture>
</figure>

<figure>
    <picture>
        <source srcset="/images/backpropagation-algorithm/backprop-blocks-dark.svg" media="(prefers-color-scheme: dark)">
        <source srcset="/images/backpropagation-algorithm/backprop-blocks-dark.svg" media="(prefers-color-scheme: light)">
        <img src="/images/backpropagation-algorithm/backprop-blocks-dark.svg" alt="Forward pass and backward pass of each block" />
    </picture>
</figure>

TODO

## The backpropagation algorithm in action

<figure>
    <picture>
        <source srcset="/images/backpropagation-algorithm/full-dark.svg" media="(prefers-color-scheme: dark)">
        <source srcset="/images/backpropagation-algorithm/full-dark.svg" media="(prefers-color-scheme: light)">
        <img src="/images/backpropagation-algorithm/full-dark.svg" alt="MLP forward pass + backward pass" />
    </picture>
</figure>


[^1]: https://en.wikipedia.org/wiki/Indian_peafowl
[^2]: Passemiers, Antoine, et al. "A quantitative benchmark of neural network feature selection methods for detecting nonlinear signals." _Scientific Reports_ 14 (2024): 31180.
[^3]: Cybenko, George. "Approximation by superpositions of a sigmoidal function." _Mathematics of control, signals and systems_ 2.4 (1989): 303-314.
[^4]: Brown, Tom, et al. "Language models are few-shot learners." _Advances in neural information processing systems_ 33 (2020): 1877-1901.
[^5]: LeCun, Yann, et al. "Backpropagation applied to handwritten zip code recognition." _Neural computation_ 1.4 (1989): 541-551.
[^6]: Vaswani, Ashish, et al. "Attention is all you need." _Advances in neural information processing systems_ 30 (2017).
[^7]: https://huggingface.co/
[^8]: https://en.wikipedia.org/wiki/Chain_rule