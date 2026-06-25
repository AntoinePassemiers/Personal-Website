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

There is massive content about neural networks and backpropagation online, so it would be pretty useless repeating what has been written already. Anyway, when I was studying Machine Learning during my Master, I found the overwhelming majority (if not all) of formal courses and online blog posts incomplete or confusing on this topic. It took me the implementation of a deep learning library from scratch to understand how things actually work. So in this post, I will explain neural networks the way I understood them.

> "What I cannot create, I do not understand."
>
> — Richard Feynman

I'm going to dispel several common misconceptions right off the bat. Do not think of neural networks as "networks of neurons". Forget about the drawings everyone is sharing, depicting neurons interconnected with edges all over the place. While the analogy with brains can grant you a superficial understanding of how neural networks **make predictions**, it is a dead end if your goal is to fully grasp how they are **trained**. This neural analogy is all the more false nowadays, now that neural networks involve more than fully-connected layers, such as convolutions or transformers, which do not even remotely resemble biological neurons.

## A single-layer model

Neural networks are nothing more than compositions of mathematical functions. Let's start with the simplest example possible:

<figure>
    <picture>
        <source srcset="/images/backpropagation-algorithm/dark/forward-1.svg" media="(prefers-color-scheme: dark)">
        <source srcset="/images/backpropagation-algorithm/light/forward-1.svg" media="(prefers-color-scheme: light)">
        <img src="/images/backpropagation-algorithm/dark/formard-1.svg" alt="MLP forward pass" />
    </picture>
</figure>

Here, $X$ is a data matrix. If you don't remember what a matrix is, you will definitely need a refresher first: https://en.wikipedia.org/wiki/Matrix_(mathematics).
If you don't have the time, let's make a super accelerated course about matrices:
- Matrices are nothing more than grids of numbers (e.g. Excel sheets). For the sake of example, let's imagine that each row corresponds to an image summary, and each column corresponds to a descriptive feature about that image. If there are $n$ images and $m$ visual cues, the matrix $X$ is of shape $n \times m$.
- The element located at row $i$ and column $j$ of matrix $X$ is denoted as $X_{ij}$. The following notation can also be used: $\left( X \right)_{ij}$.
- $X^T$ is the transpose of $X$, that is, the matrix obtained by swapping the rows and columns of $X$. By transposing a matrix twice, we again obtain the same matrix: $X = (X^T)^T$. For this specific reason, it can also be said that $X_{ij} = \left(X^T\right)_{ji}$.
- $A \odot B$ is called the "Hadamard product", and is simpler than the "regular" matrix multiplication. It creates a matrix (let's call it $C$) where each element is the product of the corresponding elements in matrices $A$ and $B$. This means: $C_{ij} = A_{ij}B_{ij}$.
- When two matrices $A$ and $B$ are written down next to each other, such as $AB$, then there multiplied in the "regular way": $\left( AB \right)_{ij} = \sum_k A_{ik} B_{kj}.$

Let's come back to the model depicted in the figure hereabove. $XU$ is the product of matrices $X$ and $U$, which is a matrix whose elements are defined as
$$
\left( XU \right)_{ij} = \sum_k X_{ik} U_{kj}.
$$
So what is $U$ exactly? Well, it is a matrix parameter. It is the very matrix that will be **learned** to solve our problem. Because $U$ is learnable, I enclosed it in the first block in the figure. In the case of a binary classification problem (e.g. determining whether or not there is a cat in the picture), the output of the neural network needs to be a single value, $U$ has only one column, which essentially makes it a vector. Let's note that in statistics, such model is a what we call a *logistic regression* ("logit" to those in the know), but without an intercept term.

The next question you might have is why multiplying $X$ and $U$? Because it is a way to couple the variables/descriptors/features found in $X$, and assign them different weights or degrees of importance. For example, a variable related to the presence of furr should have a positive and high contribution for detecting cats in a picture, but a negative and high contribution for detecting dolphins. On the other hand, a variable related to the overall brightness of the picture should have a low or near-zero contribution, as it should (in principle) not allow to reliably distinguish between cats and other animals, for example.

Finally, $\sigma$ is an activation function defined as
$$
\left( \sigma(X) \right)_{ij} = \frac{1}{1 + e^{-X_{ij}}}.
$$
As can be seen immediately from the formula, the function is applied on each element of the matrix *independently*. Here, the point is not to couple the variables, but to *transform* them. To be more specific, this function forces the output to be bounded between 0 and 1. This is very convenient if the model is designed for estimating probabilities (e.g., the probability that a pictured animal is a cat, a dog, a naked mole-rat or a tardigrade). As we will see in the next section, the activation function can have a second, much more important role in the model. This is related to the fact that the function is *non-linear*. Non-linear means that it cannot be represented as a straight line. Here is the Sigmoid function:

<figure>
    <picture>
        <source srcset="/images/backpropagation-algorithm/dark/sigmoid.svg" media="(prefers-color-scheme: dark)">
        <source srcset="/images/backpropagation-algorithm/light/sigmoid.svg" media="(prefers-color-scheme: light)">
        <img src="/images/backpropagation-algorithm/dark/sigmoid.svg" alt="Sigmoid function" />
    </picture>
</figure>

The Sigmoid function is indeed not a straight line, but a curvy, S-like functions. It's no coincidence that sigmoid means "S-shaped" in Greek.

## Why deep learning has to be deep

The model presented in the previous section is naive in multiple ways. First, it lacks what we call a "bias term" or "intercept". In practice, the full formula is $\sigma(XU + b)$, not just $\sigma(XU)$. That's not a problem, as my example can be easily generalized to more complex models. Spoiler: handling additions is simpler than handling multiplications. If you understand the whole content of this post, implementing the addition should be a piece of cake. By the way, if you wonder what $b$ is used for, it helps the model ensuring that on average, the values of $XU + b$ are located not too far from zero, therefore making the values of $\sigma(XU + b)$ not too far from $\frac{1}{2}$. This is of utmost importance, as it enforces the estimations to default to roughly neutral values when the model is unconfident or lacks discriminative information. Of course, this explanation is only valid for my specific example, but the role of $b$ is much more context-dependent than it might seem.

The second limitation is that it only considers the **linear relationship between variables**. By that, I mean that each descriptive feature contributes independently to the estimated probabilities. Let's jump back to the animal classification example. Indian peafowls can be identified by the presence of brown plumage OR the presence of a long, ornamental tail. By OR, I mean XOR (exclusive OR): both facts cannot be true at the same time. This is refered to as sexual dimorphism: male Indian peafowls (peacocks) have a long tail, while females (peahens) have a mostly brown plumage [^1]. None of them has both at the same time. A linear model wouldn't be suitable here, as it could classify a random bird as an Indian peafowl with overconfidence due to the presence of both brown plumage and a long tail. This problem can be found in various forms, and is called the "XOR problem" [^2].

To account for the *non-linear* relationship between variables, we need to apply activation functions (which are purposely designed to be non-linear) **before** combining the variables with a linear operation. Let's add a fully-connected operation after our activation function. Now that the model no longer ends up with an activation function, the outputs are no longer probabilities bounded between 0 and 1. The natural solution is to add another activation function as well, which gives this new architecture:

<figure>
    <picture>
        <source srcset="/images/backpropagation-algorithm/dark/forward-no-loss.svg" media="(prefers-color-scheme: dark)">
        <source srcset="/images/backpropagation-algorithm/light/forward-no-loss.svg" media="(prefers-color-scheme: light)">
        <img src="/images/backpropagation-algorithm/dark/forward-no-loss.svg" alt="MLP forward pass" />
    </picture>
</figure>

A variant of this two-layer architecture has been proven to be suitable for approximating almost any function, as long as the size of the matrices is large enough. *To be more accurate, it can approximate continuous functions with compact support under specific conditions, but this doesn't matter much.* This important result, called the Universal Approximation Theorem [^3], is a theoretical foundation for using neural networks in diverse and unrelated problems: neural networks can adapt to almost any data.

Let's note an important transformation of our model. Previously, we had a matrix parameter $U$ of shape $m \times c$, where $c$ is the number of classes (e.g., the number of animal species to distinguish). Now, we have two matrices $U$ and $V$, which have shapes $m \times h$ and $h \times c$, where $h$ is unknown. In fact, $h$ is unknown because it is up to us to choose it. Because it is arbitrary, it is called a *hyper-parameter*. Let's note that $h$ is the number of columns in $U$ but also the number of rows in $V$ to ensure that the dimensions match. Otherwise, matrix multiplication would be invalid and undefined.

While the theory suggest that this two-layer neural network is extremely powerful, there is a catch: nobody is using such architectures in 2026. You probably came across the term "deep learning" already. "Deep" refers to the number of layers that a neural network possesses. Most modern neural networks have very large numbers of layers. GPT-3 175B, a relatively old large language model, has no fewer than 96 layers [^4]. So why do practitioners have recourse to more layers than just two?

For the Universal Approximation Theorem to hold in practice, the size of the matrices should scale to the difficulty of the problem. The more intricate the data, the higher $h$ should be. However, increasing the size of matrices $U$ and $V$ brings a new problem: **overfitting**. To put it simply, overfitting occurs when a model learns by heart the data being shown during training. When parameter matrices (here $U$ and $V$) become too large, the model starts using them as plain memory, instead of drawing smart, short and general conclusions from the data. Humans act in the exact same way: the less material we must study and/or the more time we have to study it, the easier it is for us to study it by heart. Here, the smaller the data matrix ($X$) and/or the more capacity the model has ($U$ and $V$, through $h$), the more likely it is to overfit. In both cases, the consequence is the same: performance becomes miserable when confronted with new, unseen questions/data. And in both cases, the correct way to fix the problem is the same: building abstraction.

The best way to build abstraction is **by doing more with less**: training the model accurately with less parameters. This is why Machine Learning research didn't simply stop with the Universal Approximation Theorem. Researchers are constantly seeking to build more powerful models using "sophisticated" mathematical functions. Here are two examples:
- Convolutional neural networks, which attain large "receptive fields" by stacking convolutional filters [^5]. In other words, these models are capable of observing and extracting information from all the pixels of an image using relatively few parameters.
- Transformers, which are capable of paying "attention" to all the elements of a sequence (e.g. the words in a text) without losing context [^6].
Convolutions and transformers are both designed to workwith a number of parameters that does not increase with the amount of available data.

In any case, to make the mathematical details less tedious, let's focus on the architecture illustrated in the previous figure.

## How to tell a model how wrong it is

So far, we have the following ingredients:
- Some data: $X$
- A model: $\sigma(\sigma(XU)V)$

Now, I would like to take a few minutes to address a common confusion, which turns out to be ubiquitous across all media, but also in the broad scientific community. There is a clear, well-defined distinction between model and algorithm, and these two terms should not be used interchangeably. **The model** encapsulates the way we perceive the world, and how conclusions or predictions should be made from the data (if available). This notion is somehow materialistic: 
in our example, it encompasses the parameter matrices $U$ and $V$, the description of how to identify animals in images, which mathematical functions to use for that purpose, and eventually a graphical illustration of the model with boxes and arrows. Moreover, the model also takes physical space, as it is necessarily stored in the computer's RAM whenever it is used. When downloading a large language model via HuggingFace [^7], you download a model, not an algorithm. An **algorithm** dictates how to use the model. In fact, each neural network has at least two algorithms related to it:
- The forward pass: computing outputs from the data (e.g., probabilities). To give you an idea, this algorithm is used every time you ask ChatGPT a question. In our example, the forward pass is simply about computing $\sigma(\sigma(XU)V)$, given a data matrix $X$.
- The training algorithm (e.g., "gradient descent", which builds on the backpropagation algorithm. This step is costly and requires collecting data beforehand.

Which brings me to the training phase. How can a neural network know which animal is shown on a picture? Well, it can't until you train it. Which means that before training, the model will simply give random answers. In our example, this is because $U$ and $V$, which must necessarily exist prior to the training phase, are initialized with random values. It is by trial-and-error that the model will learn how to perform better than random. But how to tell the model how wrong it is? We need two things:
- Annotations indicating, for each image and each animal species, whether the latter is present in the image. Let's say we have such annotations in the form of a matrix $Y$, where $Y_{ij}$ is 1 if the animal species $j$ is present in picture $i$, and 0 otherwise.
- A mathematical function, called *loss function*, that quantifies how wrong the model is on average.

The best choice for the loss function is the "binary cross-entropy" function, which is defined as follows:
$$
\ell = -\frac{1}{nc} \sum_i \sum_j Y_{ij} \log(\hat{Y}_{ij}) + (1 - Y_{ij}) \log(1 - \hat{Y}_{ij}),
$$
where $\hat{Y}_{ij} = \left(\sigma(\sigma(XU)V)\right)_{ij}$ is the probability of animal species $j$ being present in picture $i$, as estimated by the model.
It is easy to see that $\ell$ is equal to 0 when the model is always perfectly right: $Y_{ij} = \hat{Y}_{ij}$ for each $i$ and $j$ (which never happens in practice, for multiple reasons). On the other hand, $\ell$ can increase dramatically fast when $Y_{ij}$ and $\hat{Y}_{ij}$ start to differ.

During the training phase, the overall architecture looks like this:

<figure>
    <picture>
        <source srcset="/images/backpropagation-algorithm/dark/forward.svg" media="(prefers-color-scheme: dark)">
        <source srcset="/images/backpropagation-algorithm/light/forward.svg" media="(prefers-color-scheme: light)">
        <img src="/images/backpropagation-algorithm/dark/forward.svg" alt="MLP forward pass" />
    </picture>
</figure>

In case you noticed, I implicitly assumed that multiple animals can be found in a single image. This was made on purpose, so I did not have to introduce another activation function, called the Softmax function. What does that have to do with it? Well, assuming there is a single pictured animal, then the probabities should sum to one across species: $\sum_j \hat{Y}_{ij} = 1 \quad \forall i$. There is an activation function specifically designed for guaranteeing this constraint: Softmax. I will not go over the details, but the maths of Softmax are almost identical to the Sigmoid case.

Before we move on to the most technical part of this post, let's make a small modification to the previous figure. Let's combine the second Sigmoid function with the Loss function into a single function (a composition of the two), and represent the latter as a single block in this new figure:

<figure>
    <picture>
        <source srcset="/images/backpropagation-algorithm/dark/forward-combined.svg" media="(prefers-color-scheme: dark)">
        <source srcset="/images/backpropagation-algorithm/light/forward-combined.svg" media="(prefers-color-scheme: light)">
        <img src="/images/backpropagation-algorithm/dark/forward-combined.svg" alt="MLP forward pass" />
    </picture>
</figure>

Mathematically, it does not change anything, the new "Sigmoid$_2$ + Loss" block basically performs the 2 operations in a row, exactly as previously. The change is only conceptual, but will help us in the next section at two levels:
- Simplify derivatives and make the calculations less tedious.
- Allow more efficient implementations in practice (which is a consequence of the first point).

## How backpropagation works

### The chain rule and the backward pass

Do you remember how derivatives work? A partial derivative $\frac{\partial y}{\partial x}$ quantifies how much $y$ varies when $x$ varies by a small proportion. Assuming $z$ is a variable that depends on $y$, which in turns depends on $x$, the **chain rule**[^8] provides a formula for how $z$ is affected when $x$ changes:
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

**So if you were wondering how derivatives relate to neural networks, now is the time.** Computing the derivative of the loss function with respect to each parameter of the model is extremely insightful, as it reflects how the loss function would be affected by changing that parameter. Since our goal is to *minimize* the loss function (i.e. minimize the error), a simple approach would be to update each parameter in the *direction opposite to the derivative*.

Let's note that in our example, there are $m \times h$ parameter values in $U$, and $h \times c$ parameter values in $V$. For the sake of using the practitioners terminology, usually we don't say that we are "computing the $m \times h$ derivatives of $\ell$ with respect to each value of $U$", but simply "computing the gradient of $U$". I will denote the gradients of $U$ and $V$ by $\nabla U$ and $\nabla V$, respectively.

For now, let's abstract away some mathematical details from previous figures and simplify the notation using matrices $Z^{(1)}$, $Z^{(2)}$ and $Z^{(3)}$. Let's denote the loss function by $\ell$. The **backpropagation algorithm** consists in computing the gradients in the way depicted in the figure below:

<figure>
    <picture>
        <source srcset="/images/backpropagation-algorithm/dark/backprop-simplified.svg" media="(prefers-color-scheme: dark)">
        <source srcset="/images/backpropagation-algorithm/light/backprop-simplified.svg" media="(prefers-color-scheme: light)">
        <img src="/images/backpropagation-algorithm/dark/backprop-simplified.svg" alt="Simplified backpropagation" />
    </picture>
</figure>

This is precisely why the gradient estimation algorithm is called the backpropagation algorithm: because it propagates the information obtained at the end (the right) of the network back to the start (the left), computing the gradient of $U$ and $V$ along the way. This approach is valid because the chain rule can be applied on each function successively.

I represented the information passed from block to block as matrices $G^{(1)}$, $G^{(2)}$, $G^{(3)}$ and $G^{(4)}$. Let's apply the **chain rule** to find out what each of these matrices is. That's where the maths start to kick in.

### The "Sigmoid + Loss" building block

Let's start from the end, and compute the gradient of $\ell$ with respect to $Z_{ij}^{(3)}$. This is straightforward because $\ell$ depends on nothing but $Z_{ij}^{(3)}$. As a reminder, the last block combines both the Sigmoid function and the binary cross-entropy function:
$$
\ell = -\frac{1}{nc}\sum_i \sum_j Y_{ij} \log(\sigma(Z_{ij}^{(3)})) + (1 - Y_{ij}) \log(1 - \sigma(Z_{ij}^{(3)}))
$$
Before computing the derivative of $\ell$ with respect to $Z_{ij}^{(3)}$, let's bear in mind an important fact about the Sigmoid function. One of its interesting properties is the simplicity of its derivative:
$$
\frac{\partial \sigma(x)}{\partial x} = \sigma(x) (1 - \sigma(x)).
$$
With this new knowledge, calculating the derivatives turns out to be fairly simple:
$$
\begin{aligned}
\frac{\partial \ell}{\partial Z_{ij}^{(3)}} & = -\frac{1}{nc} \frac{\partial}{\partial Z_{ij}^{(3)}} \left( Y_{ij} \log(\sigma(Z_{ij}^{(3)})) + (1 - Y_{ij}) \log(1 - \sigma(Z_{ij}^{(3)})) \right) \\
& = -\frac{1}{nc} \left( Y_{ij} \frac{1}{\sigma(Z_{ij}^{(3)})} \frac{\partial \sigma(Z_{ij}^{(3)})}{\partial Z_{ij}^{(3)}} + (1 - Y_{ij}) \frac{-1}{1 - \sigma(Z_{ij}^{(3)})} \frac{\partial \sigma(Z_{ij}^{(3)})}{\partial Z_{ij}^{(3)}} \right) \\
& = -\frac{1}{nc} \left( Y_{ij} \frac{1}{\sigma(Z_{ij}^{(3)})} \sigma(Z_{ij}^{(3)}) \left( 1 - \sigma(Z_{ij}^{(3)}) \right) + (1 - Y_{ij}) \frac{-1}{1 - \sigma(Z_{ij}^{(3)})} \sigma(Z_{ij}^{(3)}) \left( 1 - \sigma(Z_{ij}^{(3)}) \right) \right) \\
& = -\frac{1}{nc} \left( Y_{ij} \left( 1 - \sigma(Z_{ij}^{(3)}) \right) - (1 - Y_{ij}) \sigma(Z_{ij}^{(3)}) \right) \\
& = q \left( \sigma(Z_{ij}^{(3)}) - Y_{ij} \right), \\
\end{aligned}
$$
where I defined the normalization factor $q := \frac{1}{nc}$ for notational convenience.

The derivative turns out to be simply the difference between the annotation and the estimated probability, multiplied by $q$. If, instead, we had calculated the derivatives for the loss function and the Sigmoid function separately, and multiplied them afterward, this would have resulted in unnecessary intermediate steps which would slow down neural networks in practice. Here, the implementation is made much more elegant and efficient by making a single building block out of a composition of two mathematical functions that are known to synergize very well. Famous deep learning libraries, such as PyTorch, are well aware of such optimizations, and propose dedicated building blocks with efficient implementations.

Now, let's rewrite the mathematical result we just found in matrix form (grouping all the individual partial derivatives in a single matrix $G^{(4)}$, which is easier to read:
$$
G^{(4)} = q \left( \sigma(Z^{(3)}) - Y \right).
$$

We end up with the following building block, which defines:
- The **forward pass**: how to compute the loss function from an input, showed by the arrows going from left to right in the figure below.
- The **backward pass**: how to compute the gradient of that input, showed by the arrow going from right to left.
To make it more obvious that the maths are the same regardless of the rest of the architecture of the model, I dropped the $^(3)$ from the $Z^(3)$ in the figure:

<figure>
    <picture>
        <source srcset="/images/backpropagation-algorithm/dark/backprop-final-block.svg" media="(prefers-color-scheme: dark)">
        <source srcset="/images/backpropagation-algorithm/light/backprop-final-block.svg" media="(prefers-color-scheme: light)">
        <img src="/images/backpropagation-algorithm/dark/backprop-final-block.svg" alt="Forward pass and backward pass of the final block" />
    </picture>
</figure>

If you've made it this far, congrats! The next sections will simply repeat the same logic on other building blocks, so there won't be much new.

### The "Fully connected" building block

The next step is computing the gradient of $\ell$ with respect to $Z^{(2)}$. Thanks to the chain rule, we know that $G^{(3)}$ relies on $G^{(4)}$. In other words, the derivative $\frac{\partial \ell}{\partial Z_{ij}^{(2)}}$ is necessarily based on the derivative $\frac{\partial \ell}{\partial Z_{ij}^{(3)}}$ which we computed in the previous section:

$$
\begin{aligned}
\frac{\partial \ell}{\partial Z_{ij}^{(2)}} & = \sum_k \sum_l \frac{\partial \ell}{\partial Z_{kl}^{(3)}} \frac{\partial Z_{kl}^{(3)}}{\partial Z_{ij}^{(2)}} \\
& = \sum_k \sum_l \frac{\partial \ell}{\partial Z_{kl}^{(3)}} \frac{\partial \left(\sum_r Z_{kr}^{(2)}V_{rl}\right)}{\partial Z_{ij}^{(2)}} \\
& = \sum_l \frac{\partial \ell}{\partial Z_{il}^{(3)}} \sum_r \frac{\partial \left(Z_{ir}^{(2)}V_{rl}\right)}{\partial Z_{ij}^{(2)}} \\
& = \sum_l \frac{\partial \ell}{\partial Z_{il}^{(3)}} V_{jl} \\
& = \sum_l \frac{\partial \ell}{\partial Z_{il}^{(3)}} V_{lj}^T \\
\end{aligned}
$$

In matrix form, it is equivalent to saying that:
$$
G^{(3)} = G^{(4)}V^T.
$$

Unfortunately, this does not give us what we are truly interested in, the gradient of our parameter matrix $V$, called $\nabla V$. For that purpose, we need to derive with respect to $V_{ij}$ instead. Again, using the chain rule:

$$
\begin{aligned}
\frac{\partial \ell}{\partial V_{ij}} & = \sum_k \sum_l \frac{\partial \ell}{\partial Z_{kl}^{(3)}} \frac{\partial Z_{kl}^{(3)}}{\partial V_{ij}} \\
& = \sum_k \sum_l \frac{\partial \ell}{\partial Z_{kl}^{(3)}} \frac{\partial \left(\sum_r Z_{kr}^{(2)}V_{rl}\right)}{\partial V_{ij}} \\
& = \sum_k \frac{\partial \ell}{\partial Z_{kj}^{(3)}} \sum_r \frac{\partial \left(Z_{kr}^{(2)}V_{rj}\right)}{\partial V_{ij}} \\
& = \sum_k \frac{\partial \ell}{\partial Z_{kj}^{(3)}} Z_{ki}^{(2)} \\
& = \sum_k \left(Z_{ik}^{(2)}\right)^T \frac{\partial \ell}{\partial Z_{kj}^{(3)}} \\
\end{aligned}
$$

In matrix form, this is equivalent to saying that:
$$
\nabla V = \left(Z^{(2)}\right)^T G^{(4)}.
$$

We now have a building block defining the forward pass, as well as the backward pass:

<figure>
    <picture>
        <source srcset="/images/backpropagation-algorithm/dark/backprop-fc-block.svg" media="(prefers-color-scheme: dark)">
        <source srcset="/images/backpropagation-algorithm/light/backprop-fc-block.svg" media="(prefers-color-scheme: light)">
        <img src="/images/backpropagation-algorithm/dark/backprop-fc-block.svg" alt="Forward pass and backward pass of the Fully Connected block" />
    </picture>
</figure>

Given an input $Z$, the output of the function is $ZV$. Given a gradient $G$ received during the backward pass, the gradient of parameter matrix $V$ is equal to $Z^T G$, and the gradient to be backpropagated is $GV^T$.

If you are into Python programming, I've co-developed a minimal Deep Learning library for educational purposes, called BGD. The forward and backward passes for the fully connected building block are defined in:
[https://github.com/AntoinePassemiers/Beyond-Gradient-Descent/blob/master/src/bgd/layers/fc.py](https://github.com/AntoinePassemiers/Beyond-Gradient-Descent/blob/master/src/bgd/layers/fc.py)

### The "Sigmoid" building block

Now comes the easiest block. From the previous sections, we already know the derivative of the Sigmoid function. Let's apply the chain rule one more time:

$$
\begin{aligned}
\frac{\partial \ell}{\partial Z_{ij}^{(1)}} & = \sum_k \sum_l \frac{\partial \ell}{\partial Z_{kl}^{(2)}} \frac{\partial Z_{kl}^{(2)}}{\partial Z_{ij}^{(1)}} \\
& = \sum_k \sum_l \frac{\partial \ell}{\partial Z_{kl}^{(2)}} \frac{\partial \sigma(Z_{kl}^{(1)})}{\partial Z_{ij}^{(1)}} \\
& = \frac{\partial \ell}{\partial Z_{ij}^{(2)}} \sigma(Z_{ij}^{(1)}) \left( 1 - \sigma(Z_{ij}^{(1)}) \right) \\
& = \frac{\partial \ell}{\partial Z_{ij}^{(2)}} \sigma'(Z_{ij}^{(1)}), \\
\end{aligned}
$$
where I defined $\sigma'(x) := \sigma(x) (1 - \sigma(x))$ for notational convenience. In matrix form, all this is the same as saying:
$$
G^{(2)} = G^{(3)} \odot \sigma'(Z^{(1)}).
$$

The Sigmoid building block is illustrated below:

<figure>
    <picture>
        <source srcset="/images/backpropagation-algorithm/dark/backprop-sigmoid-block.svg" media="(prefers-color-scheme: dark)">
        <source srcset="/images/backpropagation-algorithm/light/backprop-sigmoid-block.svg" media="(prefers-color-scheme: light)">
        <img src="/images/backpropagation-algorithm/dark/backprop-sigmoid-block.svg" alt="Forward pass and backward pass of the Sigmoid block" />
    </picture>
</figure>

The forward and backward passes for the Sigmoid building block are defined in BGD as well, if you are interested in the implementational details:
[https://github.com/AntoinePassemiers/Beyond-Gradient-Descent/blob/master/src/bgd/layers/activation.py](https://github.com/AntoinePassemiers/Beyond-Gradient-Descent/blob/master/src/bgd/layers/activation.py)

### No need to go deeper

There is one more block to go through: "Fully connected$_1$". However, it is mechanistically identical to "Fully connected$_2$", whose behavior was described in a previous section.

For the sake of completeness, here are the gradients:
$$
\begin{aligned}
G^{(1)} & = G^{(2)}U^T, \\
\nabla U & = X^T G^{(2)}.
\end{aligned}
$$

### Plugging the blocks together

Just for the sake of illustration, let's plug the formulas we found all together, so we have an idea of how the full gradients look like:

<figure>
    <picture>
        <source srcset="/images/backpropagation-algorithm/dark/full.svg" media="(prefers-color-scheme: dark)">
        <source srcset="/images/backpropagation-algorithm/light/full.svg" media="(prefers-color-scheme: light)">
        <img src="/images/backpropagation-algorithm/dark/full.svg" alt="MLP forward pass + backward pass" />
    </picture>
</figure>

We now have actual, ready-for-implementation formulas of the gradients:
$$
\begin{aligned}
\nabla U & = X^T q(\sigma(\sigma(XU)V) - Y) V^T \odot \sigma'(XU) \\
\nabla V & = \sigma(XU)^T q(\sigma(\sigma(XU)V) - Y) \\
\end{aligned}
$$

If you find this overwhelming, you can just forget about this figure. These formulas are never explicitly implemented in Deep Learning libraries, as only the inner workings of building blocks need to be defined, as we did in the previous sections.

## Training algorithms

### Gradient descent

I hope I haven't lost you along the way, because time has finally come to provide the big picture of how neural networks are actually trained. We already discussed all the steps involved in the training, but the training algorithm can come in different flavors. The most straightforward approach is called "gradient descent", and consists in repetitively updating the parameters by following the direction opposite to the loss function:

- Collect a data set in the form of a matrix $X$.
- Initialize matrices $U$ and $V$ with random values.
- Repeat until convergence:
  - Compute $\ell$ by performing the forward pass on $X$.
  - Obtain $\nabla U$ and $\nabla V$ during the backward pass.
  - Update the parameters:
    - Replace $U$ by $U - \lambda \nabla U$.
    - Replace $V$ by $V - \lambda \nabla V$.

$\lambda$ is called the learning rate, and determines how big of a step we take everytime the parameters are updated. To ensure the algorithm converges, $\lambda$ needs to be sufficiently small.

Note: Of course, the algorithm presented here is tailored to our example. In practice, complex models involve many more parameter matrices than just $U$ and $V$. In fact, they can involve more than matrices, typically **tensors**. The tensor is a generalization of matrices, where the dimensionality is not restricted to two (rows and columns). TensorFlow, an another famous deep learning library, takes its name from tensors.

You might wonder why it takes multiple steps to train the model, and why we couldn't just use a large value for $\lambda$, to speed things up and eventually solve the problem in a single step. The answer is simple: we can't. We shot ourselves in the foot by introducing activation functions and a loss function, which are non-linear by nature. Because of this non-linearity, the gradients $\nabla U$ and $\nabla V$ are not the same everywhere: their direction changes depending on the values of $U$ and $V$, and can even take opposite directions from one step to another.

<figure>
    <picture>
        <source srcset="/images/backpropagation-algorithm/dark/convergence.svg" media="(prefers-color-scheme: dark)">
        <source srcset="/images/backpropagation-algorithm/light/convergence.svg" media="(prefers-color-scheme: light)">
        <img src="/images/backpropagation-algorithm/dark/convergence.svg" alt="Convergence failure when learning rate is large" />
    </picture>
</figure>

The figure hereabove illustrates what happens when choosing a value for $\lambda$ that is too large. Because the illustration is in 2D, it only works for models having a single parameter, and not $m \times h$ + $h \times c$ like we have. But the explanation remains valid in 3D, 4D, etc. When following the direction of the derivative (the left-to-right direction, which corresponds to the slope) and making a small step, the loss function decreases. On the other hand, when $\lambda$ is too large, not only the loss function is no longer guaranteed to decrease, but it can also increase! Even worse, the parameter may end up in a region of the loss function where the slope is even steeper, therefore producing derivatives that are bigger in magnitude, resulting in bigger steps... which can trigger a snowball effect, make the training unstable, and ultimately result in mathematical errors and a critical failure of the program. The goal is to minimize the loss function, not to accidentally maximize it while trying to minimize it.

Practitioners usually recommend to use a small value for the learning rate $\lambda$ (for example $10^{-5}$), and only increase it if the algorithm is converging at an unreasonably slow pace.

### Stochastic gradient descent

A major drawback of the gradient descent algorithm is that it is extremely costly and inefficient when the data matrix $X$ is large. In practice, the "stochastic" version of the algorithm is used instead. The idea is to introduce some degree of randomization by using a subset of the rows of $X$ at each step. The number of rows is called the **batch size**. When the batch size is too large, the training is drastically slowed down. A contrario, when the batch size is too low, the gradients are based on too few data to be reliable or informative, and might just confuse the model. The rest of the algorithm remains exactly the same:

- Collect a data set in the form of a matrix $X$.
- Initialize matrices $U$ and $V$ with random values.
- Repeat until convergence:
  - Create a new matrix $X^{(b)}$ by taking a small and random subset of the rows found in $X$, called a batch.
  - Compute $\ell$ by performing the forward pass on $X^{(b)}$.
  - Obtain $\nabla U$ and $\nabla V$ during the backward pass.
  - Update the parameters:
    - Replace $U$ by $U - \lambda \nabla U$.
    - Replace $V$ by $V - \lambda \nabla V$.

### The Adam optimizer

To train more complex models, stochastic gradient descent is not enough, as the training becomes more hazardous. To stabilize the parameter updates across steps, it was suggested to share information between steps: each parameter update now depends on how we updated the parameter during the previous steps. Many approaches based on this idea were suggested, such as Momentum, Adadelta, Adagrad, ..., and the widely-used Adam optimizer [^9]. I will not go over the details, as understanding Adam is not a prerequisite to understanding deep learning. In any case, the mathematical details are much simpler than what I presented in this post.

## Summary

To summarize, we have seen that:
- Neural networks need activation functions to be able to adapt to any data.
- Complex problems require abstraction, which can be attained by stacking many layers with as few parameters as needed to solve these problems.
- Neural networks with too many parameters are prone to overfitting issues.
- The performance of the model on the data is assessed with a loss function, which must be minimized.
- Minimization requires taking the direction opposite to the gradient.
- The gradients can be estimated elegantly by applying the backpropagation algorithm, based on the chain rule.

There are many other concepts gravitating around this topic, which you can explore if you want to learn more, and become a Machine Learning practitioner yourself. Among these concepts, let me mention:
- All the building blocks available in Deep Learning libraries, such as **1D convolution**, **2D convolution**, **3D convolution**, **transformers**, **parametric activation functions**, **recurrent layers**, **1D max pooling**, **1D average pooling**, etc.
- **Regularization**, a mechanism used to alleviate overfitting issues.
- The **vanishing gradient** and **exploding gradient** issues. When neural networks have a large number of layers, they are essentially a composition of many functions, and gradients are products of many matrices (or tensors). In our example, $\nabla U = X^T q(\sigma(\sigma(XU)V) - Y) V^T \odot \sigma'(XU)$, which involves a lot of multiplications. When the number of layers is very large (e.g., larger than 20), the number of successive multiplications is so high that the gradients can become excessively small (vanishing gradient) or large (exploding gradient), leading to convergence issues. One solution is to have recourse to **residual connections**. Check out **residual neural networks** for more details.
- The **initialization** of parameters. I said that the latter should be random at the start of the training (which is true), but I didn't mention that there are particular ways to do it, using specific probability distributions.
- The other tasks that can be handled by neural networks. I presented how to solve a classification problem, but omitted the other main task: **regression**. Don't worry, the two tasks are very similar and the maths presented here can be trivially extended to the regression case.
- Peculiar architectures which are definitely worth explaining: **autoencoders**, **generative adversarial networks**, etc.

In any case, I hope you found this an interesting read, and that you learned a lot!


[^1]: https://en.wikipedia.org/wiki/Indian_peafowl
[^2]: Passemiers, Antoine, et al. "A quantitative benchmark of neural network feature selection methods for detecting nonlinear signals." _Scientific Reports_ 14 (2024): 31180.
[^3]: Cybenko, George. "Approximation by superpositions of a sigmoidal function." _Mathematics of control, signals and systems_ 2.4 (1989): 303-314.
[^4]: Brown, Tom, et al. "Language models are few-shot learners." _Advances in neural information processing systems_ 33 (2020): 1877-1901.
[^5]: LeCun, Yann, et al. "Backpropagation applied to handwritten zip code recognition." _Neural computation_ 1.4 (1989): 541-551.
[^6]: Vaswani, Ashish, et al. "Attention is all you need." _Advances in neural information processing systems_ 30 (2017).
[^7]: https://huggingface.co/
[^8]: https://en.wikipedia.org/wiki/Chain_rule
[^9]: Kingma, Diederik P., and Jimmy Ba. "Adam: A method for stochastic optimization." _arXiv preprint arXiv:1412.6980_ (2014).
